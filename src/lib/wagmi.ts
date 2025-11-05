// src/lib/wagmi.ts
'use client'

import { createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { http, fallback } from 'viem'
import { metaMask, injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// --- RPC fallback (оставил твою логику) ---
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

// --- МЕТАДАННЫЕ dApp (важно для iOS deeplink) ---
const appName = 'FROC Mint'
const appUrl = 'https://froc-nft.com'              // тот же домен, где открыт сайт
const appIcon = 'https://froc-nft.com/icon512.png' // положи PNG 512x512 в /public
const appDescription = 'FROC Multiverse mint on Base'

// --- WalletConnect projectId ---
const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID!

export const config = createConfig({
  chains: [base],
  transports: { [base.id]: transport },
  ssr: true,

  connectors: [
    // MetaMask (в т.ч. в мобильном встроенном браузере)
    metaMask({
      dappMetadata: {
        name: appName,
        url: appUrl, // у wagmi v2 здесь только name и url
      },
    }),

    // Любые другие injected-кошельки
    injected({
      shimDisconnect: true,
    }),

    // Coinbase (у тебя уже работает)
    coinbaseWallet({
      appName,
      appLogoUrl: appIcon,
    }),

    // WalletConnect (критично для iOS: тут иконка и url реально учитываются)
    walletConnect({
      projectId: wcProjectId,
      metadata: {
        name: appName,
        description: appDescription,
        url: appUrl,
        icons: [appIcon],
      },
    }),
  ],
})
