'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  src?: string
  speedSec?: number      // скорость полного «прохода» вверх
  blurPx?: number
  saturate?: number      // 100 = как есть
  brightness?: number    // 100 = как есть
  scale?: number         // чуть >1, чтобы не светились края при блюре
}

export default function BackgroundCollage({
  src = '/collage.png',
  speedSec = 90,
  blurPx = 6,
  saturate = 100,
  brightness = 100,
  scale = 1.04,
}: Props) {
  // высота одной картинки при текущей ширине экрана
  const [imgH, setImgH] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // измеряем высоту картинки после загрузки и при ресайзе
  useEffect(() => {
    const measure = () => {
      const el = imgRef.current
      if (!el) return
      // высота уже отмасштабированной картинки (width:100%, height:auto)
      const h = el.getBoundingClientRect().height
      if (h > 0) setImgH(h)
    }
    const img = imgRef.current
    if (img && img.complete) measure()
    img?.addEventListener('load', measure)
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      img?.removeEventListener('load', measure)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  // пробрасываем CSS-переменные в контейнер
  useEffect(() => {
    const w = wrapRef.current
    if (!w) return
    w.style.setProperty('--froc-collage-h', `${imgH}px`)
    w.style.setProperty('--froc-collage-speed', `${speedSec}s`)
    w.style.setProperty('--froc-collage-blur', `${blurPx}px`)
    w.style.setProperty('--froc-collage-sat', `${saturate}%`)
    w.style.setProperty('--froc-collage-bright', `${brightness}%`)
    w.style.setProperty('--froc-collage-scale', `${scale}`)
  }, [imgH, speedSec, blurPx, saturate, brightness, scale])

  return (
    <div className="froc-collage" ref={wrapRef} aria-hidden>
      {/* трек: две одинаковые картинки, одна под другой */}
      <div className="froc-collage__track" style={{ opacity: imgH ? 1 : 0 }}>
        <img ref={imgRef} className="froc-collage__img" src={src} alt="" />
        <img className="froc-collage__img" src={src} alt="" />
      </div>
    </div>
  )
}
