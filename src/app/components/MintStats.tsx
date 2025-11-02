// src/app/components/MintStats.tsx
'use client'

import { useReadContract } from 'wagmi'
import { FROC_ADDRESS, FROC_ABI } from '@/lib/contract'
const toNum = (v: unknown) => (typeof v === 'bigint' ? Number(v) : 0)

export default function MintStats() {
  const { data: total } = useReadContract({ address: FROC_ADDRESS, abi: FROC_ABI, functionName: 'totalMinted' })
  const { data: max }   = useReadContract({ address: FROC_ADDRESS, abi: FROC_ABI, functionName: 'MAX_SUPPLY' })

  const minted = toNum(total)
  const cap    = toNum(max)

  return (
    <div className="mx-auto -mt-2 mb-6 flex max-w-6xl justify-center px-6">
      <div className="inline-flex items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4">
        <span className="text-5xl font-extrabold leading-none tracking-tight">{minted}</span>
        <span className="mb-1 text-2xl opacity-70">/ {cap || '-'}</span>
        <span className="mb-1 text-xs uppercase tracking-wider text-white/60">Minted</span>
      </div>
    </div>
  )
}