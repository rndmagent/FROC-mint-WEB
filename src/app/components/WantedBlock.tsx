'use client'

import Image from 'next/image'
import { useMemo } from 'react'

/** ---------------------- НАСТРОЙКИ (МЕНЯТЬ ТУТ) ---------------------- */
/** Единственное место, где редактируется награда в долларах */
const PRICE_USD = 100

/** Постеры (положи свои файлы в /public и поменяй пути при необходимости) */
const IMAGES = {
  wanted: '/wanted-froc.png', // постер для режима "WANTED"
  caught: '/caught-froc.png', // постер для режима "CAUGHT"
}

/** Тексты на сайте (английский). Можно спокойно менять. */
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
/** -------------------------------------------------------------------- */

type Mode = 'wanted' | 'caught'

/** Пропсы компонента */
export default function WantedBlock({ mode = 'wanted' as Mode }: { mode?: Mode }) {
  /** Флаг текущего режима */
  const isWanted = mode === 'wanted'

  /** Выбор постера по режиму */
  const posterSrc = isWanted ? IMAGES.wanted : IMAGES.caught

  /** Подготовка списков (мемоизация для стабильного рендера) */
  const traitsList = useMemo(() => COPY.traits, [])
  const howToList = useMemo(() => COPY.howToSteps(PRICE_USD), [])

  /** Рендер бэйджа (небольшой вспомогательный компонент) */
  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  )

  return (
    <section className="mx-auto mt-8 max-w-6xl px-6">
      <div
        className="
          relative overflow-hidden rounded-2xl
          border border-white/10 bg-white/5 backdrop-blur
          shadow-[0_8px_30px_rgba(0,0,0,.35)]
        "
      >
        {/* Тонкая градиентная линия сверху — просто акцент */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400/70 via-sky-400/70 to-violet-400/70" />

        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1.1fr_1fr]">
          {/* ЛЕВАЯ КОЛОНКА — текст */}
          <div>
            {/* Статусные бэйджи */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge>{isWanted ? 'Active bounty' : 'Status: caught'}</Badge>
              {isWanted && <Badge>Bounty: ${PRICE_USD}</Badge>}
            </div>

            {/* Заголовки/подзаголовки */}
            <h2 className="text-2xl font-bold tracking-tight">
              {isWanted ? COPY.titleWanted : COPY.titleCaught}
            </h2>
            <p className="mt-1 text-white/80">
              {isWanted ? COPY.subtitleWanted(PRICE_USD) : COPY.subtitleCaught}
            </p>

            {/* Блоки для режима WANTED: приметы и инструкции */}
            {isWanted && (
              <>
                {/* Особые приметы */}
                <h3 className="mt-6 text-sm font-semibold tracking-wide text-white/70">
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
                      <span className="mt-[2px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
                      <span className="text-white/90">{step}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* RIGHT: poster — без лишней высоты */}
<div className="relative">
  <div
    className="
      relative w-full overflow-hidden rounded-xl
      border border-white/10 bg-black/20 p-2
      shadow-[0_8px_30px_rgba(0,0,0,.35)]
      flex items-center justify-center
    "
  >
    {/* даём intrinsic ratio через width/height и позволяем высоте быть auto */}
    <Image
      src={posterSrc}
      alt={isWanted ? 'Wanted FROC' : 'Caught FROC'}
      width={900}            // любое адекватное соотношение (портрет)
      height={1200}
      className="w-full h-auto max-h-[70vh] object-contain"
      priority
    />
  </div>

  <div className="mt-2 text-center text-xs text-white/70">
    {isWanted
      ? 'Match the exact FROC by its features.'
      : 'Case closed. Watch for the next bounty.'}
  </div>
</div>

        </div>
      </div>
    </section>
  )
}
