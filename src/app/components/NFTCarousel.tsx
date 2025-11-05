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
  // нормализация входа
  const baseSlides = useMemo(
    () => Array.from(new Set(images.filter(Boolean))),
    [images],
  )
  const realCount = baseSlides.length
  if (realCount === 0) return null

  // клоны по краям: [last, ...real, first] — для бесшовного цикла
  const loopSlides = useMemo(() => {
    if (realCount === 1) return [...baseSlides]
    return [baseSlides[realCount - 1], ...baseSlides, baseSlides[0]]
  }, [baseSlides, realCount])

  // refs & state
  const trackRef = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLDivElement>(null)
  const lastValidW = useRef<number>(0)

  const [index, setIndex] = useState(realCount === 1 ? 0 : 1) // старт на первом реальном
  const [anim, setAnim] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // drag state
  const drag = useRef({
    active: false,
    lock: '' as '' | 'x' | 'y',
    startX: 0,
    startY: 0,
    dx: 0, // смещение в px (может быть отрицательным)
  })

  const slideGap = 12
  const slideH = Math.max(160, Math.min(420, height))
  const slideW = Math.min(520, Math.round(slideH * 1.3))

  // утилиты
  const measure = () => {
    // ширина карточки: эталон + gap
    const w = (probeRef.current?.offsetWidth || 0) + slideGap
    if (w > 0) {
      lastValidW.current = w
      return w
    }
    return lastValidW.current || slideW + slideGap
  }

  const setTranslate = (px: number, withAnim: boolean) => {
    const track = trackRef.current
    if (!track) return
    setAnim(withAnim)
    track.style.transform = `translate3d(${-px}px,0,0)`
  }

  const applyPosition = (i: number, withAnim: boolean) => {
    const w = measure()
    setTranslate(w * i, withAnim)
  }

  // первичная инициализация
  useEffect(() => {
    const init = () => {
      const w = measure()
      if (w > 0) {
        applyPosition(index, false)
        setIsReady(true)
      }
    }
    init()
    const raf = requestAnimationFrame(init)
    const onResize = () => {
      const w = measure()
      if (w > 0) applyPosition(index, false)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goTo = (i: number) => {
    if (isAnimating || !isReady) return
    setIsAnimating(true)
    setIndex(i)
    applyPosition(i, true)
  }
  const next = () => goTo(index + 1)
  const prev = () => goTo(index - 1)

  const onTransitionEnd = () => {
    setIsAnimating(false)
    if (realCount === 1) return
    const lastIdx = loopSlides.length - 1
    if (index === 0) {
      const target = realCount
      setIndex(target)
      applyPosition(target, false)
    } else if (index === lastIdx) {
      const target = 1
      setIndex(target)
      applyPosition(target, false)
    }
  }

  // автоплей с паузой при невидимости вкладки
  useEffect(() => {
    if (!auto || realCount <= 1) return
    if (document.hidden) return
    const id = setInterval(() => {
      if (!isReady || isAnimating || drag.current.active) return
      next()
    }, intervalMs)
    const onVis = () => {
      if (!document.hidden) applyPosition(index, false)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, intervalMs, index, isReady, isAnimating, realCount])

  // свайп пальцем (тач)
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isReady) return
    const t = e.touches[0]
    drag.current = { active: true, lock: '', startX: t.clientX, startY: t.clientY, dx: 0 }
    setAnim(false) // во время драга — без анимации
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!drag.current.active) return
    const t = e.touches[0]
    const dx = t.clientX - drag.current.startX
    const dy = t.clientY - drag.current.startY

    // блокируем ось только когда становится понятно направление
    if (!drag.current.lock) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        drag.current.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }
    }
    if (drag.current.lock === 'y') return // даём прокручиваться странице

    // двигаем ленту на текущий dx
    drag.current.dx = dx
    const w = measure()
    const basePx = w * index
    setTranslate(basePx - dx, false)

    // отменяем скролл страницы, когда перетягиваем по X
    e.preventDefault()
  }

  const onTouchEnd = () => {
    if (!drag.current.active) return
    const { dx, lock } = drag.current
    drag.current.active = false
    const w = measure()
    const threshold = Math.min(0.25 * w, 80) // порог: 25% ширины или 80px

    // возвращаем анимацию
    setAnim(true)

    if (lock !== 'x') {
      // ось не была захвачена — просто вернуть на место
      applyPosition(index, true)
      return
    }

    if (Math.abs(dx) > threshold) {
      if (dx < 0) next()
      else prev()
    } else {
      // недотянули — вернуться
      applyPosition(index, true)
    }
  }

  const activeDot =
    realCount === 1 ? 0 : (index - 1 + realCount) % realCount

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,.12)',
        background: 'rgba(255,255,255,.04)',
        backdropFilter: 'blur(6px)',
        padding: 8,
        // чтобы страница могла скроллиться по Y, а жест по X ловился компонентом:
        touchAction: drag.current.active ? 'none' : 'pan-y',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* лента */}
      <div
        ref={trackRef}
        onTransitionEnd={onTransitionEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          display: 'flex',
          gap: `${slideGap}px`,
          willChange: 'transform',
          transition: anim
            ? 'transform 520ms cubic-bezier(.22,.61,.36,1)'
            : 'none',
          opacity: isReady ? 1 : 0,
        }}
      >
        {loopSlides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            ref={i === 1 ? probeRef : undefined}
            className="relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5"
            style={{ width: slideW, height: slideH }}
          >
            <Image
              src={src}
              alt={`FROC preview #${i + 1}`}
              fill
              sizes={`${slideW}px`}
              className="object-cover"
              priority={i < 3}
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
