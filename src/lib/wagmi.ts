// src/lib/wagmi.ts
'use client'

/**
 * ✅ Что делает файл:
 * 1) Включает полный список кошельков RainbowKit (через getDefaultConfig)
 * 2) Даёт надёжный fallback по нескольким RPC (viem.fallback)
 * 3) Работает и на десктопе, и на мобилках — модалка кошельков не пустая
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base } from 'wagmi/chains'
import { http, fallback } from 'viem'

// ---- RPC fallback (идём по порядку, без rank) -------------------------------
const RPC_1 = process.env.NEXT_PUBLIC_RPC_URL?.trim()
const RPCS = [
  RPC_1,
  'https://base.llamarpc.com',
  'https://base.publicnode.com',
  'https://lb.drpc.org/ogrpc?network=base&dkey=public',
].filter(Boolean) as string[]

/**
 * ВАЖНО: не используем stallTimeout (в этой версии типов viem его нет).
 * Задаём timeout каждому http-инстансу. Если RPC молчит дольше timeout,
 * fallback сам переключится на следующий.
 */
const transport = fallback(
  RPCS.map((url) =>
    http(url, {
      retryCount: 1,   // 1 повтор до переключения на следующий RPC
      timeout: 1500,   // 1.5s на ответ
    }),
  ),
  { rank: false },     // строго в порядке массива RPCS
)

// ---- RainbowKit + WalletConnect v2 ------------------------------------------
/**
 * Нужен WalletConnect Project ID:
 *   NEXT_PUBLIC_WC_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * Без него список кошельков может быть пустым.
 */
const WC_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID!

export const config = getDefaultConfig({
  appName: 'FROC Mint',
  projectId: WC_ID,                 // даёт WalletConnect v2 и полный список кошельков
  chains: [base],
  transports: { [base.id]: transport }, // наш RPC-fallback
  ssr: true,
})
