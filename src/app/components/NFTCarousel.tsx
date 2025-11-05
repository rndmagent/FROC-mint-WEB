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
  // нормализуем вход
  const baseSlides = useMemo(
    () => Array.from(new Set(images.filter(Boolean))),
    [images],
  )
  const realCount = baseSlides.length
  if (realCount === 0) return null

  // создаём клоны по краям: [last, ...real, first]
  const loopSlides = useMemo(() => {
    if (realCount === 1) return [...baseSlides] // для одного слайда клоны не нужны
    return [baseSlides[realCount - 1], ...baseSlides, baseSlides[0]]
  }, [baseSlides, realCount])

  // состояние
  const [index, setIndex] = useState(realCount === 1 ? 0 : 1) // стартуем на 1 (первый реальный)
  const [anim, setAnim] = useState(true) // включена ли анимация
  const trackRef = useRef<HTMLDivElement>(null)
  const slideRef = useRef<HTMLDivElement>(null)
  const slideGap = 12 // px

  // считаем ширину слайда (один раз и при ресайзе)
  const getSlideW = () => (slideRef.current?.offsetWidth || 520) + slideGap

  // применяем translateX
  const applyPosition = (i: number, withAnim = true) => {
    const track = trackRef.current
    if (!track) return
    const dist = getSlideW() * i
    setAnim(withAnim)
    track.style.transform = `translate3d(${-dist}px,0,0)`
  }

  // начальная позиция
  useEffect(() => {
    // примонтировались — выставили translate
    applyPosition(index, false)
    // на ресайз/ориентацию — перепозиционируем без анимации
    const onResize = () => applyPosition(index, false)
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
    applyPosition(i, true)
  }
  const next = () => goTo(index + 1)
  const prev = () => goTo(index - 1)

  // бесшовный цикл: когда доехали до клона — мгновенно прыгаем на реальный
  const onTransitionEnd = () => {
    if (realCount === 1) return
    const lastIdx = loopSlides.length - 1
    if (index === 0) {
      // были на левом клоне -> прыжок на последний реальный
      const target = realCount
      setIndex(target)
      applyPosition(target, false)
    } else if (index === lastIdx) {
      // были на правом клоне -> прыжок на первый реальный
      const target = 1
      setIndex(target)
      applyPosition(target, false)
    }
  }

  // автопрокрутка
  useEffect(() => {
    if (!auto || realCount <= 1) return
    const id = setInterval(() => {
      // чтобы анимация оставалась ровной — крутим шаг за шагом
      next()
    }, intervalMs)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, intervalMs, index, realCount])

  // активная точка (сдвинуто из-за клонов)
  const activeDot =
    realCount === 1 ? 0 : (index - 1 + realCount) % realCount

  // размеры карточек
  const slideH = Math.max(160, Math.min(420, height))
  const slideW = Math.min(520, Math.round(slideH * 1.3)) // примерно 13:10

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
          transition: anim ? 'transform 420ms cubic-bezier(.22,.61,.36,1)' : 'none',
        }}
      >
        {loopSlides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            ref={i === 1 ? slideRef : undefined} // эталонный для измерения width
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
