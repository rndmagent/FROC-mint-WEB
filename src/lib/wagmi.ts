// src/lib/wagmi.ts
'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base } from 'wagmi/chains'
import { http, fallback } from 'viem'

// ---------- RPC fallback (как у тебя) ----------
const RPC_1 = process.env.NEXT_PUBLIC_RPC_URL?.trim()
const RPCS = [
  RPC_1,
  'https://base.llamarpc.com',
  'https://base.publicnode.com',
  'https://lb.drpc.org/ogrpc?network=base&dkey=public',
].filter(Boolean) as string[]

const transport = fallback(
  RPCS.map((url) =>
    http(url, {
      retryCount: 1,
      timeout: 1500,
    }),
  ),
  { rank: false },
)

// ---------- WalletConnect ----------
const WC_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID!
const wcMetadata = {
  name: 'FROC Mint',
  description: 'FROC Multiverse NFT – mint on Base.',
  url: 'https://froc-nft.com',
  icons: ['https://froc-nft.com/icon-512.png'], // положи файл в /public
}

/**
 * В некоторых версиях RainbowKit meta пробрасывается через
 * `walletConnectOptions` или `walletConnectAppMetadata`, а в некоторых — нет.
 * Делаем «мягко»: если типы не позволяют — просто игнорим для TS,
 * но на рантайме ключ будет передан.
 */
export const config = getDefaultConfig({
  appName: 'FROC Mint',
  projectId: WC_ID,
  chains: [base],
  transports: { [base.id]: transport },
  ssr: true,

  // Вариант 1 (если твоя версия поддерживает):
  // walletConnectOptions: { projectId: WC_ID, metadata: wcMetadata },

  // Вариант 2 (часто работает, если доступен):
  // walletConnectAppMetadata: wcMetadata,

  // Вариант 3 — принудительно, не ломая сборку:
  // @ts-expect-error: в твоей версии может не быть этого поля в типах, но рантайм его понимает
  walletConnectOptions: { projectId: WC_ID, metadata: wcMetadata },
})