import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

// CSP
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  [
    "img-src 'self' data: blob:",
    "https://assets.walletconnect.com",   // иконки WC
  ].join(' '),
  [
    "connect-src 'self'",
    "https://mainnet.base.org",           // Base офиц. RPC
    "https://base.llamarpc.com",          // Llama RPC (CORS ок)
    "https://rpc.walletconnect.com",      // WC RPC
    "https://api.walletconnect.com",      // WC API
    "https://relay.walletconnect.com",    // WC relay (HTTP)
    "https://*.walletconnect.com",        // WC поддомены (HTTP)
    "wss://relay.walletconnect.com",      // WC relay (WS)
    "wss://*.walletconnect.com",          // WC поддомены (WS)
  ].join(' '),
  "font-src 'self' data:",
  "frame-src 'self'",
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
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
    ]
  },
}

export default nextConfig
