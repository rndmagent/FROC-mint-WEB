// next.config.ts
import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

// Content Security Policy
const csp = [
  // базовые
  "default-src 'self'",
  "base-uri 'self'",

  // скрипты/стили (Next/Tailwind hydration)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",

  // картинки (локальные, data/blob, WC, IPFS)
  [
    "img-src 'self' data: blob:",
    'https://assets.walletconnect.com',
    'https://images.walletconnect.com',
    'https://explorer-api.walletconnect.com',
    'https://gateway.lighthouse.storage',
  ].join(' '),

  // медиа (наша музыка из /public)
  "media-src 'self' data:",

  // сетевые запросы (RPC, WC, IPFS)
  [
    "connect-src 'self'",
    // Base RPC
    'https://mainnet.base.org',
    'https://base.llamarpc.com',
    'https://base.publicnode.com',
    'https://lb.drpc.org',
    // Lighthouse (metadata/images)
    'https://gateway.lighthouse.storage',
    // WalletConnect (HTTP + WS)
    'https://rpc.walletconnect.com',
    'https://api.walletconnect.com',
    'https://relay.walletconnect.com',
    'https://explorer-api.walletconnect.com',
    'https://images.walletconnect.com',
    'https://*.walletconnect.com',
    'wss://relay.walletconnect.com',
    'wss://*.walletconnect.com',
    // иногда deeplink идёт через app.link у кошельков
    'https://*.app.link',
  ].join(' '),

  // шрифты
  "font-src 'self' data:",

  // если когда-то будет встраивание виджетов WC
  ["frame-src 'self'", 'https://*.walletconnect.com'].join(' '),

  // запрет встраивания нашего сайта куда-либо
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
          // CSP последним, чтобы в DevTools было видно целиком
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig