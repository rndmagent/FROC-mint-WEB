// src/lib/wagmi.ts
'use client'

/**
 * ✅ Цель файла:
 * 1) Дать RainbowKit полный набор кошельков (WalletConnect v2, injected и т.д.)
 * 2) Сохранить наш надёжный fallback-транспорт по нескольким RPC
 * 3) Работать и на десктопе, и на мобилках (список кошельков снова появится)
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { http, fallback } from 'viem'

// ---- RPC fallback (по порядку, без rank) ------------------------------------
const RPC_1 = process.env.NEXT_PUBLIC_RPC_URL?.trim()
const RPCS = [
  RPC_1,
  'https://base.llamarpc.com',
  'https://base.publicnode.com',
  'https://lb.drpc.org/ogrpc?network=base&dkey=public',
].filter(Boolean) as string[]

/**
 * ВАЖНО: не используем stallTimeout (его нет в этой версии типов viem).
 * Даём каждому http-инстансу явный timeout. Если RPC молчит > timeout,
 * fallback переключится на следующий.
 */
const transport = fallback(
  RPCS.map((url) =>
    http(url, {
      retryCount: 1,  // 1 повтор до переключения на следующий RPC
      timeout: 1500,  // 1.5s на ответ
    }),
  ),
  { rank: false },     // идём строго по списку RPCS
)

// ---- RainbowKit + WalletConnect v2 ------------------------------------------
/**
 * Нужен projectId для WalletConnect v2:
 *  - добавь в Vercel/локально переменную окружения:
 *    NEXT_PUBLIC_WC_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *  - без projectId модалка кошельков будет "пустая".
 */
const WC_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID!
if (!WC_ID && typeof window !== 'undefined') {
  console.warn(
    '[wagmi] NEXT_PUBLIC_WC_PROJECT_ID не задан — список кошельков может быть пустым.',
  )
}

/**
 * getDefaultConfig вернёт готовый wagmi-config со всеми коннекторами:
 * injected, WalletConnect, Coinbase и т.д. — это и возвращает список
 * кошельков в модалке на десктопе и мобилках.
 */
export const config = getDefaultConfig({
  appName: 'FROC Mint',
  projectId: WC_ID,
  chains: [base],
  transports: { [base.id]: transport }, // наш fallback-транспорт
  ssr: true,
})

// (опционально) если где-то нужен типизированный createConfig — оставим экспорт.
// Но основной конфиг — тот, что выше (с коннекторами RainbowKit).
export type AppWagmiConfig = typeof config
