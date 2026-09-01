import { useState, useEffect, useRef, useMemo } from 'react'
import api from '../api'
import './FloatingIcons.css'
import { asset } from '../utils/asset'

// 各特效的总时长（与 CSS 动画时长保持一致，到点自动卸载）
const EFFECT_DURATION = { finder: 1400, folder: 1200, terminal: 2800 }

// 文件小方块色板（文件夹抖落用）
const FILE_COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#22d3ee', '#fb7185']

export default function FloatingIcons({ onHoverChange }) {
  const [icons, setIcons] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [flash, setFlash] = useState(false)
  const [flashKey, setFlashKey] = useState(0)
  const [active, setActive] = useState(null) // 'finder' | 'folder' | 'terminal' | null
  const [effectKey, setEffectKey] = useState(0)
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  const timer = useRef(null)

  useEffect(() => {
    let active = true
    api.get('/hero-icons/')
      .then((data) => {
        if (active) {
          setIcons(Array.isArray(data) ? data : [])
          setLoaded(true)
        }
      })
      .catch((err) => {
        console.error('加载首页图标失败', err)
        if (active) setLoaded(true)
      })
    return () => { active = false }
  }, [])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const triggerFlash = () => {
    setFlashKey((k) => k + 1)
    setFlash(true)
  }

  const triggerEffect = (type, e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
    setEffectKey((k) => k + 1)
    setActive(type)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setActive(null), EFFECT_DURATION[type])
  }

  // 文件夹「文件抖落」小动画：从图标处掉落的彩色小方块（每次播放重新随机）
  const dropFiles = useMemo(() => {
    const n = 7
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      dx: (Math.random() * 2 - 1) * 90,         // 左右散开（px）
      dy: 60 + Math.random() * 120,             // 下落距离（px）
      dr: (Math.random() * 2 - 1) * 60,         // 旋转（deg）
      delay: (Math.random() * 0.22).toFixed(2), // 错开抖落
      bg: FILE_COLORS[i % FILE_COLORS.length],
    }))
  }, [effectKey])

  if (!loaded || icons.length === 0) return null

  return (
    <div className="floating-icons">
      {/* 相机：整屏闪白（闪光灯） */}
      {flash && (
        <div
          key={flashKey}
          className="camera-flash"
          onAnimationEnd={() => setFlash(false)}
        />
      )}

      {/* 访达：全屏冲击波（从图标位置向外扩散的环形光波 + 提亮） */}
      {active === 'finder' && (
        <div
          key={`f-${effectKey}`}
          className="finder-shock"
          style={{ '--ox': `${origin.x}px`, '--oy': `${origin.y}px` }}
        >
          <div className="shock-flash" />
          <div className="shock-ring" />
          <div className="shock-ring shock-ring--2" />
        </div>
      )}

      {/* 文件夹：局部文件抖落（彩色小方块从图标处抖落飘下） */}
      {active === 'folder' && (
        <div
          key={`fo-${effectKey}`}
          className="folder-drop"
          style={{ '--ox': `${origin.x}px`, '--oy': `${origin.y}px` }}
        >
          {dropFiles.map((f) => (
            <div
              key={f.id}
              className="drop-file"
              style={{
                '--dx': `${f.dx}px`,
                '--dy': `${f.dy}px`,
                '--dr': `${f.dr}deg`,
                background: f.bg,
                animationDelay: `${f.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 终端：打字机（黑底绿字终端窗口从图标处弹出，逐字打印命令并输出，末尾闪烁光标） */}
      {active === 'terminal' && (
        <div
          key={`t-${effectKey}`}
          className="terminal-box"
          style={{ left: `${origin.x}px`, top: `${origin.y}px` }}
        >
          <div className="term-bar">
            <span className="term-dot term-red" />
            <span className="term-dot term-yellow" />
            <span className="term-dot term-green" />
          </div>
          <div className="term-screen">
            <div className="term-line">
              <span className="term-prompt">~ </span>
              <span className="term-cmd">whoami</span>
            </div>
            <div className="term-line">
              <span className="term-out">yangfan</span>
              <span className="term-cursor" />
            </div>
          </div>
        </div>
      )}

      {icons.map((icon, i) => (
        <img
          key={icon.key}
          className={`float-icon is-clickable${icon.key === 'terminal' && active === 'terminal' ? ' is-hidden' : ''}`}
          src={asset(icon.image.replace(/^https?:\/\/[^/]+/, ''))}
          alt={icon.label}
          draggable={false}
          style={{
            left: `${icon.pos_x}%`,
            top: `${icon.pos_y}%`,
            width: `${icon.width}px`,
            zIndex: icon.z_index,
            '--rot': `${(icon.rotation || 0)}deg`,
            // 进场动画错峰：依次淡入上浮
            animationDelay: `${0.18 * i + 0.25}s`,
          }}
          onMouseEnter={() => onHoverChange?.(true)}
          onMouseLeave={() => onHoverChange?.(false)}
          onClick={
            icon.key === 'camera' ? triggerFlash
            : icon.key === 'finder' ? (e) => triggerEffect('finder', e)
            : icon.key === 'folder' ? (e) => triggerEffect('folder', e)
            : icon.key === 'terminal' ? (e) => triggerEffect('terminal', e)
            : undefined
          }
        />
      ))}
    </div>
  )
}
