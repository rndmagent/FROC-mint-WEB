'use client'

import { useState } from 'react'
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { base } from 'wagmi/chains'
import { formatEther } from 'viem'
import { FROC_ADDRESS, FROC_ABI } from '@/lib/contract'


export default function MintForm() {
  const [qty, setQty] = useState(1)
  const chainId = useChainId()
  const { isConnected } = useAccount()
  const { switchChainAsync, isPending: switching } = useSwitchChain()
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()

  const { data: price }   = useReadContract({ address: FROC_ADDRESS, abi: FROC_ABI, functionName: 'price' })
  const { data: active }  = useReadContract({ address: FROC_ADDRESS, abi: FROC_ABI, functionName: 'mintActive' })
  const { isLoading: waiting, isSuccess: mined, error: waitError } = useWaitForTransactionReceipt({ hash })

  const totalEth = typeof price === 'bigint' ? price * BigInt(qty) : undefined
  const onMinus = () => setQty(q => Math.max(1, q - 1))
  const onPlus  = () => setQty(q => Math.min(10, q + 1))

  async function ensureBase() {
    if (chainId !== base.id) {
      await switchChainAsync({ chainId: base.id })
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

  const notBase = chainId !== base.id
  const disabled =
    !isConnected || active === false || typeof price !== 'bigint' || isPending || waiting || switching || notBase

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
          <button onClick={onMinus} className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15">−</button>
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
          <button onClick={onPlus} className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15">+</button>
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
        {writeError && <div className="text-red-400">{String((writeError as any)?.shortMessage || writeError.message)}</div>}
        {waitError && <div className="text-red-400">{String((waitError as any)?.shortMessage || waitError.message)}</div>}
        {hash && !waiting && !waitError && (
          <a className="text-white/70 underline" href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noreferrer">
            View on BaseScan
          </a>
        )}
        <div className="mt-2 text-white/50">
          Always check <b>To</b>, <b>Value</b> and network in wallet before confirming.
        </div>
      </div>
    </div>
  )
}