// src/lib/wagmi.ts
import { http } from 'viem'
import { base } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

const WC_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''

if (!WC_ID && typeof window !== 'undefined') {
  // не логируем сам ID, только факт отсутствия
  console.warn('WARN: NEXT_PUBLIC_WC_PROJECT_ID is missing at runtime')
}

export const config = getDefaultConfig({
  appName: 'FROC Mint',
  projectId: WC_ID || 'stub-project-id',   // заглушка, чтобы не падал рантайм
  ssr: true,
  chains: [base],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://base.llamarpc.com'),
  },
})