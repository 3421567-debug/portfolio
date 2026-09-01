import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Aurora from './Aurora'
import FloatingIcons from './FloatingIcons'
import GradientText from './GradientText/GradientText'
import './Hero.css'
import { asset } from '../utils/asset'

// 从后台配置的渐变字符串里提取颜色数组（供 GradientText 流动渐变使用）
function parseGradientColors(str) {
  if (!str) return null
  const matches = str.match(/#[0-9a-fA-F]{3,8}/g)
  return matches && matches.length ? matches : null
}

// 去掉绝对地址的 host，走 Vite 代理（同源 /media/...），避免跨域/混合内容问题
function stripHost(url) {
  if (!url) return ''
  return url.replace(/^https?:\/\/[^/]+/, '')
}

export default function Hero() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [iconHover, setIconHover] = useState(false)
  const [config, setConfig] = useState(null)
  const [theme, setTheme] = useState(() =>
    (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'dark'
  )

  useEffect(() => {
    let active = true
    axios.get('/api/hero-config/')
      .then((res) => { if (active) setConfig(res.data) })
      .catch((err) => console.error('加载首页配置失败', err))
    return () => { active = false }
  }, [])

  // 跟随主题切换（导航栏切换 data-theme）实时应用对应渐变
  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setTheme(root.getAttribute('data-theme') || 'dark')
    })
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  // 标题随鼠标做 3D 倾斜（页面原有的基础交互，保留）
  const handleMouseMove = useCallback((e) => {
    if (iconHover) return
    const x = (e.clientX / window.innerWidth - 0.5) * 2
    const y = (e.clientY / window.innerHeight - 0.5) * 2
    setTilt({ x: -y * 3, y: x * 3 })
  }, [iconHover])

  // 浅色 / 深色页面各自独立的标题渐变色（供流动渐变组件使用）
  const gradientColors = config
    ? (parseGradientColors(
        theme === 'light'
          ? (config.title_gradient_light || config.title_gradient)
          : (config.title_gradient_dark || config.title_gradient)
      ) || ['#60a5fa', '#93c5fd', '#60a5fa'])
    : ['#60a5fa', '#93c5fd', '#60a5fa']

  // 标题基础样式：仅保留字体与字号，渐变由 GradientText 接管
  const titleStyle = config ? {
    fontFamily: config.title_font_family || undefined,
    fontSize: `clamp(56px, 11vw, ${config.title_size || 168}px)`,
  } : undefined

  const line1 = config?.title_line1 || 'Design'
  const line2 = config?.title_line2 || 'Portfolio'
  const bgType = config?.bg_type || 'none'
  const bgImage = stripHost(config?.bg_image)
  const bgVideo = stripHost(config?.bg_video)
  const bgPoster = stripHost(config?.bg_video_poster)

  return (
    <section
      className="hero"
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      {/* 背景层：图片 / 视频（在极光之下） */}
      <div className="hero-video-placeholder">
        {bgType === 'image' && bgImage && (
          <img className="hero-bg-media" src={asset(bgImage)} alt="" />
        )}
        {bgType === 'video' && bgVideo && (
          <video
            className="hero-bg-media"
            src={asset(bgVideo)}
            poster={bgPoster ? asset(bgPoster) : undefined}
            autoPlay
            muted
            loop
            playsInline
          />
        )}
      </div>

      {/* 流光极光背景（WebGL 着色器） */}
      <div className="hero-aurora">
        <Aurora
          colorStops={['#0b1e4d', '#2563eb', '#22d3ee']}
          amplitude={1.1}
          blend={0.72}
          speed={2}
        />
      </div>

      <div className="hero-overlay" />

      {/* 漂浮图标 */}
      <FloatingIcons onHoverChange={setIconHover} />

      <div className="hero-content container">
        <div
          className="hero-tilt"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          <h1 key={`title-1-${theme}`} className="hero-title" style={titleStyle}>
            <GradientText
              colors={gradientColors}
              animationSpeed={5}
              direction="horizontal"
              className="hero-gradient"
            >
              {line1}
            </GradientText>
          </h1>
          <h1 key={`title-2-${theme}`} className="hero-title" style={titleStyle}>
            <GradientText
              colors={gradientColors}
              animationSpeed={5}
              direction="horizontal"
              className="hero-gradient"
            >
              {line2}
            </GradientText>
          </h1>
        </div>
      </div>

      <div className="hero-scroll">
        <span className="scroll-text">Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}
