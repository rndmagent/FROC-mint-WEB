// src/app/components/MintStatsInline.tsx
'use client'
import { useReadContract } from 'wagmi'
import { FROC_ADDRESS, FROC_ABI } from '@/lib/contract'

function toNum(v: unknown) {
  return typeof v === 'bigint' ? Number(v) : 0
}

export default function MintStatsInline() {
  const total = useReadContract({
    address: FROC_ADDRESS,
    abi: FROC_ABI,
    functionName: 'totalMinted',
  })
  const max = useReadContract({
    address: FROC_ADDRESS,
    abi: FROC_ABI,
    functionName: 'MAX_SUPPLY',
  })

  const minted = toNum(total.data)
  const cap = toNum(max.data)

  return (
    <div className="mt-3 flex items-end justify-center">
      <div className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center">
        <span className="text-5xl font-extrabold tracking-tight">{minted}</span>
        <span className="mx-2 text-2xl opacity-70">/</span>
        <span className="text-3xl font-semibold opacity-80">{cap || '-'}</span>
        <span className="ml-3 text-xs uppercase tracking-wider text-white/60">Minted</span>
      </div>
    </div>
  )
}