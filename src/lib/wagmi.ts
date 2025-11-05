// src/lib/wagmi.ts
'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base } from 'wagmi/chains'
import { http, fallback } from 'viem'

// RPC fallback (как у тебя)
const RPC_1 = process.env.NEXT_PUBLIC_RPC_URL?.trim()
const RPCS = [
  RPC_1,
  'https://base.llamarpc.com',
  'https://base.publicnode.com',
  'https://lb.drpc.org/ogrpc?network=base&dkey=public',
].filter(Boolean) as string[]

const transport = fallback(
  RPCS.map((url) => http(url, { retryCount: 1, timeout: 1500 })),
  { rank: false },
)

// Конфиг RainbowKit/Wagmi — строго по доке
export const config = getDefaultConfig({
  appName: 'FROC NFT',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!, // обязательно
  chains: [base],
  transports: { [base.id]: transport },
  ssr: true,
})
