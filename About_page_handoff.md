# About 页面交付包（给 AI Agent 修改用）

> 本文件所有代码**逐字复制自项目原文件**，未做任何改写。修改后请按各段「文件路径」原样贴回对应文件。
> 项目路径前缀：`frontend/src/`

---

## 00 · 上下文说明（AI 必读）

- **这是一个单页（`About` 关于页）**，技术栈 React 19 + Vite。
- **你要修改的主页面**是：`pages/About.jsx` + `pages/About.css`（见第 01、02 段，标注 ★）。
- **依赖文件**（见第 03、04 段，标注 ⚠️）是共享组件/数据层，**除非用户明确要求，不要修改它们**，否则会影响其它页面。
- **数据来源**：`api.get('/about/')` 请求后端 `GET /api/about/`，返回的字段见下方「数据契约」。

### 数据契约（`/api/about/` 返回 JSON）
```jsonc
{
  "name": "姓名",
  "role": "职位（可含'/'分隔，如 '设计师/摄影师'）",
  "school": "毕业院校",
  "bio": "个人简介",
  "phone": "电话",
  "email": "邮箱",
  "location": "所在地",
  "avatar": "头像 URL 或 null",
  "zcool": "站酷主页或空串",
  "xiaohongshu": "小红书主页或空串",
  "douyin": "抖音主页或空串",
  "stat_experience": "7+",   // 数字+单位，用于滚动递增动画
  "stat_projects": "20+",
  "stat_pages": "3000+",
  "work_experiences":  [ { "period":"", "title":"", "company":"", "description":"" } ],
  "project_experiences":[ { "period":"", "title":"", "company":"", "description":"" } ],
  "awards": [ { "year":"", "name":"", "organization":"" } ]
}
```

### 机构 logo 映射（About.jsx 内联定义）
字节跳动→`/logos/bytedance.png`、中国移动→`/logos/chinamobile.png`、湖南卫视→`/logos/hunantv.png`、陕西科技大学→`/logos/sust.svg`。

---

## 01 ★ 主页面 — `pages/About.jsx`
```jsx
import { useState, useEffect, useRef } from 'react'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { IoSchoolOutline } from 'react-icons/io5'
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
  stat_experience: '7+', stat_projects: '20+', stat_pages: '3000+',
  work_experiences: [],
  project_experiences: [],
  awards: [],
}

export default function About() {
  const [about, setAbout] = useState(DEFAULT_ABOUT)

  useEffect(() => {
    api.get('/about/').then(setAbout).catch(() => {})
  }, [])

  return (
    <section className="about-section" id="about">
      <p className="section-tag about-tag">About</p>
      <div className="about-wrap">
        {/* ═══ 左栏：内容区 ═══ */}
        <div className="about-content">
          {/* 标题行：Hi I am XXX + 社交图标 */}
          <div className="hero-line">
            <h1 className="hero-name"><span className="name-hi">Hi,</span> I am Yangfan!</h1>
            <div className="hero-socials">
              {about.zcool && (<a href={about.zcool} target="_blank" rel="noreferrer" title="站酷"><SocialIconZcool /></a>)}
              {about.xiaohongshu && (<a href={about.xiaohongshu} target="_blank" rel="noreferrer" title="小红书"><SocialIconXhs /></a>)}
              {about.douyin && (<a href={about.douyin} target="_blank" rel="noreferrer" title="抖音"><SocialIconDy /></a>)}
            </div>
          </div>

          {/* 简介 */}
          <p className="hero-bio">{'\u3000\u3000'}{about.bio}</p>

          {/* 工作经历 */}
          {about.work_experiences.length > 0 && (
            <div className="exp-section">
              <span className="exp-tag">工作经历</span>
              <div className="timeline">
                {about.work_experiences.map((item, i) => (
                  <div key={i} className="tl-item">
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
            <div className="exp-section">
              <span className="exp-tag">实习经历</span>
              <div className="timeline">
                {about.project_experiences.map((item, i) => (
                  <div key={i} className="tl-item">
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
            <div className="exp-section">
              <span className="exp-tag">获奖经历</span>
              <div className="awards-row">
                {about.awards.map((item, i) => (
                  <span key={i} className="award-tag">
                    <b>{item.year}</b> · {item.name}{item.organization && ` · ${item.organization}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ 右栏：照片 + 学校 + 联系方式 + 指标 ═══ */}
        <div className="about-sidebar">
          <div className="photo-frame-wrap">
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
          <p className="school-info"><IoSchoolOutline className="school-cap" />{about.school}<span className="school-role"> / {about.role.split('/')[0]}</span></p>

          {/* 联系方式 */}
          <div className="contact-bar side-contact">
            <span className="contact-item"><FiPhone />{about.phone}</span>
            <span className="contact-divider" />
            <span className="contact-item"><FiMail />{about.email}</span>
          </div>

          {/* 坐标小卡 */}
          <div className="side-info">
            <div className="side-row"><FiMapPin /><span>{about.location}</span></div>
          </div>

          {/* 数据指标 */}
          <div className="stats-footer">
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
              <span className="sf-label">项目页面</span>
            </div>
          </div>

          {/* 技能图标 */}
          <div className="skill-icons-row">
            <img src="/skills/ps.png" alt="Photoshop" title="Photoshop" />
            <img src="/skills/ai.png" alt="Illustrator" title="Illustrator" />
            <img src="/skills/pt.png" alt="Premiere Pro" title="Premiere Pro" />
            <img src="/skills/codex.png" alt="Codex" title="Codex" />
            <img src="/skills/maya.png" alt="Maya" title="Maya" />
            <img src="/skills/zb.png" alt="ZBrush" title="ZBrush" />
          </div>
        </div>
      </div>
    </section>
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
```

---

## 02 ★ 主页面样式 — `pages/About.css`
```css
/* ═══════════════════════════════════════════
   About 页面 v5 — 左内容右照片 + 照片下方指标 + 技能横排
   深色背景 / About Me 徽章 / 药丸标签 / 时间线
   ═══════════════════════════════════════════ */

