// next.config.ts
import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

// --- Content Security Policy ---
const csp = [
  // базовые
  "default-src 'self'",
  "base-uri 'self'",

  // скрипты/стили (Next/Tailwind)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",

  // изображения (локальные, WC, лайтхаус)
  [
    "img-src 'self' data: blob:",
    'https://assets.walletconnect.com',
    'https://images.walletconnect.com',
    'https://explorer-api.walletconnect.com',
    'https://gateway.lighthouse.storage',
  ].join(' '),

  // аудио/видео из /public
  "media-src 'self' data:",

  // СЕТЬ: RPC + WalletConnect (HTTP + WSS)
  [
    "connect-src 'self'",
    // Base RPC
    'https://mainnet.base.org',
    'https://base.llamarpc.com',
    'https://base.publicnode.com',
    'https://lb.drpc.org',
    // Lighthouse (metadata/images)
    'https://gateway.lighthouse.storage',
    // WalletConnect официальные домены
    'https://relay.walletconnect.com',
    'wss://relay.walletconnect.com',
    'https://rpc.walletconnect.com',
    'https://explorer-api.walletconnect.com',
    'https://registry.walletconnect.com',        // ← добавил (по их реестру)
    'https://images.walletconnect.com',
    // wildcard на *.walletconnect.com (на случай внутренних поддоменов SDK)
    'https://*.walletconnect.com',
    'wss://*.walletconnect.com',
    // deeplink-домены некоторых кошельков
    'https://*.app.link',
  ].join(' '),

  // шрифты
  "font-src 'self' data:",

  // фреймы (если когда-то понадобится WC-виджет)
  ["frame-src 'self'", 'https://*.walletconnect.com'].join(' '),

  // воркеры (нужны некоторым сборкам Next)
  "worker-src 'self' blob:",

  // запрет встраивания нашего сайта
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
          { key: 'Content-Security-Policy', value: csp }, // ← важный заголовок
        ],
      },
    ]
  },
}

export default nextConfig
