import { useState, useEffect, useRef } from 'react'
import { FiMail, FiPhone } from 'react-icons/fi'
import api from '../api'
import './About.css'
import TiltedCard from '../components/TiltedCard/TiltedCard'

const ORG_LOGOS = {
  '字节跳动': '/logos/bytedance.png',
  '中国移动': '/logos/chinamobile.png',
  '湖南卫视': '/logos/hunantv.png',
  '陕西科技大学': '/logos/sust.svg',
}
function orgLogo(name) {
  if (!name) return null
  for (const key in ORG_LOGOS) {
    if (name.includes(key)) return ORG_LOGOS[key]
  }
  return null
}

const DEFAULT_ABOUT = {
  name: '加载中...', role: '', school: '', bio: '', phone: '', email: '', location: '',
  avatar: null,
  zcool: '', xiaohongshu: '', douyin: '',
  stat_experience: '7+', stat_projects: '20+', stat_pages: '5+',
  work_experiences: [],
  project_experiences: [],
  awards: [],
}

export default function About() {
  const [about, setAbout] = useState(DEFAULT_ABOUT)
  const [inView, setInView] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    api.get('/about/').then(setAbout).catch(() => {})
  }, [])

  // 滚动进入视口时触发标题打字 + 各元素进场动画（只触发一次）
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { setInView(true); return }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { setInView(true); io.disconnect() }
      }),
      { threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // 进场动画错峰延迟
  const d = (s) => ({ transitionDelay: `${s}s` })

  return (
    <section ref={sectionRef} className={`about-section${inView ? ' is-inview' : ''}`} id="about">
      <p className="section-tag about-tag reveal text-sweep shine" style={d(0)}>About</p>
      <div className="about-wrap">
        {/* ═══ 左栏：内容区 ═══ */}
        <div className="about-content">
          {/* 标题行：打字特效 Hi I am XXX + 社交图标 */}
          <div className="hero-line">
            <TypingName start={inView} />
            <div className="hero-socials reveal" style={d(1.05)}>
              {about.zcool && (<a href={about.zcool} target="_blank" rel="noreferrer" title="站酷"><SocialIconZcool /></a>)}
              {about.xiaohongshu && (<a href={about.xiaohongshu} target="_blank" rel="noreferrer" title="小红书"><SocialIconXhs /></a>)}
              {about.douyin && (<a href={about.douyin} target="_blank" rel="noreferrer" title="抖音"><SocialIconDy /></a>)}
            </div>
          </div>

          {/* 简介 */}
          <p className="hero-bio reveal" style={d(0.15)}>{about.bio}</p>

          {/* 工作经历 */}
          {about.work_experiences.length > 0 && (
            <div className="exp-section reveal" style={d(0.2)}>
              <span className="exp-tag text-sweep">工作经历</span>
              <div className="timeline">
                {about.work_experiences.map((item, i) => (
                  <div key={i} className="tl-item reveal" style={d(0.3 + i * 0.07)}>
                    <span className="tl-dot" />
                    <div className="tl-body">
                      <p className="tl-period">{item.period}</p>
                      <h4 className="tl-job">{item.company && orgLogo(item.company) && <img className="org-logo" src={orgLogo(item.company)} alt="" />}{item.title}{item.company && (<span className="tl-co"> / {item.company}</span>)}</h4>
                      <p className="tl-desc">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 实习经历 */}
          {about.project_experiences.length > 0 && (
            <div className="exp-section reveal" style={d(0.38)}>
              <span className="exp-tag text-sweep">实习经历</span>
              <div className="timeline">
                {about.project_experiences.map((item, i) => (
                  <div key={i} className="tl-item reveal" style={d(0.48 + i * 0.07)}>
                    <span className="tl-dot" />
                    <div className="tl-body">
                      <p className="tl-period">{item.period}</p>
                      <h4 className="tl-job">{item.company && orgLogo(item.company) && <img className="org-logo" src={orgLogo(item.company)} alt="" />}{item.title}{item.company && (<span className="tl-co"> / {item.company}</span>)}</h4>
                      <p className="tl-desc">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 获奖经历 */}
          {about.awards.length > 0 && (
            <div className="exp-section reveal" style={d(0.56)}>
              <span className="exp-tag text-sweep">获奖经历</span>
              <div className="awards-row">
                {about.awards.map((item, i) => (
                  <span key={i} className="award-tag reveal" style={d(0.66 + i * 0.06)}>
                    <b>{item.year}</b> · {item.name}{item.organization && ` · ${item.organization}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ 右栏：照片 + 学校 + 联系方式 + 指标 ═══ */}
        <div className="about-sidebar">
          <div className="photo-frame-wrap reveal-soft" style={d(0.1)}>
            <TiltedCard
              rotateAmplitude={10}
              scaleOnHover={1.08}
              showMobileWarning={false}
              showTooltip={false}
              containerHeight="410px"
              containerWidth="300px"
              imageHeight="410px"
              imageWidth="300px"
            >
              <div className="photo-card">
                <span className="photo-badge">About Me</span>
                {about.avatar ? (
                  <img src={about.avatar} alt={about.name} className="photo-card-img" />
                ) : (
                  <div className="photo-placeholder">{about.name.slice(0, 3).toUpperCase() || 'FAN'}</div>
                )}
              </div>
            </TiltedCard>
          </div>
          {/* 个人资料卡：学校 + 坐标 + 联系方式 整合 */}
          <div className="about-meta reveal" style={d(0.22)}>
            <div className="meta-row">
              <i className="iconfont icon-xueshimao meta-ico" />
              <span className="meta-text meta-school-name">{about.school}</span>
              {about.role && (
                <>
                  <span className="meta-sep" />
                  <span className="meta-sub">
                    <i className="iconfont icon-sheji-xianxing meta-ico meta-design-ico" />
                    {about.role.trim()}
                  </span>
                </>
              )}
            </div>
            <div className="meta-row meta-contact">
              <span className="meta-contact-item"><FiPhone className="meta-ico" />{about.phone}</span>
              <span className="meta-sep" />
              <span className="meta-contact-item"><FiMail className="meta-ico" />{about.email}</span>
            </div>
          </div>

          {/* 数据指标 */}
          <div className="stats-footer reveal" style={d(0.36)}>
            <div className="sf-item">
              <span className="sf-num"><StatNum value={about.stat_experience} /></span>
              <span className="sf-label">经验年数</span>
            </div>
            <div className="sf-item">
              <span className="sf-num"><StatNum value={about.stat_projects} /></span>
              <span className="sf-label">落地项目</span>
            </div>
            <div className="sf-item">
              <span className="sf-num"><StatNum value={about.stat_pages} /></span>
              <span className="sf-label">年度A绩效</span>
            </div>
          </div>

          {/* 技能图标 */}
          <div className="skill-icons-row reveal" style={d(0.5)}>
            {[
              { src: '/skills/ps.png', alt: 'Photoshop', title: 'Photoshop' },
              { src: '/skills/ai.png', alt: 'Illustrator', title: 'Illustrator' },
              { src: '/skills/pt.png', alt: 'Premiere Pro', title: 'Premiere Pro' },
              { src: '/skills/codex.png', alt: 'Codex', title: 'Codex' },
              { src: '/skills/maya.png', alt: 'Maya', title: 'Maya' },
              { src: '/skills/zb.png', alt: 'ZBrush', title: 'ZBrush' },
            ].map((s, i) => (
              <img
                key={s.alt}
                src={s.src}
                alt={s.alt}
                title={s.title}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── 标题打字特效：滚动进入视口后逐字打出，Hi, 蓝色高亮 + 闪烁光标 ── */
function TypingName({
  start,
  full = 'Hi, I am Yangfan!',
  prefix = 'Hi,',
  prefixClass = 'name-hi',
  speed = 110,
}) {
  const [shown, setShown] = useState('')
  const [hideCursor, setHideCursor] = useState(false)

  useEffect(() => {
    if (!start) return
    // 尊重「减少动态效果」系统偏好：直接显示完整文本
    const reduce = typeof window !== 'undefined' && window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setShown(full); setHideCursor(true); return }

    setShown('')
    setHideCursor(false)
    let i = 0
    let id
    const begin = setTimeout(() => {
      id = setInterval(() => {
        i += 1
        setShown(full.slice(0, i))
        if (i >= full.length) clearInterval(id)
      }, speed)
    }, 500)
    return () => { clearTimeout(begin); clearInterval(id) }
  }, [start, full, speed])

  // 打完字后光标继续闪烁 3 秒，然后消失
  useEffect(() => {
    if (shown.length >= full.length) {
      const t = setTimeout(() => setHideCursor(true), 3000)
      return () => clearTimeout(t)
    }
  }, [shown, full])

  // 前缀（Hi,）在打字过程中始终显示为蓝色，避免先白字再变蓝
  const blueLen = prefix ? Math.min(prefix.length, shown.length) : 0
  const bluePart = shown.slice(0, blueLen)
  const restPart = shown.slice(blueLen)
  return (
    <h1 className="hero-name">
      {bluePart && <span className={prefixClass}>{bluePart}</span>}
      {restPart}
      {hideCursor ? null : <span className="tw-cursor" />}
    </h1>
  )
}

/* ── 数字翻动特效：滚动到可视区时从 0 递增到目标值 ── */
function StatNum({ value }) {
  const str = String(value ?? '')
  const m = str.match(/^(\d+)(.*)$/)
  const target = m ? parseInt(m[1], 10) : 0
  const suffix = m ? m[2] : str
  const [n, setN] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true
            const dur = 1300
            const t0 = performance.now()
            const step = (now) => {
              const p = Math.min(1, (now - t0) / dur)
              const ease = 1 - Math.pow(1 - p, 3) // easeOutCubic
              setN(Math.floor(ease * target))
              if (p < 1) requestAnimationFrame(step)
              else setN(target)
            }
            requestAnimationFrame(step)
          }
        })
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  return <span ref={ref}>{n}{suffix}</span>
}

/* ── 社交图标 ── */
function SocialIconZcool() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><rect width="24" height="24" rx="6" fill="#3b82f6"/><text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">Z</text></svg>
}
function SocialIconXhs() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><rect width="24" height="24" rx="6" fill="#ff2442"/><circle cx="12" cy="10" r="4" fill="#fff"/><path d="M8 17c0-2 2-3 4-3s4 1 4 3" fill="#fff"/></svg>
}
function SocialIconDy() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><rect width="24" height="24" rx="6" fill="#161823"/><path d="M10 9l5 3-5 3V9z" fill="#fefefe"/></svg>
}
