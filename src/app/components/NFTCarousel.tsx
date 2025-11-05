'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, useMemo } from 'react'

type Props = {
  images: string[]                 // абсолютные или относительные пути
  auto?: boolean                   // автопрокрутка
  intervalMs?: number              // пауза между слайдами
  height?: number                  // высота в px на десктопе
}

export default function NFTCarousel({
  images,
  auto = true,
  intervalMs = 3500,
  height = 260,
}: Props) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)

  // нормализуем список (убираем пустые/дубли случайные)
  const slides = useMemo(
    () => Array.from(new Set(images.filter(Boolean))),
    [images],
  )

  // кнопки
  const scrollToIndex = (idx: number) => {
    const el = trackRef.current?.children[idx] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }
  const next = () => scrollToIndex((active + 1) % slides.length)
  const prev = () => scrollToIndex((active - 1 + slides.length) % slides.length)

  // следим за активным слайдом (snap + observer)
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const items = Array.from(track.children) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const centered = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (centered) setActive(items.indexOf(centered.target as HTMLElement))
      },
      { root: track, threshold: [0.5, 0.75, 0.95] },
    )
    items.forEach((it) => io.observe(it))
    return () => io.disconnect()
  }, [slides.length])

  // автопрокрутка (пауза при наведении/скролле)
  useEffect(() => {
    if (!auto || slides.length <= 1) return
    const id = setInterval(next, intervalMs)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, intervalMs, slides.length, active])

  if (!slides.length) return null

  return (
    <div
      className="group relative w-full"
      style={{
        // мягкая рамка и блюр под твой стиль
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,.12)',
        background: 'rgba(255,255,255,.04)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* трек */}
      <ul
        ref={trackRef}
        className="
          flex overflow-x-auto scroll-smooth snap-x snap-mandatory
          gap-3 p-3
        "
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none' as any,
          msOverflowStyle: 'none',
          height,
        }}
        onWheel={(e) => {
          // горизонтальный скролл колесиком на десктопе
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            trackRef.current?.scrollBy({ left: e.deltaY, behavior: 'smooth' })
          }
        }}
      >
        {slides.map((src, i) => (
          <li
            key={i}
            className="
              snap-center shrink-0 relative overflow-hidden
              rounded-xl border border-white/10
              bg-white/5
            "
            style={{ width: Math.min(440, 0.8 * height * (3/2)), height: height - 10 }}
            aria-current={i === active ? 'true' : 'false'}
          >
            <Image
              src={src}
              alt={`FROC preview #${i + 1}`}
              fill
              sizes="(max-width: 640px) 85vw, 520px"
              className="object-cover"
              priority={i < 2}
            />
          </li>
        ))}
      </ul>

      {/* стрелки */}
      {slides.length > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={prev}
            className="
              absolute left-2 top-1/2 -translate-y-1/2
              hidden sm:flex items-center justify-center
              h-9 w-9 rounded-full bg-black/50 hover:bg-black/70
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
              hidden sm:flex items-center justify-center
              h-9 w-9 rounded-full bg-black/50 hover:bg-black/70
              border border-white/20 text-white
            "
          >
            ›
          </button>
        </>
      )}

      {/* точки */}
      {slides.length > 1 && (
        <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`
                h-1.5 rounded-full transition-all
                ${i === active ? 'w-6 bg-white/90' : 'w-2 bg-white/40'}
              `}
            />
          ))}
        </div>
      )}
    </div>
  )
}
