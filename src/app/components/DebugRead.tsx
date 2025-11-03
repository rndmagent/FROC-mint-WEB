'use client'

import { useReadContract } from 'wagmi'
import { FROC_ABI, FROC_ADDRESS } from '@/lib/contract'

function Line({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ opacity: 0.85, fontSize: 12, lineHeight: '18px' }}>
      <strong>{label}:</strong> {String(value)}
    </div>
  )
}

export default function DebugRead() {
  // ====== READS, строго по твоему ABI ======
  const price = useReadContract({
    address: FROC_ADDRESS,
    abi: FROC_ABI,
    functionName: 'price',
    chainId: 8453,
  })

  const mintActive = useReadContract({
    address: FROC_ADDRESS,
    abi: FROC_ABI,
    functionName: 'mintActive',
    chainId: 8453,
  })

  const metadataFrozen = useReadContract({
    address: FROC_ADDRESS,
    abi: FROC_ABI,
    functionName: 'metadataFrozen',
    chainId: 8453,
  })

  const totalMinted = useReadContract({
    address: FROC_ADDRESS,
    abi: FROC_ABI,
    functionName: 'totalMinted',
    chainId: 8453,
  })

  const maxSupply = useReadContract({
    address: FROC_ADDRESS,
    abi: FROC_ABI,
    functionName: 'MAX_SUPPLY',
    chainId: 8453,
  })

  // В ABI НЕТ baseURI(), есть tokenURI(uint256) — пробуем для id=1
  const tokenUri1 = useReadContract({
    address: FROC_ADDRESS,
    abi: FROC_ABI,
    functionName: 'tokenURI',
    args: [BigInt(1)] as const,
    chainId: 8453,
  })

  // Логи ошибок (увидим точный текст в консоли, если что-то не так)
  if (price.error) console.error('price error:', price.error)
  if (mintActive.error) console.error('mintActive error:', mintActive.error)
  if (metadataFrozen.error) console.error('metadataFrozen error:', metadataFrozen.error)
  if (totalMinted.error) console.error('totalMinted error:', totalMinted.error)
  if (maxSupply.error) console.error('MAX_SUPPLY error:', maxSupply.error)
  if (tokenUri1.error) console.error('tokenURI(1) error:', tokenUri1.error)

  return (
    <div style={{ marginTop: 8 }}>
      <Line label="price" value={price.status === 'success' ? price.data : price.status} />
      <Line label="mintActive" value={mintActive.status === 'success' ? mintActive.data : mintActive.status} />
      <Line label="metadataFrozen" value={metadataFrozen.status === 'success' ? metadataFrozen.data : metadataFrozen.status} />
      <Line label="totalMinted" value={totalMinted.status === 'success' ? totalMinted.data : totalMinted.status} />
      <Line label="MAX_SUPPLY" value={maxSupply.status === 'success' ? maxSupply.data : maxSupply.status} />
      <Line label="tokenURI(1)" value={tokenUri1.status === 'success' ? tokenUri1.data : tokenUri1.status} />
    </div>
  )
}
