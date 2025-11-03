import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { fallback } from 'viem'

const RPC_1 = process.env.NEXT_PUBLIC_RPC_URL?.trim()
const RPCS = [
  RPC_1,
  'https://base.llamarpc.com',
  'https://base.publicnode.com',
  'https://lb.drpc.org/ogrpc?network=base&dkey=public',
].filter(Boolean) as string[]

// ❗️Без stallTimeout. Таймаут задаём каждому http-транспорту через `timeout`.
const transport = fallback(
  RPCS.map((url) =>
    http(url, {
      retryCount: 1,   // одна попытка на этот эндпоинт
      timeout: 1500,   // 1.5s — если не ответил, viem переключится на следующий
    }),
  ),
  {
    rank: false,       // пробуем по порядку, как в массиве
    // никаких stallTimeout тут не указываем — его нет в этой версии типов
  },
)

export const config = createConfig({
  chains: [base],
  transports: { [base.id]: transport },
  ssr: true,
})