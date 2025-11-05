// src/app/components/NFTCarousel.tsx
'use client'

import NextImage from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  images: string[]
  auto?: boolean
  intervalMs?: number
  height?: number
  eagerCount?: number // сколько слайдов грузить агрессивно
}

export default function NFTCarousel({
  images,
  auto = true,
  intervalMs = 3500,
  height = 260,
  eagerCount = 3,
}: Props) {
  // нормализация входных ссылок
  const baseSlides = useMemo(
    () => Array.from(new Set(images.filter(Boolean))),
    [images],
  )
  const realCount = baseSlides.length
  if (realCount === 0) return null

  // клоны по краям для бесшовного цикла: [last, ...real, first]
  const loopSlides = useMemo(() => {
    if (realCount === 1) return [...baseSlides]
    return [baseSlides[realCount - 1], ...baseSlides, baseSlides[0]]
  }, [baseSlides, realCount])

  // refs & state
  const trackRef = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLDivElement>(null)
  const lastValidW = useRef<number>(0)

  const [index, setIndex] = useState(realCount === 1 ? 0 : 1) // первый реальный
  const [anim, setAnim] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // загрузка изображений (для скелетов)
  const [loaded, setLoaded] = useState<boolean[]>(
    () => new Array(loopSlides.length).fill(false),
  )

  // drag via Pointer Events
  const drag = useRef({
    active: false,
    lock: '' as '' | 'x' | 'y',
    startX: 0,
    startY: 0,
    startT: 0,
    dx: 0,
  })

  const slideGap = 12
  const slideH = Math.max(160, Math.min(420, height))
  const slideW = Math.min(520, Math.round(slideH * 1.3))

  // измерение ширины карточки (с учётом gap)
  const measure = () => {
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

  // первичная инициализация/ресайз
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

  // прогрев картинок (ускоряет первые переходы)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const urls = Array.from(new Set(baseSlides))
    urls.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [baseSlides])

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

  // автоплей + пауза при невидимости вкладки
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

  // ----- Pointer Events: свайп -----
  const onPointerDown = (e: React.PointerEvent) => {
    if (!isReady) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)

    drag.current.active = true
    drag.current.lock = ''
    drag.current.startX = e.clientX
    drag.current.startY = e.clientY
    drag.current.startT = performance.now()
    drag.current.dx = 0

    setAnim(false)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY

    if (!drag.current.lock) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        drag.current.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }
    }
    if (drag.current.lock === 'y') return

    const w = measure()
    const maxPull = Math.min(0.9 * w, 280)
    const clampedDx = Math.max(-maxPull, Math.min(maxPull, dx))
    drag.current.dx = clampedDx

    const basePx = w * index
    setTranslate(basePx - clampedDx, false)
    e.preventDefault()
  }

  const finishDrag = (dir: 'stay' | 'prev' | 'next') => {
    setAnim(true)
    if (dir === 'next') next()
    else if (dir === 'prev') prev()
    else applyPosition(index, true)
  }

  const onPointerUp = () => {
    if (!drag.current.active) return
    const now = performance.now()
    const dt = Math.max(16, now - drag.current.startT)
    const { dx, lock } = drag.current
    drag.current.active = false

    if (lock !== 'x') {
      finishDrag('stay')
      return
    }

    const w = measure()
    const threshold = Math.min(0.25 * w, 80)
    const velocity = dx / dt // px/ms

    const goNext = dx < 0 && (Math.abs(dx) > threshold || velocity < -0.5)
    const goPrev = dx > 0 && (Math.abs(dx) > threshold || velocity > 0.5)

    if (goNext) finishDrag('next')
    else if (goPrev) finishDrag('prev')
    else finishDrag('stay')
  }

  const onPointerCancel = () => {
    drag.current.active = false
    drag.current.lock = ''
    drag.current.dx = 0
    setAnim(true)
    applyPosition(index, true)
  }

  // активная точка
  const activeDot =
    realCount === 1 ? 0 : (index - 1 + realCount) % realCount

  // скелет-плейсхолдер
  const Skeleton = () => (
    <div
      className="absolute inset-0 rounded-xl"
      style={{
        animation: 'frocShimmer 1.2s linear infinite',
        background:
          'linear-gradient(120deg, rgba(255,255,255,.10), rgba(255,255,255,.05) 40%, rgba(255,255,255,.10))',
        backgroundSize: '200% 100%',
        filter: 'grayscale(20%)',
      }}
    />
  )

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,.12)',
        background: 'rgba(255,255,255,.04)',
        backdropFilter: 'blur(6px)',
        padding: 8,
        overscrollBehaviorX: 'contain',
        touchAction: 'pan-y',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* лента */}
      <div
        ref={trackRef}
        onTransitionEnd={onTransitionEnd}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        style={{
          display: 'flex',
          gap: `${slideGap}px`,
          willChange: 'transform',
          transition: anim
            ? 'transform 520ms cubic-bezier(.22,.61,.36,1)'
            : 'none',
          opacity: isReady ? 1 : 0.999,
        }}
      >
        {loopSlides.map((src, i) => {
          const isProbe = i === 1
          const eager = i <= eagerCount
          const showSkeleton = !loaded[i]

          return (
            <div
              key={`${src}-${i}`}
              ref={isProbe ? probeRef : undefined}
              className="relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5"
              style={{ width: slideW, height: slideH }}
            >
              {showSkeleton && <Skeleton />}

              <NextImage
                src={src}
                alt={`FROC preview #${i + 1}`}
                fill
                sizes={`${slideW}px`}
                className="object-cover"
                priority={eager}
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={eager ? 'high' : 'auto'}
                onLoadingComplete={() => {
                  setLoaded((arr) => {
                    if (arr[i]) return arr
                    const next = arr.slice()
                    next[i] = true
                    return next
                  })
                }}
              />
            </div>
          )
        })}
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

/* маленький keyframes для shimmer-скелета (можно перенести в globals.css) */
declare global {
  interface CSSStyleDeclaration {
    // TS подсказки не нужны — просто чтобы не ругался на кастомные анимации
  }
}
