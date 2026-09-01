import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './WorkGallery.css'
import { asset } from '../utils/asset'

// 根据视口宽度决定瀑布流列数（2 / 3 / 4）
function useColumnCount() {
  const get = () => {
    if (typeof window === 'undefined') return 4
    const w = window.innerWidth
    if (w <= 680) return 2
    if (w <= 1100) return 3
    return 4
  }
  const [cols, setCols] = useState(get)
  useEffect(() => {
    const onResize = () => setCols(get())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return cols
}

export default function WorkGallery({ category, images, loading, onClose }) {
  const [fullscreenIdx, setFullscreenIdx] = useState(null)   // 点击某张进入全屏
  const wheelThrottle = useRef(0)

  const total = images.length
  const columnCount = useColumnCount()

  // 将图片按列均分（i % columnCount → 第几列），保证纵向流动、阅读顺序自然
  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => [])
    images.forEach((img, i) => cols[i % columnCount].push({ img, i }))
    return cols
  }, [images, columnCount])

  // 全屏内：上一张 / 下一张（循环）
  const goFull = useCallback((dir) => {
    if (total === 0) return
    setFullscreenIdx(prev => prev == null ? prev : (prev + dir + total) % total)
  }, [total])

  // 键盘：ESC 关闭；全屏内 ↑↓ / ←→ 翻图
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (fullscreenIdx !== null) setFullscreenIdx(null)
        else onClose()
      }
      else if (fullscreenIdx !== null) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goFull(1)
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goFull(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [fullscreenIdx, onClose, goFull])

  // 全屏内：滚轮上下滚动翻图（节流 320ms）
  const onNavWheel = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const now = Date.now()
    if (now - wheelThrottle.current < 320) return
    wheelThrottle.current = now
    goFull(e.deltaY > 0 ? 1 : -1)
  }, [goFull])

  return (
    <div className="gallery-backdrop" onClick={onClose}>
      {/* 关闭按钮：全屏态先退回画廊（上一层），画廊态才真正关闭 */}
      <button
        className="gallery-close"
        onClick={(e) => {
          e.stopPropagation()
          if (fullscreenIdx !== null) setFullscreenIdx(null)
          else onClose()
        }}
        aria-label={fullscreenIdx !== null ? '返回画廊' : '关闭画廊'}
        title={fullscreenIdx !== null ? '返回画廊' : '关闭画廊'}
      >
        <FiX />
      </button>

      {/* 顶栏：分类名 + 数量 */}
      <div className="gallery-topbar">
        <span className="gallery-cat">{category.name}</span>
        <span className="gallery-counter">{total} 张图片</span>
      </div>

      {/* 加载 / 空态 */}
      {loading ? (
        <div className="gallery-loading"><span className="spinner" /> 加载作品中…</div>
      ) : total === 0 ? (
        <div className="gallery-loading">该分类暂无作品</div>
      ) : (
        /* ═══ 瀑布流网格（flex 分列，纵向滚动） ═══ */
        <div className="gallery-masonry">
          {columns.map((col, ci) => (
            <div className="gallery-col" key={ci}>
              {col.map(({ img, i }) => (
                <button
                  key={img.id}
                  className="gallery-masonry-item"
                  style={{ animationDelay: `${Math.min(i * 0.045, 0.55)}s` }}
                  onClick={(e) => { e.stopPropagation(); setFullscreenIdx(i) }}
                >
                  <img
                    src={asset(img.thumbnail || img.image)}
                    alt={img.title || `作品 ${img.id}`}
                    loading="lazy"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ═══ 全屏单图查看（上下滚动浏览 + 左侧上下切换按钮） ═══ */}
      {fullscreenIdx != null && images[fullscreenIdx] && (
        <div
          className="gallery-zoom"
          onClick={(e) => { e.stopPropagation(); setFullscreenIdx(null) }}
          onWheel={onNavWheel}
        >
          <div className="gallery-zoom-frame">
            <img
              className="gallery-zoom-img"
              src={asset(images[fullscreenIdx].image)}
              alt={images[fullscreenIdx].title || `作品 ${images[fullscreenIdx].id}`}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {/* 左右切换 */}
          {total > 1 && (
            <>
              <button
                className="gallery-zoom-nav gallery-zoom-prev"
                onClick={(e) => { e.stopPropagation(); goFull(-1) }}
                aria-label="上一张"
              >
                <FiChevronLeft />
              </button>
              <button
                className="gallery-zoom-nav gallery-zoom-next"
                onClick={(e) => { e.stopPropagation(); goFull(1) }}
                aria-label="下一张"
              >
                <FiChevronRight />
              </button>
            </>
          )}
          <span className="gallery-zoom-counter">
            {fullscreenIdx + 1} / {total}
          </span>
        </div>
      )}
    </div>
  )
}
