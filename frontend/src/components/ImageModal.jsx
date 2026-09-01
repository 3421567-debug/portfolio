import { useState, useEffect, useCallback } from 'react'
import { FiX } from 'react-icons/fi'
import './ImageModal.css'

export default function ImageModal({ src, onClose }) {
  const [scale, setScale] = useState(1)

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    setScale(prev => {
      const next = prev - e.deltaY * 0.002
      return Math.min(Math.max(next, 0.5), 4)
    })
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === '0') setScale(1)
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <button className="modal-close" onClick={onClose}><FiX /></button>

      <div className="modal-content" onClick={e => e.stopPropagation()} onWheel={handleWheel}>
        <img
          src={src}
          alt="作品放大查看"
          style={{ transform: `scale(${scale})` }}
          draggable={false}
        />
      </div>

      <div className="modal-hint">滚轮缩放 · 按 ESC 关闭 · 按 0 重置</div>
    </div>
  )
}
