'use client'

import Image from 'next/image'
import { useMemo } from 'react'

/** ===================== НАСТРОЙКИ (менять тут) ===================== */
const PRICE_USD = 100

const IMAGES = {
  wanted: '/wanted-froc.png',
  caught: '/caught-froc.png',
}

const COPY = {
  titleWanted: 'ATTENTION: WANTED',
  subtitleWanted: (price: number) =>
    `A highly dangerous FROC is wanted. Bounty: $${price}.`,
  traitsTitle: 'DISTINGUISHING FEATURES',
  traits: [
    'Background — Brick Tone',
    'Arm — blaster',
    'Body — code',
    'Cloth — striped tshirt',
    'Headdress — MMGA cap',
    'Eyes — eyes hetero',
    'Mouth — cigar',
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

export default function WantedBlock({ mode = 'wanted' as Mode }: { mode?: Mode }) {
  const isWanted = mode === 'wanted'
  const posterSrc = isWanted ? IMAGES.wanted : IMAGES.caught

  const traitsList = useMemo(() => COPY.traits, [])
  const howToList = useMemo(() => COPY.howToSteps(PRICE_USD), [])

  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  )

  return (
    <section className="mx-auto mt-8 max-w-6xl px-0 sm:px-6">
      <div className="relative overflow-hidden rounded-none sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,.35)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400/70 via-sky-400/70 to-violet-400/70" />

        {/* Шапка */}
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

        {/* Контент: mobile → постер сверху; ≥md → 2 колонки, текст слева, постер справа */}
        <div className="mt-4 grid sm:gap-6 md:grid-cols-2 md:gap-10 md:px-6 md:pb-6 items-start">
          {/* POSTER — mobile first: сверху; desktop: справа. 
              Десктопный блок взят из «старой» версии без изменений */}
          <div className="order-1 md:order-2 px-0">
            <div
              className="
                relative w-full overflow-hidden rounded-xl
                border border-white/10 bg-black/20 p-2
                shadow-[0_8px_30px_rgba(0,0,0,.35)]
                flex items-center justify-center
                max-w-[560px] mx-auto md:ml-auto
              "
            >
              <Image
                src={posterSrc}
                alt={isWanted ? 'Wanted FROC' : 'Caught FROC'}
                width={900}   /* портретное intrinsic ratio */
                height={1200}
                className="w-full h-auto max-h-[70vh] object-contain"
                priority
              />
            </div>

            <div className="px-4 sm:px-0 mt-2 text-center text-xs text-white/70">
              {isWanted
                ? 'Match the exact FROC by its features.'
                : 'Case closed. Watch for the next bounty.'}
            </div>
          </div>

          {/* TEXT — mobile: ниже постера; desktop: слева */}
          <div className="order-2 md:order-1 px-4 sm:px-0 md:pr-6 pb-5 md:pb-0">
            {isWanted && (
              <>
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