.about-section {
  padding: 70px 0 0;
  background: linear-gradient(135deg, #0c1929 0%, #0a0f1a 40%, #080c14 100%);
  color: #e2e8f0;
}

/* ABOUT 小蓝字 — 顶部居中（与 Works 风格一致） */
.about-tag {
  max-width: 1200px;
  margin: 0 auto 36px;
  text-align: center;
}

/* ── 主容器：左内容 | 右照片 ── */
.about-wrap {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 44px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px 40px;
  align-items: start;
}

/* ═══ 左栏：内容区 ═══ */

/* 标题行：Hi I am XXX! + 社交图标 */
.hero-line {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.hero-name {
  font-size: clamp(32px, 4.5vw, 52px);
  font-weight: 900;
  color: #f1f5f9;
  letter-spacing: -1px;
  line-height: 1.15;
}

/* Hi, 蓝色高亮 */
.name-hi {
  color: #508cd6;
}

/* 社交图标 — 圆形胶囊 */
.hero-socials {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.hero-socials a {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  color: #94a3b8;
  text-decoration: none;
  transition: all .2s ease;
}
.hero-socials a:hover {
  background: rgba(99,102,241,.25);
  border-color: rgba(99,102,241,.5);
  color: #a5b4fc;
  transform: translateY(-2px);
}

/* 简介 — 与下方经历描述文字左对齐 */
.hero-bio {
  font-size: 14px;
  line-height: 1.8;
  color: #94a3b8;
  margin-bottom: 24px;
  padding-left: 12px;
}

/* ── 经历区块 ── */
.exp-section { margin-bottom: 28px; }
.exp-section:last-child { margin-bottom: 0; }

/* 药丸标签（工作经历 / 实习经历） */
.exp-tag {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #e2e8f0;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  margin-bottom: 14px;
}

/* 时间线 */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  padding-left: 12px;
}

.tl-item {
  display: flex;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,.05);
  position: relative;
}
.tl-item:first-child { padding-top: 4px; }
.tl-item:last-child { border-bottom: none; }

.tl-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  border: 2px solid #0c1929;
  box-shadow: 0 0 0 3px rgba(59,130,244,.2);
  flex-shrink: 0;
  margin-top: 7px;
}

.tl-body { flex: 1; min-width: 0; }

.tl-period {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #60a5fa;
  text-transform: uppercase;
  margin-bottom: 3px;
}

