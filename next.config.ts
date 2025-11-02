import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

// Content-Security-Policy: собираем строку из частей, чтобы было наглядно
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  [
    "connect-src 'self'",
    "https://mainnet.base.org",         // Base RPC
    "https://rpc.walletconnect.com",    // WC RPC
    "https://relay.walletconnect.com",  // WC relay (HTTP)
    "https://*.walletconnect.com",      // WC поддомены (HTTP)
    "wss://relay.walletconnect.com",    // WC relay (WS)
    "https://base.llamarpc.com" ,
    "wss://*.walletconnect.com",        // WC поддомены (WS)
  ].join(' '),
  "frame-ancestors 'none'",
].join('; ')

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,

  async headers() {
    // В DEV заголовки не ставим, чтобы ничего не мешало локальной разработке
    if (!isProd) return []

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy', value: csp },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig