import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  async headers() {
    // ВРЕМЕННО: без заголовков безопасности, чтобы проверить, что не CSP ломает WC/RPC.
    return []
  },
}

export default nextConfig