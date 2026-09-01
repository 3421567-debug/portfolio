import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import api from '../api'
import './Works.css'

// 画廊组件仅在用户点开某个分类时才需要，懒加载拆为独立 chunk，缩小首屏 JS
const WorkGallery = lazy(() => import('../components/WorkGallery'))

// ═══ 每个分类：强调色 + 英文标题 + 描述（套用 gpt网页 卡片设计）═══
const CATEGORY_CONFIG = {
  portrait:  {
    color: '#9d57ff',     // 紫罗兰
    enTitle: 'PORTRAITURE',
    desc: '捕捉情感与故事\n探索光影中的个体表达',
  },
  landscape: {
    color: '#4fd8ff',     // 青
    enTitle: 'LANDSCAPE',
    desc: '定格自然的光影与瞬间\n记录世界的辽阔与细腻',
  },
  '3d-model': {
    color: '#ff8b35',     // 橙
    enTitle: 'VISUAL DESIGN',
    desc: '以视觉语言构建品牌气质\n让秩序与美感自然共生',
  },
  aigc: {
    color: '#ff78c5',     // 粉
    enTitle: 'AI GENERATED',
    desc: '探索AI与创意的融合\n生成无限的视觉可能',
  },
}

// ═══ 参考 gpt网页/index.html 的卡片内联 SVG 图标（统一线框风格，替代 Feather 线框图标）═══
const ICONS = {
  portrait: (
    <svg viewBox="0 0 48 48" fill="none" className="wcard-icon-svg" aria-hidden="true">
      <circle cx="24" cy="24" r="17" />
    </svg>
  ),
  landscape: (
    <svg viewBox="0 0 48 48" fill="none" className="wcard-icon-svg" aria-hidden="true">
      <path d="m5 37 14.5-26 10.2 18.1 5.2-9.1L43 37H5Z" />
    </svg>
  ),
  '3d-model': (
    <svg viewBox="0 0 48 48" fill="none" className="wcard-icon-svg" aria-hidden="true">
      <path d="M24 5 39 13.5v18L24 40 9 31.5v-18L24 5Z" />
      <path d="m9 13.5 15 8.5 15-8.5M24 22v18" />
    </svg>
  ),
  aigc: (
    <svg viewBox="0 0 48 48" fill="none" className="wcard-icon-svg" aria-hidden="true">
      <path d="M24 4v40M6.7 14l34.6 20M41.3 14 6.7 34" />
    </svg>
  ),
}

function CategoryCard({ cat, index, onOpen }) {
  const cfg = CATEGORY_CONFIG[cat.slug] || CATEGORY_CONFIG.aigc
  const IconSvg = ICONS[cat.slug] || ICONS.aigc

  return (
    <button
      type="button"
      className="wcard"
      style={{ '--accent': cfg.color, animationDelay: `${index * 0.13}s` }}
      onClick={() => onOpen(cat)}
      aria-label={`查看${cat.name}作品`}
    >
      <div className="wcard-body">
        <span className="wcard-icon">{IconSvg}</span>
        <h3 className="wcard-title">{cat.name}</h3>
        <p className="wcard-en">{cfg.enTitle}</p>
        <p className="wcard-desc">{cfg.desc}</p>
        <span className="wcard-more" aria-hidden="true">→</span>
      </div>
    </button>
  )
}

export default function Works() {
  const [categories, setCategories] = useState([])
  const [galleryCat, setGalleryCat] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const cacheRef = useRef({})
  const wrapRef = useRef(null)

  // 滚动到 Works 区时，四卡片依次进场；每次进入视口都重播
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const reveal = () => wrap.classList.add('in-view')
    const hide = () => wrap.classList.remove('in-view')
    const fallback = setTimeout(() => {
      const rect = wrap.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      if (rect.top < vh && rect.bottom > 0) reveal()
    }, 1500)

    if (!('IntersectionObserver' in window)) {
      reveal()
      clearTimeout(fallback)
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) reveal()
        else hide()
      })
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' })
    io.observe(wrap)
    return () => {
      io.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  // 拉取四个分类（后端 .all() 未排序，这里按展示顺序重排：3D建模 置于 AIGC 之后）
  useEffect(() => {
    api.get('/works/categories/')
      .then(data => {
        const list = Array.isArray(data) ? data : []
        const order = ['portrait', 'landscape', 'aigc', '3d-model']
        list.sort((a, b) => {
          const ia = order.indexOf(a.slug)
          const ib = order.indexOf(b.slug)
          return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
        })
        setCategories(list)
      })
      .catch(() => setCategories([]))
  }, [])

  const openGallery = useCallback((cat) => {
    if (cacheRef.current[cat.id]) {
      setGalleryImages(cacheRef.current[cat.id])
      setGalleryCat(cat)
      return
    }
    setGalleryLoading(true)
    setGalleryCat(cat)
    api.get(`/works/${cat.id}/`).then(data => {
      const imgs = data || []
      cacheRef.current[cat.id] = imgs
      setGalleryImages(imgs)
    }).catch(() => {
      setGalleryImages([])
    }).finally(() => setGalleryLoading(false))
  }, [])

  const closeGallery = useCallback(() => {
    setGalleryCat(null)
    setGalleryImages([])
    setGalleryLoading(false)
  }, [])

  return (
    <section className="works-section" id="works">
      <div className="section-header">
        <p className="section-tag">Works</p>
        <h2 className="section-title">作品展示</h2>
        <div className="section-line" />
        <p className="section-sub">四个创作方向 · 点击卡片进入画廊</p>
      </div>

      <div className="portfolio-wrap" ref={wrapRef}>
        {categories.map((cat, i) => (
          <CategoryCard key={cat.id} cat={cat} index={i} onOpen={openGallery} />
        ))}
      </div>

      {galleryCat && (
        <Suspense fallback={null}>
          <WorkGallery
            category={galleryCat}
            images={galleryImages}
            loading={galleryLoading}
            onClose={closeGallery}
          />
        </Suspense>
      )}
    </section>
  )
}
