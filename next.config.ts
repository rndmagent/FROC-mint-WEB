// --- Content Security Policy ---
const csp = [
  // базовые
  "default-src 'self'",
  "base-uri 'self'",

  // скрипты/стили (Next/Tailwind)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.walletconnect.com",
  "style-src 'self' 'unsafe-inline'",

  // изображения (локальные, WC, лайтхаус)
  [
    "img-src 'self' data: blob:",
    'https://assets.walletconnect.com',
    'https://images.walletconnect.com',
    'https://explorer-api.walletconnect.com',
    'https://cdn.walletconnect.com',
    'https://gateway.lighthouse.storage',
  ].join(' '),

  // аудио/видео из /public
  "media-src 'self' data:",

  // СЕТЬ: RPC + WalletConnect (HTTP + WSS)
  [
    "connect-src 'self'",
    'https://mainnet.base.org',
    'https://base.llamarpc.com',
    'https://base.publicnode.com',
    'https://lb.drpc.org',
    'https://gateway.lighthouse.storage',
    'https://relay.walletconnect.com',
    'wss://relay.walletconnect.com',
    'https://rpc.walletconnect.com',
    'https://explorer-api.walletconnect.com',
    'https://registry.walletconnect.com',
    'https://images.walletconnect.com',
    'https://cdn.walletconnect.com',
    'https://*.walletconnect.com',
    'wss://*.walletconnect.com',
    'https://*.app.link', // уже было, оставляем
  ].join(' '),

  // шрифты
  "font-src 'self' data:",

  // фреймы (если понадобится WC-виджет)
  ["frame-src 'self'", 'https://*.walletconnect.com'].join(' '),

  // воркеры (нужны некоторым сборкам Next)
  "worker-src 'self' blob:",

  // ВАЖНО: разрешаем навигацию на универсальные ссылки и схемы кошельков (iOS)  // NEW
  [
    "navigate-to 'self' https: ",
    // universal links (Branch) — кошельки открываются через них
    'https://*.app.link',
    'https://metamask.app.link',
    // популярные схемы кошельков (iOS увидит переход)
    'metamask:',
    'rainbow:',
    'phantom:',
    'keplr:',
    'trust:',
    'okx:',
    'rabby:',
    'coinbase:',
    'zerion:',
    'safe:',
  ].join(' '), // NEW

  // запрет встраивания нашего сайта
  "frame-ancestors 'none'",
].join('; ')
