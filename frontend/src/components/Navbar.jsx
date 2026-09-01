import { useState, useEffect } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import './Navbar.css'
import { asset } from '../utils/asset'

const NAV_ITEMS = [
  { label: '首页', id: 'hero' },
  { label: '关于', id: 'about' },
  { label: '作品', id: 'works' },
  { label: '联系', id: 'contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState('hero')
  const { isDark, toggleTheme } = useTheme()

  // 滚动监听：吸顶效果 + 当前 section 高亮
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      // 判断当前在哪个 section
      const sections = NAV_ITEMS.map(item => document.getElementById(item.id)).filter(Boolean)
      const scrollPos = window.scrollY + window.innerHeight / 3

      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= scrollPos) {
          setActiveId(NAV_ITEMS[i].id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <img
        src={asset('/logo.webp')}
        alt="Logo"
        className="nav-logo"
        onClick={() => scrollTo('hero')}
      />
      <ul className="nav-links">
        {NAV_ITEMS.map(({ label, id }) => (
          <li key={id}>
            <button
              className={`nav-link ${activeId === id ? 'active' : ''}`}
              onClick={() => scrollTo(id)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
      <div className="nav-right">
        <button className="theme-toggle" onClick={toggleTheme} title={isDark ? '切换浅色模式' : '切换暗色模式'}>
          {isDark ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </nav>
  )
}
