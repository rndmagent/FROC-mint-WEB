// src/app/components/MintForm.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from 'wagmi'
import { base } from 'wagmi/chains'
import { formatEther } from 'viem'
import { FROC_ADDRESS, FROC_ABI } from '@/lib/contract'
import MintResultModal, { MintedItem } from './MintResultModal'

// Принудительно используем Lighthouse gateway
const LH = 'https://gateway.lighthouse.storage/ipfs/'

// ipfs://<cid>/path → https://gateway.lighthouse.storage/ipfs/<cid>/path
function ipfsToLh(u?: string) {
  if (!u) return u
  return u.startsWith('ipfs://') ? LH + u.slice('ipfs://'.length) : u
}

// no-store fetch + таймаут
async function fetchJsonNoStore(url: string, timeoutMs = 8000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { cache: 'no-store', signal: ctrl.signal })
    if (!res.ok) return null
    return await res.json().catch(() => null)
  } finally {
    clearTimeout(t)
  }
}

// Мягкий поллинг метадаты с бэк-оффом
async function pollMetadata(ipfsUrl: string, attempts = 8) {
  for (let i = 1; i <= attempts; i++) {
    const json = await fetchJsonNoStore(ipfsToLh(ipfsUrl) + `?t=${Date.now()}`)
    if (json && (json.image || json.attributes)) return json
    await new Promise(r => setTimeout(r, i * 500)) // 0.5s, 1s, 1.5s, ...
  }
  return null
}

export default function MintForm() {
  // Локальные состояния
  const [qty, setQty] = useState(1)
  const [showResult, setShowResult] = useState(false)
  const [mintedItems, setMintedItems] = useState<MintedItem[]>([])

  // Web3
  const chainId = useChainId()
  const { isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { switchChainAsync, isPending: switching } = useSwitchChain()
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()

  // Чтение параметров (жёстко читаем с Base)
  const { data: price }  = useReadContract({ chainId: base.id, address: FROC_ADDRESS, abi: FROC_ABI, functionName: 'price' })
  const { data: active } = useReadContract({ chainId: base.id, address: FROC_ADDRESS, abi: FROC_ABI, functionName: 'mintActive' })

  // Ожидаем майнинг
  const { data: receipt, isLoading: waiting, isSuccess: mined, error: waitError } =
    useWaitForTransactionReceipt({ hash })

  const notBase  = chainId !== base.id
  const totalEth = typeof price === 'bigint' ? price * BigInt(qty) : undefined

  async function ensureBase() {
    if (chainId !== base.id) {
      try {
        await switchChainAsync({ chainId: base.id })
      } catch {
        return
      }
    }
  }

  async function onMint() {
    try {
      if (!isConnected || typeof price !== 'bigint') return
      await ensureBase()
      writeContract({
        address: FROC_ADDRESS,
        abi: FROC_ABI,
        functionName: 'mint',
        args: [BigInt(qty)],
        value: price * BigInt(qty),
        chainId: base.id,
      })
    } catch {
      // ошибки покажем ниже
    }
  }

  const disabled =
    !isConnected || active === false || typeof price !== 'bigint' || isPending || waiting || switching || notBase

  // После майнинга: парсим receipt → tokenIds → tokenURI → метадата
  useEffect(() => {
    if (!mined || !receipt || !publicClient) return
    (async () => {
      try {
        const TRANSFER_TOPIC =
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' as const

        const tokenIds: bigint[] = []
        for (const log of receipt.logs ?? []) {
          const sameAddress = (log as any).address?.toLowerCase() === FROC_ADDRESS.toLowerCase()
          const isTransfer  = (log as any).topics?.[0] === TRANSFER_TOPIC
          const tidHex      = (log as any).topics?.[3]
          if (sameAddress && isTransfer && tidHex) {
            try { tokenIds.push(BigInt(tidHex)) } catch {}
          }
        }
        if (!tokenIds.length) return

        const baseItems: MintedItem[] = tokenIds.map(id => ({
          tokenId: id,
          name: `FROC #${id}`,
          image: undefined,
          attributes: undefined,
          openseaUrl: `https://opensea.io/assets/base/${FROC_ADDRESS}/${id}`,
        }))
        setMintedItems(baseItems)
        setShowResult(true)

        for (const id of tokenIds) {
          let tokenUri: string | undefined
          try {
            tokenUri = await publicClient.readContract({
              address: FROC_ADDRESS,
              abi: FROC_ABI,
              functionName: 'tokenURI',
              args: [id],
            }) as unknown as string
          } catch {}
          if (!tokenUri) continue

          const meta = await pollMetadata(tokenUri)
          if (!meta) continue

          const updated: MintedItem = {
            tokenId: id,
            name: `FROC #${id}`,
            image: ipfsToLh(meta.image),
            attributes: Array.isArray(meta.attributes) ? meta.attributes : undefined,
            openseaUrl: `https://opensea.io/assets/base/${FROC_ADDRESS}/${id}`,
          }

          setMintedItems(prev => {
            const copy = [...prev]
            const ix = copy.findIndex(x => x.tokenId === id)
            if (ix !== -1) copy[ix] = updated
            return copy
          })
        }
      } catch (e) {
        console.warn('mint parse error:', e)
      }
    })()
  }, [mined, receipt, publicClient])

  // РЕНДЕР
  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      {/* Network guard */}
      {notBase && (
        <div className="rounded-md border border-amber-400/30 bg-amber-500/10 p-3 text-sm">
          <div className="mb-2 font-medium">Wrong network</div>
          <button
            onClick={ensureBase}
            className="rounded-md bg-amber-500/90 hover:bg-amber-500 px-3 py-1 font-semibold"
          >
            Switch to Base
          </button>
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">Quantity</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15"
          >−</button>
          <input
            type="number"
            min={1}
            max={10}
            value={qty}
            onChange={(e) => {
              const n = Math.max(1, Math.min(10, Number(e.target.value || 1)))
              setQty(n)
            }}
            className="w-16 text-center bg-transparent border border-white/15 rounded-md py-1"
          />
          <button
            onClick={() => setQty(q => Math.min(10, q + 1))}
            className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15"
          >+</button>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70">Total</span>
        <span className="font-semibold">
          {typeof totalEth === 'bigint' ? `${formatEther(totalEth)} ETH` : '—'}
        </span>
      </div>

      {/* Mint */}
      <button
        onClick={onMint}
        disabled={disabled}
        className="w-full mt-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed py-2 font-semibold"
      >
        {switching
          ? 'Switching…'
          : isPending || waiting
          ? 'Pending…'
          : mined
          ? 'Minted ✅'
          : active === false
          ? 'Sale Paused'
          : 'Mint'}
      </button>

      {/* Messages */}
      <div className="text-xs text-center">
        {writeError && (
          <div className="text-red-400">
            {String((writeError as any)?.shortMessage || (writeError as any)?.message || writeError)}
          </div>
        )}
        {waitError && (
          <div className="text-red-400">
            {String((waitError as any)?.shortMessage || (waitError as any)?.message || waitError)}
          </div>
        )}
        {hash && !waiting && !waitError && (
          <a className="text-white/70 underline" href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noreferrer">
            View on BaseScan
          </a>
        )}
        <div className="mt-2 text-white/50">
          Always check <b>To</b>, <b>Value</b> and network in wallet before confirming.
        </div>
      </div>

      {/* Modal */}
      <MintResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        items={mintedItems}
        txHash={hash as `0x${string}` | undefined}
      />
    </div>
  )
}
