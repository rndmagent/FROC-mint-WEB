// src/lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { fallback } from 'viem'

// ВАЖНО: явно подключаем коннекторы
import { injected } from 'wagmi/connectors'          // встроенные кошельки (MM, Rainbow и т.п.)
import { walletConnect } from 'wagmi/connectors'     // WC v2
import { coinbaseWallet } from 'wagmi/connectors'    // Coinbase Wallet

const WC_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID!
const RPC_1 = process.env.NEXT_PUBLIC_RPC_URL?.trim()

const RPCS = [
  RPC_1,
  'https://base.llamarpc.com',
  'https://base.publicnode.com',
  'https://lb.drpc.org/ogrpc?network=base&dkey=public',
].filter(Boolean) as string[]

// Без stallTimeout — указываем timeout на каждом http-транспорте.
const transport = fallback(
  RPCS.map((url) =>
    http(url, {
      retryCount: 1,   // одна попытка на этот эндпоинт
      timeout: 1500,   // 1.5s → viem автоматом переключится на следующий
    }),
  ),
  { rank: false },     // идём по порядку, как в массиве
)

// Метаданные приложения — помогают диплинкам кошельков на iOS
const metadata = {
  name: 'FROC Mint',
  description: 'FROC Multiverse NFT',
  url: 'https://froc-nft.com',
  icons: ['https://froc-nft.com/favicon.ico'],
}

export const config = createConfig({
  chains: [base],
  transports: { [base.id]: transport },
  // ЯВНОЕ описание коннекторов
  connectors: [
    // Встроенный (MetaMask/Rainbow/Braavos и т.п.) — включаем shimDisconnect для iOS
    injected({ shimDisconnect: true }),

    // WalletConnect v2
    walletConnect({
      projectId: WC_ID,
      metadata,
      showQrModal: true,                 // для десктопа покажет QR
      qrModalOptions: { themeMode: 'dark' },
    }),

    // Coinbase Wallet (их собственный коннектор)
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
      preference: 'all',                 // даёт и диплинк, и QR при необходимости
    }),
  ],
  ssr: true,
})
