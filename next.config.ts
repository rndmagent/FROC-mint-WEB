/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  async headers() {
    // ВРЕМЕННО: никакие заголовки не ставим, чтобы проверить CSP
    return [];
  },
};
export default nextConfig;