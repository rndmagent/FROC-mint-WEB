/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  productionBrowserSourceMaps: false,

  async headers() {
    // В DEV не ставим хедеры — чтобы ничего не блокировало локальную разработку
    if (!isProd) return []

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // В PROD разрешаем нужные домены + wss для WalletConnect
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data:; " +
              "connect-src 'self' https://mainnet.base.org https://rpc.walletconnect.com https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.com; " +
              "frame-ancestors 'none';"
          },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
    ]
  },
}

export default nextConfig