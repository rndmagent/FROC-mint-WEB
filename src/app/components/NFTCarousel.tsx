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

  // создаём клоны по краям
  const loopSlides = useMemo(() => {
    if (realCount === 1) return [...baseSlides]
    return [baseSlides[realCount - 1], ...baseSlides, baseSlides[0]]
  }, [baseSlides, realCount])

  // refs & state
  const trackRef = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLDivElement>(null)
  const lastValidW = useRef<number>(0)

  const [index, setIndex] = useState(realCount === 1 ? 0 : 1) // старт с первого реального
  const [anim, setAnim] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const slideGap = 12
  const slideH = Math.max(160, Math.min(420, height))
  const slideW = Math.min(520, Math.round(slideH * 1.3))

  // утилиты
  const measure = () => {
    // ширина реальной карточки (probeRef)
    const w = (probeRef.current?.offsetWidth || 0) + slideGap
    if (w > 0) {
      lastValidW.current = w
      return w
    }
    // если по какой-то причине 0 — используем последний валидный/фолбек
    return lastValidW.current || slideW + slideGap
  }

  const applyPosition = (i: number, withAnim: boolean) => {
    const track = trackRef.current
    if (!track) return
    const w = measure()
    setAnim(withAnim)
    track.style.transform = `translate3d(${-w * i}px,0,0)`
  }

  // первичная инициализация (после того, как появятся размеры)
  useEffect(() => {
    const init = () => {
      const w = measure()
      if (w > 0) {
        applyPosition(index, false)
        setIsReady(true)
      }
    }
    // сразу и на следующий кадр — чтобы поймать layout
    init()
    const raf = requestAnimationFrame(init)
    // ресайзы/ориентация
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
    if (isAnimating || !isReady) return // защищаемся от дабл-кликов
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

  // автоплей c паузой при невидимости вкладки
  useEffect(() => {
    if (!auto || realCount <= 1) return
    if (document.hidden) return
    const id = setInterval(() => {
      // если внезапно измерение стало 0 — не дёргаем
      if (!isReady || isAnimating) return
      next()
    }, intervalMs)
    const onVis = () => {
      // при возвращении — перепозиционируем без анимации
      if (!document.hidden) applyPosition(index, false)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, intervalMs, index, isReady, isAnimating, realCount])

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
      }}
    >
      {/* лента */}
      <div
        ref={trackRef}
        onTransitionEnd={onTransitionEnd}
        style={{
          display: 'flex',
          gap: `${slideGap}px`,
          willChange: 'transform',
          transition: anim
            ? 'transform 520ms cubic-bezier(.22,.61,.36,1)'
            : 'none',
          opacity: isReady ? 1 : 0, // не показываем, пока не готовы
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

      {/* стрелки */}
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
