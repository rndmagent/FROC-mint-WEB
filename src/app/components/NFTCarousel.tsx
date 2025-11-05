'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  images: string[]
  auto?: boolean
  intervalMs?: number
  height?: number
}

export default function NFTCarousel({
  images,
  auto = true,
  intervalMs = 3500,
  height = 260,
}: Props) {
  // 1) нормализуем вход
  const baseSlides = useMemo(
    () => Array.from(new Set(images.filter(Boolean))),
    [images],
  )
  const realCount = baseSlides.length
  if (realCount === 0) return null

  // 2) клоны для бесконечного цикла
  const loopSlides = useMemo(() => {
    if (realCount === 1) return [...baseSlides]
    return [baseSlides[realCount - 1], ...baseSlides, baseSlides[0]]
  }, [baseSlides, realCount])

  // 3) состояние
  const [index, setIndex] = useState(realCount === 1 ? 0 : 1) // старт на 1 (первый реальный)
  const [anim, setAnim] = useState(false) // после первой расстановки включим
  const trackRef = useRef<HTMLDivElement>(null)
  const slideRef = useRef<HTMLDivElement>(null)
  const slideGap = 12 // px

  // drag state
  const drag = useRef({
    active: false,
    startX: 0,
    lastX: 0,
    moved: 0,
    wasClick: true,
  })

  // 4) геометрия
  const slideH = Math.max(160, Math.min(420, height))
  const slideW = Math.min(520, Math.round(slideH * 1.3)) // ~13:10

  const getStep = () => slideW + slideGap

  // 5) применяем translateX
  const setTranslate = (px: number, withAnim: boolean) => {
    const el = trackRef.current
    if (!el) return
    setAnim(withAnim)
    el.style.transform = `translate3d(${px}px,0,0)`
  }

  const applyByIndex = (i: number, withAnim: boolean) => {
    const px = -getStep() * i
    setTranslate(px, withAnim)
  }

  // начальная позиция
  useEffect(() => {
    applyByIndex(index, false)
    requestAnimationFrame(() => setAnim(true))
    const onResize = () => applyByIndex(index, false)
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goTo = (i: number) => {
    setIndex(i)
    applyByIndex(i, true)
  }
  const next = () => goTo(index + 1)
  const prev = () => goTo(index - 1)

  // бесшовный цикл
  const onTransitionEnd = () => {
    if (realCount === 1) return
    const last = loopSlides.length - 1
    if (index === 0) {
      const t = realCount
      setIndex(t)
      applyByIndex(t, false)
    } else if (index === last) {
      const t = 1
      setIndex(t)
      applyByIndex(t, false)
    }
  }

  // автоплей
  useEffect(() => {
    if (!auto || realCount <= 1) return
    const id = setInterval(() => next(), intervalMs)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, intervalMs, index, realCount])

  // 6) свайп руками (pointer events)
  const onPointerDown: React.PointerEventHandler = (e) => {
    if (!trackRef.current) return
    drag.current.active = true
    drag.current.wasClick = true
    drag.current.startX = e.clientX
    drag.current.lastX = e.clientX
    drag.current.moved = 0
    setAnim(false)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove: React.PointerEventHandler = (e) => {
    if (!drag.current.active || !trackRef.current) return
    const dx = e.clientX - drag.current.lastX
    drag.current.lastX = e.clientX
    drag.current.moved += Math.abs(dx)
    if (drag.current.moved > 3) drag.current.wasClick = false

    const base = -getStep() * index
    setTranslate(base + (e.clientX - drag.current.startX), false)
  }

  const onPointerUp: React.PointerEventHandler = (e) => {
    if (!drag.current.active) return
    drag.current.active = false
    // решаем, листать ли
    const totalDx = e.clientX - drag.current.startX
    const threshold = getStep() * 0.2 // 20% ширины — порог
    setAnim(true)
    if (totalDx > threshold) {
      prev()
    } else if (totalDx < -threshold) {
      next()
    } else {
      applyByIndex(index, true) // вернуться на место
    }
  }

  // активная точка (с учётом клонов)
  const activeDot = realCount === 1 ? 0 : (index - 1 + realCount) % realCount

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,.12)',
        background: 'rgba(255,255,255,.04)',
        backdropFilter: 'blur(6px)',
        padding: 8,
        // важно для жестов: вертикальная прокрутка страницы не блокируется
        touchAction: 'pan-y',
      }}
      // блокируем контекстное меню/drag на изображениях
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* лента */}
      <div
        ref={trackRef}
        onTransitionEnd={onTransitionEnd}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          display: 'flex',
          gap: `${slideGap}px`,
          willChange: 'transform',
          transition: anim
            ? // мягкая, кинематографичная кривая (easeOutQuint-подобная)
              'transform 520ms cubic-bezier(.22,.68,0,.99)'
            : 'none',
        }}
      >
        {loopSlides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            ref={i === 1 ? slideRef : undefined}
            className="relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5"
            style={{ width: slideW, height: slideH }}
          >
            <Image
              src={src}
              alt={`FROC preview #${i + 1}`}
              fill
              className="object-cover pointer-events-none"
              sizes={`${slideW}px`}
              priority={i < 3}
              draggable={false as any}
            />
          </div>
        ))}
      </div>

      {/* стрелки (десктоп) */}
      {realCount > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={prev}
            className="
              absolute left-2 top-1/2 -translate-y-1/2
              hidden sm:flex h-9 w-9 items-center justify-center
              rounded-full bg-black/50 hover:bg-black/70
              border border-white/20 text-white
            "
          >
            ‹
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              hidden sm:flex h-9 w-9 items-center justify-center
              rounded-full bg-black/50 hover:bg-black/70
              border border-white/20 text-white
            "
          >
            ›
          </button>
        </>
      )}

      {/* точки */}
      {realCount > 1 && (
        <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          {baseSlides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === activeDot ? 'w-6 bg-white/90' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
