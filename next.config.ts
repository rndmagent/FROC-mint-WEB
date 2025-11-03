// next.config.ts
import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

// Content Security Policy
const csp = [
  // Базовые источники
  "default-src 'self'",
  "base-uri 'self'",
  // Скрипты/стили (Next + inline для hydration/Tailwind)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src  'self' 'unsafe-inline'",
  // Картинки (локальные, data/blob, и иконки WC + наши IPFS-картинки)
  [
    "img-src 'self' data: blob:",
    "https://assets.walletconnect.com",
    "https://gateway.lighthouse.storage",
  ].join(' '),
  // Медиа (фон. музыка из /public)
  "media-src 'self' data:",
  // Сетевые запросы (RPC, WC, IPFS-мета и т.д.)
  [
    "connect-src 'self'",
    // Base RPC + твои фолбэки
    "https://mainnet.base.org",
    "https://base.llamarpc.com",
    "https://base.publicnode.com",
    "https://lb.drpc.org",
    // WalletConnect v2 (HTTP + WS)
    "https://rpc.walletconnect.com",
    "https://api.walletconnect.com",
    "https://relay.walletconnect.com",
    "https://*.walletconnect.com",
    "wss://relay.walletconnect.com",
    "wss://*.walletconnect.com",
    // Метаданные/картинки токенов через Lighthouse
    "https://gateway.lighthouse.storage",
  ].join(' '),
  // Шрифты
  "font-src 'self' data:",
  // Встраивание фреймов (на всякий случай WC-поддомены)
  [
    "frame-src 'self'",
    "https://*.walletconnect.com",
  ].join(' '),
  // Запрет на встраивание нашего сайта куда-либо
  "frame-ancestors 'none'",
].join('; ')

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  async headers() {
    if (!isProd) return []
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          // ВАЖНО: CSP последним, чтобы было видно целиком в devtools
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
