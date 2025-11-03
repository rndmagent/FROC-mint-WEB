// src/lib/wagmi.ts
import { http } from 'viem'
import { base } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

if (!process.env.NEXT_PUBLIC_WC_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is missing')
}

export const config = getDefaultConfig({
  appName: 'FROC Mint',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID, // WalletConnect Project ID
  ssr: true,                                        // <— важно для Next/Vercel
  chains: [base],
  transports: {
    [base.id]: http('https://base.llamarpc.com'),   // явный RPC
  },
})
