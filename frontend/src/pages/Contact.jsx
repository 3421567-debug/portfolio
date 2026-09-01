import { useState, useRef } from 'react'
import { FiMail, FiPhone, FiGithub, FiInstagram, FiDribbble } from 'react-icons/fi'
import './Contact.css'
import { asset } from '../utils/asset'

// 微信官方风格线框图标：双气泡 + 内部小圆点
function WeChatIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* 大聊天气泡 */}
      <path d="M8.8 3.5C5.1 3.5 2.2 6 2.2 9.2c0 1.9 1.1 3.6 2.9 4.7l-.6 2c-.1.3.1.6.4.6.2 0 .3-.1.5-.2l1.9-1.7c.6.1 1.2.2 1.9.2 3.7 0 6.6-2.5 6.6-5.6S12.5 3.5 8.8 3.5Z" />
      <circle cx="6.4" cy="9" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="9" cy="9" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="11.6" cy="9" r="0.7" fill="currentColor" stroke="none" />
      {/* 小聊天气泡 */}
      <path d="M16.3 12.4c-2.2 0-3.9 1.4-3.9 3.2 0 1.1.6 2 1.6 2.6l-.5 1.6c-.1.2 0 .4.2.5.1.1.4.1.5-.1l1.4-1.3c.5.1 1 .2 1.7.2 2.2 0 3.9-1.4 3.9-3.2s-1.7-3.5-3.9-3.5Z" />
      <circle cx="14.9" cy="15.6" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="17.3" cy="15.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

const contactItems = [
  {
    key: 'email',
    label: 'Email',
    labelZh: '邮箱',
    value: '3421567@qq.com',
    Icon: FiMail,
  },
  {
    key: 'mobile',
    label: 'Mobile',
    labelZh: '手机',
    value: '151-1234-6807',
    Icon: FiPhone,
  },
  {
    key: 'wechat',
    label: 'WeChat',
    labelZh: '微信',
    value: 'wwwlolcom',
    Icon: WeChatIcon,
  },
]

const socialLinks = [
  { icon: FiGithub, label: 'GitHub', href: '#' },
  { icon: FiInstagram, label: 'Instagram', href: '#' },
  { icon: FiDribbble, label: 'Dribbble', href: '#' },
]

export default function Contact() {
  const [toast, setToast] = useState(null) // { key, labelZh }
  const [selectedKey, setSelectedKey] = useState(null)
  const timerRef = useRef(null)

  const handleCopy = async (item) => {
    const text = item.value
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // 降级方案（非安全上下文 / 旧浏览器）
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* 忽略 */
      }
      document.body.removeChild(ta)
    }
    setToast({ key: item.key, labelZh: item.labelZh })
    setSelectedKey(item.key)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setToast(null)
      setSelectedKey(null)
    }, 1800)
  }

  return (
    <section className="contact-section" id="contact">
      <div className="contact-layout">
        <main className="contact-main">
          <h2 className="contact-title">
            <span className="contact-title-line">THANK</span>
            <span className="contact-title-line contact-title-accent">YOU！</span>
          </h2>

          <div className="contact-card">
            <div className="contact-card-inner">
              <div className="contact-list">
                <div className="contact-list-header">
                  <span className="contact-eyebrow">Contact</span>
                  <h3 className="contact-list-heading">联系方式</h3>
                </div>

                <div className="contact-list-body">
                  {contactItems.map((item) => (
                    <div
                      key={item.key}
                      className={`contact-list-row${selectedKey === item.key ? ' is-selected' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCopy(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleCopy(item)
                        }
                      }}
                    >
                      <span className="contact-list-label">
                        <item.Icon />
                        {item.label}
                      </span>
                      <span className="contact-list-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="contact-qr">
                <div className="contact-qr-frame">
                  <img src={asset('/wechat-qr.png')} alt="微信二维码" className="contact-qr-img" />
                </div>
                <span className="contact-qr-caption">Scan to add WeChat</span>
              </div>
            </div>
          </div>

          <div className="contact-social">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                className="contact-social-link"
                title={label}
                aria-label={label}
              >
                <Icon />
              </a>
            ))}
          </div>
        </main>
      </div>

      {toast && (
        <div className="contact-toast" role="status" aria-live="polite">
          <svg
            className="contact-toast-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          已复制 {toast.labelZh}
        </div>
      )}
    </section>
  )
}