.tl-job {
  font-size: 14.5px;
  font-weight: 600;
  color: #f1f5f9;
  line-height: 1.3;
  margin-bottom: 2px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.tl-co {
  font-weight: 600;
  color: #f1f5f9;
  font-size: 14.5px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

/* 机构 logo — 时间线中内联显示（png 透明图标，不加底色） */
.org-logo {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  object-fit: contain;
  vertical-align: -3px;
  margin-right: 6px;
}
.school-logo {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  vertical-align: -4px;
}

.tl-desc {
  font-size: 12.5px;
  color: #94a3b8;
  line-height: 1.65;
  margin-top: 2px;
}

/* ── 获奖经历 ── */
.awards-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.award-tag {
  display: inline-flex;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 12.5px;
  color: #cbd5e1;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
}
.award-tag b { color: #60a5fa; font-weight: 700; }

/* ═══ 右栏：照片 + 联系 + 指标 ═══ */
.about-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 照片框外层 — 不倾斜，仅提供居中定位与尺寸上下文 */
.photo-frame-wrap {
  position: relative;
  width: 300px;
  max-width: 100%;
  margin: 0 auto;
}

/* 白边圆角照片卡 — 作为 TiltedCard 的 children，整体随卡片一起倾斜 */
.photo-card {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  border-radius: 20px;
  padding: 10px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(0,0,0,.35);
}

/* 头像图 — 充满白卡内容区 */
.photo-card-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

/* About Me 徽章 — 简约线性玻璃胶囊 */
.photo-badge {
  position: absolute;
  top: -14px;
  left: 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 12px;
  background: rgba(12, 18, 30, .55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: 999px;
  color: #e2e8f0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  z-index: 3;
}
/* 前置 accent 圆点 */
.photo-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  box-shadow: 0 0 8px rgba(99, 102, 241, .65);
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  font-weight: 800;
  color: #94a3b8;
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
}

/* 学校信息 */
.school-info {
  margin-top: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  font-size: 13px;
  color: #cbd5e1;
  white-space: nowrap;
  letter-spacing: .5px;
}
/* 学士帽图标 — 蓝色线框，与电话/邮箱图标风格一致 */
.school-cap {
  color: #60a5fa;
  font-size: 15px;
  margin-right: 8px;
  flex-shrink: 0;
}
.school-role {
  color: #64748b;
  font-size: 12.5px;
}

/* 联系方式 — 照片右侧（在右栏内，紧凑居中） */
.contact-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 18px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  background: rgba(255,255,255,.03);
  width: 100%;
  max-width: 320px;
  justify-content: center;
  margin-top: 12px;
}
.side-contact { margin-bottom: 0; }

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #cbd5e1;
}
.contact-item svg { color: #60a5fa; font-size: 15px; flex-shrink: 0; }

.contact-divider {
  width: 1px;
  height: 16px;
  background: rgba(255,255,255,.12);
  flex-shrink: 0;
}

/* 坐标小卡 */
.side-info {
  margin-top: 10px;
  padding: 8px 18px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px;
  width: 100%;
  max-width: 320px;
}
.side-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #94a3b8;
  justify-content: center;
}
.side-row svg { color: #60a5fa; font-size: 14px; }

/* ── 数据指标 — 固定在照片下面 ── */
.stats-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  width: 100%;
  max-width: 320px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,.1);
}

.sf-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.sf-item + .sf-item {
  border-left: 1px solid rgba(255,255,255,.1);
}

.sf-num {
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 900;
  color: #f1f5f9;
  letter-spacing: -1px;
  line-height: 1;
  font-family: 'SF Mono', 'JetBrains Mono', 'Consolas', monospace;
}

/* 数字后的单位（年 / +） */
.sf-unit {
  font-size: 0.55em;
  font-weight: 700;
  font-style: normal;
  color: #94a3b8;
  margin-left: 2px;
  letter-spacing: 0;
  font-family: inherit;
}

.sf-label {
  font-size: 11px;
  color: #64748b;
  letter-spacing: 2px;
  font-weight: 500;
}

/* ═══ 技能图标行 ═══ */
.skill-icons-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  width: 100%;
  max-width: 340px;
}

