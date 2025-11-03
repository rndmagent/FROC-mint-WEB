'use client'
import { useEffect, useState } from 'react'

export type MintedItem = {
  tokenId: bigint
  name?: string
  image?: string
  attributes?: Array<{ trait_type: string; value: string | number }>
  openseaUrl?: string
}

export default function MintResultModal(
  {
    open,
    onClose,
    items,
    txHash,
  }: {
    open: boolean
    onClose: () => void
    items: MintedItem[]
    txHash?: `0x${string}` | undefined
  }
) {
  const [idx, setIdx]   = useState(0)     // текущий элемент, если сминчено несколько
  const [imgKey, setK]  = useState(0)     // принудительное обновление <img> при смене
  const [dir, setDir]   = useState<1|-1>(1) // направление анимации (влево/вправо)

  // При открытии: сбросить индекс, подписаться на ESC/стрелки
  useEffect(() => {
    if (!open) return
    setIdx(0)
    setK(k => k + 1)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') { setDir(1); next() }
      if (e.key === 'ArrowLeft')  { setDir(-1); prev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null
  const cur = items[idx]

  const next = () => { setIdx(i => (i + 1) % items.length); setK(k => k + 1) }
  const prev = () => { setIdx(i => (i - 1 + items.length) % items.length); setK(k => k + 1) }

  // Кнопка “Share on X”
  function shareOnX() {
    const text = encodeURIComponent(`I just minted a FROC on Base! #FROC #Base`)
    const url  = cur?.openseaUrl ? encodeURIComponent(cur.openseaUrl) : encodeURIComponent('https://opensea.io/collection/froc-multiverse-nft')
    const u = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    window.open(u, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Тёмный фон */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      {/* Центрирование */}
      <div className="relative h-full w-full flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[980px] rounded-2xl border border-white/10 bg-[#0f1016] shadow-2xl animate-popUp overflow-hidden">
          {/* Хедер */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="text-lg font-semibold">🎉 Congratulations!</div>
            <button
              onClick={onClose}
              className="rounded-md bg-white/10 hover:bg-white/15 px-3 py-1 text-sm"
            >
              Close
            </button>
          </div>

          {/* Контент */}
          <div className="grid md:grid-cols-2">
            {/* Картинка слева */}
            <div className="relative p-4 bg-white/5">
              {items.length > 1 && (
                <>
                  <button
                    onClick={() => { setDir(-1); prev() }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 hover:bg-white/25 w-9 h-9"
                    aria-label="Prev"
                  >‹</button>
                  <button
                    onClick={() => { setDir(1); next() }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 hover:bg-white/25 w-9 h-9"
                    aria-label="Next"
                  >›</button>
                </>
              )}

              {cur?.image ? (
                <img
                  key={imgKey}
                  src={cur.image}
                  alt={cur?.name || `FROC #${cur.tokenId}`}
                  className="mx-auto max-w-full max-h-[40vh] md:max-h-[52vh] rounded-xl object-contain animate-slideIn"
                  style={{ ['--dir' as any]: dir }}
                />
              ) : (
                <div className="mx-auto h-[40vh] md:h-[52vh] max-w-[520px] rounded-xl bg-white/10 animate-pulse" />
              )}

              {items.length > 1 && (
                <div className="mt-2 text-center text-xs text-white/70">
                  {idx + 1} / {items.length}
                </div>
              )}
            </div>

            {/* Метадата справа (прокручиваемая) */}
            <div className="p-5 overflow-y-auto max-h-[60vh] md:max-h-[56vh]">
              <div className="text-xl font-semibold mb-1">
                {cur?.name || `FROC #${cur.tokenId}`}
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
                  Token ID: <b>#{String(cur?.tokenId ?? '')}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Анимации (минималистично и приятно) */}
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn .35s ease both; }
        .animate-popUp { animation: popUp .35s cubic-bezier(.15,.75,.2,1.1) both; }
        .animate-slideIn { animation: slideIn .28s ease both; }

        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popUp { 0% { opacity: 0; transform: translateY(14px) scale(.96) } 100% { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(calc(var(--dir, 1) * 12px)) }
          to   { opacity: 1; transform: translateX(0) }
        }
      `}</style>
    </div>
  )
}
