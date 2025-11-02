// src/app/components/MintInfo.tsx
'use client'

import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { FROC_ADDRESS, FROC_ABI } from '@/lib/contract'

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-white/70">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export default function MintInfo() {
  const { data: price }  = useReadContract({ address: FROC_ADDRESS, abi: FROC_ABI, functionName: 'price' })
  const { data: active } = useReadContract({ address: FROC_ADDRESS, abi: FROC_ABI, functionName: 'mintActive' })
  const { data: frozen } = useReadContract({ address: FROC_ADDRESS, abi: FROC_ABI, functionName: 'metadataFrozen' })
  const { data: total }  = useReadContract({ address: FROC_ADDRESS, abi: FROC_ABI, functionName: 'totalMinted' })
  const { data: max }    = useReadContract({ address: FROC_ADDRESS, abi: FROC_ABI, functionName: 'MAX_SUPPLY' })

  const p  = typeof price === 'bigint' ? formatEther(price) : '-'
  const tm = typeof total === 'bigint' ? Number(total) : 0
  const mx = typeof max   === 'bigint' ? Number(max)   : 0

  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
      <Line label="Status"   value={active ? 'Mint Active' : 'Mint Paused'} />
      <Line label="Metadata" value={frozen ? 'Frozen' : 'Mutable'} />
      <Line label="Price"    value={p === '-' ? '-' : `${p} ETH`} />
      <Line label="Supply"   value={`${tm} / ${mx || '-'}`} />
    </div>
  )
}