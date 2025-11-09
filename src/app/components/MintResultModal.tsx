'use client'

import { useEffect, useMemo, useState } from 'react'

export type MintedItem = {
  tokenId: bigint | number | string
  name?: string
  image?: string
  attributes?: Array<{ trait_type: string; value: string | number }>
  openseaUrl?: string
}

type Props = {
  open: boolean
  onClose: () => void
  items: MintedItem[] | undefined
  txHash?: `0x${string}` | string | undefined
}

export default function MintResultModal({ open, onClose, items, txHash }: Props) {
  // страховка: приводим входные данные к предсказуемому виду
  const safeItems = useMemo<MintedItem[]>(() => Array.isArray(items) ? items : [], [items])
  const hasItems = safeItems.length > 0

  const [idx, setIdx] = useState(0)               // текущий слайд
  const [imgKey, setImgKey] = useState(0)         // форсим перерисовку <img>
  const [dir, setDir] = useState<1 | -1>(1)       // направление анимации

  // при открытии: сбрасываем индекс, навешиваем хоткеи
  useEffect(() => {
    if (!open) return
    setIdx(0)
    setImgKey(k => k + 1)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && safeItems.length > 1) { setDir(1); next() }
      if (e.key === 'ArrowLeft'  && safeItems.length > 1) { setDir(-1); prev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, safeItems.length])

  if (!open || !hasItems) return null

  const cur = safeItems[idx]
  const humanId = typeof cur?.tokenId === 'bigint' ? cur.tokenId.toString() : String(cur?.tokenId ?? '')

  const next = () => { setIdx(i => (i + 1) % safeItems.length); setImgKey(k => k + 1) }
  const prev = () => { setIdx(i => (i - 1 + safeItems.length) % safeItems.length); setImgKey(k => k + 1) }

  const shareOnX = () => {
    const text = encodeURIComponent('I just minted a FROC on Base! #FROC #Base')
    const url  = cur?.openseaUrl
      ? encodeURIComponent(cur.openseaUrl)
      : encodeURIComponent('https://opensea.io/collection/froc-multiverse-nft')
    const u = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    window.open(u, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* затемнение (кликабельно для закрытия) */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm froc-fade-in"
      />

      {/* центрирование */}
      <div className="relative h-full w-full flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[980px] rounded-2xl border border-white/10 bg-[#0f1016] shadow-2xl froc-pop-up overflow-hidden">
          {/* заголовок */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="text-lg font-semibold">🎉 Congratulations!</div>
            <button
              onClick={onClose}
              className="rounded-md bg-white/10 hover:bg-white/15 px-3 py-1 text-sm"
            >
              Close
            </button>
          </div>

          {/* контент */}
          <div className="grid md:grid-cols-2">
            {/* левая колонка: картинка + стрелки */}
            <div className="relative isolate p-4 bg-white/5">
              {/* стрелки — поверх картинки */}
              {safeItems.length > 1 && (
                <>
                  <button
                    onClick={() => { setDir(-1); prev() }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-40
                               grid place-items-center w-9 h-9 rounded-full
                               bg-black/55 hover:bg-black/70 text-white
                               border border-white/20 shadow pointer-events-auto"
                    aria-label="Previous"
                  >
                    ‹
                  </button>

                  <button
                    onClick={() => { setDir(1); next() }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-40
                               grid place-items-center w-9 h-9 rounded-full
                               bg-black/55 hover:bg-black/70 text-white
                               border border-white/20 shadow pointer-events-auto"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </>
              )}

              {/* картинка (не ловит клики, чтобы стрелки были кликабельны) */}
              {cur?.image ? (
                <img
                  key={imgKey}
                  src={cur.image}
                  alt={cur?.name || `FROC #${humanId}`}
                  className="relative z-10 mx-auto max-w-full max-h-[40vh] md:max-h-[52vh]
                             rounded-xl object-contain froc-slide-in
                             pointer-events-none select-none"
                  style={{ ['--froc-dir' as any]: dir }}
                />
              ) : (
                <div className="relative z-10 mx-auto h-[40vh] md:h-[52vh] max-w-[520px] rounded-xl bg-white/10 animate-pulse" />
              )}

              {/* индикатор */}
              {safeItems.length > 1 && (
                <div className="relative z-20 mt-2 text-center text-xs text-white/70">
                  {idx + 1} / {safeItems.length}
                </div>
              )}
            </div>

            {/* правая колонка: метаданные */}
            <div className="p-5 overflow-y-auto max-h-[60vh] md:max-h-[56vh]">
              <div className="text-xl font-semibold mb-1">
                {cur?.name || `FROC #${humanId}`}
              </div>

              <div className="text-white/60 text-sm mb-4">
                Welcome to the Multiverse — your Froc is minted.
              </div>

              <div className="text-sm">
                <div className="mb-2 text-white/70">Attributes</div>
                <div className="grid grid-cols-2 gap-2">
                  {cur?.attributes?.length ? (
                    cur.attributes.map((a, i) => (
                      <div key={i} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-wide text-white/50">{a.trait_type}</div>
                        <div className="font-medium">{String(a.value)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-white/50">Attributes will appear shortly…</div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href="https://opensea.io/collection/froc-multiverse-nft"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
                >
                  View Collection
                </a>

                {cur?.openseaUrl && (
                  <a
                    href={cur.openseaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
                  >
                    View Token
                  </a>
                )}

                {txHash && (
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
                  >
                    BaseScan tx
                  </a>
                )}

                <button
                  onClick={shareOnX}
                  className="rounded-md bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
                >
                  Share on X
                </button>

                <div className="text-xs text-white/50 ml-auto">
                  Token ID: <b>#{humanId}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>
  )
}