.skill-icons-row img {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  object-fit: contain;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  padding: 4px;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.skill-icons-row img:hover {
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 8px 24px rgba(0,0,0,.35);
  border-color: rgba(255,255,255,.2);
}

/* ═══ 响应式 ═══ */

@media (max-width: 1060px) {
  .about-wrap {
    grid-template-columns: 1fr 300px;
    gap: 40px;
    padding: 0 32px 44px;
  }
  .photo-frame-wrap { transform: scale(.8125); transform-origin: top center; }
  .contact-bar, .side-info, .stats-footer { max-width: 260px; }
  .skill-icons-row { max-width: 260px; gap: 8px; }
  .skill-icons-row img { width: 40px; height: 40px; }
}

@media (max-width: 820px) {
  .about-section { padding: 80px 0 0; }
  .about-wrap {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 0 24px 36px;
  }
  .about-sidebar {
    position: static;
    align-items: center;
  }
  .photo-frame-wrap { transform: scale(.75); transform-origin: top center; }
  .contact-bar, .side-info, .stats-footer { max-width: 300px; }
  .skill-icons-row { max-width: 300px; }
}

@media (max-width: 520px) {
  .about-section { padding: 64px 0 0; }
  .about-wrap { padding: 0 16px 28px; }
  .hero-name { font-size: 28px; }
  .hero-line { flex-direction: column; align-items: flex-start; gap: 10px; }
  .photo-frame-wrap { transform: scale(.625); transform-origin: top center; }
  .contact-bar { flex-direction: column; gap: 8px; }
  .contact-divider { display: none; }
  .sf-num { font-size: 22px; }
  .stats-footer { max-width: 240px; }
}

/* ═══ 爱心点击特效已移除（23:42） ═══ */
```

---

## 03 ⚠️ 依赖（共享组件，勿改除非用户要求）— `components/TiltedCard/TiltedCard.jsx`
```jsx
import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import './TiltedCard.css';

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2
};

export default function TiltedCard({
  imageSrc,
  altText = 'Tilted card image',
  captionText = '',
  containerHeight = '300px',
  containerWidth = '100%',
  imageHeight = '300px',
  imageWidth = '300px',
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = true,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
  children = null,
  className = '',
  style = {}
}) {
  const ref = useRef(null);

  const x = useMotionValue();
  const y = useMotionValue();
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1
  });

  const [lastY, setLastY] = useState(0);

  function handleMouse(e) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      ref={ref}
      className={`tilted-card-figure ${className}`.trim()}
      style={{
        height: containerHeight,
        width: containerWidth,
        ...style
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="tilted-card-mobile-alert">This effect is not optimized for mobile. Check on desktop.</div>
      )}

      <motion.div
        className="tilted-card-inner"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale
        }}
      >
        {children ? (
          children
        ) : (
          <motion.img
            src={imageSrc}
            alt={altText}
            className="tilted-card-img"
            style={{
              width: imageWidth,
              height: imageHeight
            }}
          />
        )}

        {displayOverlayContent && overlayContent && (
          <motion.div className="tilted-card-overlay">{overlayContent}</motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="tilted-card-caption"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
```

---

## 04 ⚠️ 依赖（数据层，勿改除非用户要求）— `api/index.js`
```js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('API Error:', err)
    return Promise.reject(err)
  }
)

export default api
```

---

## 05 ⚠️ 依赖样式（TiltedCard 引用，勿改除非用户要求）— `components/TiltedCard/TiltedCard.css`
```css
.tilted-card-figure {
  position: relative;
  width: 100%;
  height: 100%;
  perspective: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tilted-card-mobile-alert {
  position: absolute;
  top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  display: none;
}

@media (max-width: 640px) {
  .tilted-card-mobile-alert {
    display: block;
  }
  .tilted-card-caption {
    display: none;
  }
}

.tilted-card-inner {
  position: relative;
  transform-style: preserve-3d;
}

.tilted-card-img {
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
  border-radius: 15px;
  will-change: transform;
  transform: translateZ(0);
}

.tilted-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  will-change: transform;
  transform: translateZ(30px);
}

.tilted-card-caption {
  pointer-events: none;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 4px;
  background-color: #fff;
  padding: 4px 10px;
  font-size: 10px;
  color: #2d2d2d;
  opacity: 0;
  z-index: 3;
}
```

---

## 应用修改回项目的做法
1. 让 AI 只输出 **第 01、02 段（★ 主页面）** 的改动后完整内容。
2. 把 01 段贴回 `frontend/src/pages/About.jsx`，02 段贴回 `frontend/src/pages/About.css`。
3. 若 AI 确实改了 ⚠️ 依赖段（如要调整卡片倾斜幅度），单独确认后再贴回对应路径。
4. 运行 `cd frontend && npm run dev` 验证（端口 3000，代理 /api → 8000）。
