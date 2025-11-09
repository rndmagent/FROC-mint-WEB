'use client'

import Image from 'next/image'
import { useMemo } from 'react'

/** ===================== НАСТРОЙКИ (МЕНЯТЬ ТУТ) ===================== */
/** Награда в долларах — единая точка правды */
const PRICE_USD = 100

/** Пути к постерам (сложи файлы в /public) */
const IMAGES = {
  wanted: '/wanted-froc.png', // постер для режима WANTED
  caught: '/caught-froc.png', // постер для режима CAUGHT
}

/** Тексты для сайта (английский) */
const COPY = {
  titleWanted: 'ATTENTION: WANTED',
  subtitleWanted: (price: number) =>
    `A highly dangerous FROC is wanted. Bounty: $${price}.`,
  traitsTitle: 'DISTINGUISHING FEATURES',
  traits: [
    'Background — Sky Fade',
    'Arm — Empty',
    'Body — Jelly',
    'Cloth — Ronin',
    'Headdress — Empty',
    'Eyes — Mechanic Eyes',
    'Mouth — Bubble',
  ],
  howToTitle: 'HOW TO CLAIM THE BOUNTY',
  howToSteps: (price: number) => [
    'Find and catch the specified FROC.',
    `List this exact FROC on OpenSea for $${price}.`,
    'We will buy it.',
  ],
  titleCaught: 'CAUGHT!',
  subtitleCaught:
    'This FROC has already been caught and purchased. Stay tuned for new targets.',
}
/** ================================================================== */

type Mode = 'wanted' | 'caught'

/** Основной компонент блока розыска */
export default function WantedBlock({ mode = 'wanted' as Mode }: { mode?: Mode }) {
  /** Режим отображения */
  const isWanted = mode === 'wanted'

  /** Источник постера */
  const posterSrc = isWanted ? IMAGES.wanted : IMAGES.caught

  /** Мемуизированные списки — стабильный рендер */
  const traitsList = useMemo(() => COPY.traits, [])
  const howToList = useMemo(() => COPY.howToSteps(PRICE_USD), [])

  /** Малый бэйдж */
  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  )

  return (
    // На мобилке тянем блок к краям контейнера (px-0), на десктопе даём стандартные поля
    <section className="mx-auto mt-8 max-w-6xl px-0 sm:px-6">
      <div
        className="
          relative overflow-hidden rounded-none sm:rounded-2xl
          border border-white/10 bg-white/5 backdrop-blur
          shadow-[0_8px_30px_rgba(0,0,0,.35)]
        "
      >
        {/* Тонкая акцентная полоса сверху */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400/70 via-sky-400/70 to-violet-400/70" />

        {/* Шапка: бэйджи + заголовки (всегда сверху) */}
        <div className="px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge>{isWanted ? 'Active bounty' : 'Status: caught'}</Badge>
            {isWanted && <Badge>Bounty: ${PRICE_USD}</Badge>}
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            {isWanted ? COPY.titleWanted : COPY.titleCaught}
          </h2>
          <p className="mt-1 text-white/80">
            {isWanted ? COPY.subtitleWanted(PRICE_USD) : COPY.subtitleCaught}
          </p>
        </div>

        {/* Контентная сетка:
            - mobile: постер сверху, затем текст (order)
            - ≥ md: две колонки, текст слева, постер справа */}
        <div
          className="
            mt-4
            grid
            sm:gap-6
            md:grid-cols-2 md:gap-10 md:px-6 md:pb-6
            items-start
          "
        >
          {/* ПОСТЕР — mobile first сверху, на десктопе справа */}
          <div className="order-1 md:order-2 px-0">
            <div
              className="
                relative w-full overflow-hidden
                rounded-none sm:rounded-xl
                border border-white/10 bg-black/20 p-2
                shadow-[0_8px_30px_rgba(0,0,0,.35)]
                flex items-center md:items-start justify-center
                max-w-[560px] mx-auto md:ml-auto
              "
            >
              {/* intrinsic ratio через width/height; h-auto исключает лишнюю пустоту */}
              <Image
                src={posterSrc}
                alt={isWanted ? 'Wanted FROC' : 'Caught FROC'}
                width={900}
                height={1200}
                className="w-full h-auto max-h-[60vh] md:max-h-[62vh] object-contain"
                priority
              />
            </div>

            <div className="px-4 sm:px-0 mt-2 text-center text-xs text-white/70">
              {isWanted
                ? 'Match the exact FROC by its features.'
                : 'Case closed. Watch for the next bounty.'}
            </div>
          </div>

          {/* ТЕКСТ/АТРИБУТЫ — на мобилке ниже постера; на десктопе слева */}
          <div className="order-2 md:order-1 px-4 sm:px-0 md:pr-6 pb-5 md:pb-0">
            {isWanted && (
              <>
                {/* Особые приметы */}
                <h3 className="mt-4 md:mt-0 text-sm font-semibold tracking-wide text-white/70">
                  {COPY.traitsTitle}
                </h3>
                <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {traitsList.map((t) => (
                    <li
                      key={t}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    >
                      {t}
                    </li>
                  ))}
                </ul>

                {/* Как получить награду */}
                <h3 className="mt-6 text-sm font-semibold tracking-wide text-white/70">
                  {COPY.howToTitle}
                </h3>
                <ul className="mt-2 space-y-2">
                  {howToList.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-[6px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
                      <span className="text-white/90">{step}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
