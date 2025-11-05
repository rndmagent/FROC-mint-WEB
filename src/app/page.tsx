// src/app/page.tsx
'use client'

// Мелодия на фоне (из /public)
import BackgroundAudio from './components/BackgroundAudio'
// Наш диагностический блок (WSS / WC relay статусы)
import DebugStatus from './components/DebugStatus'

// Кнопка коннекта RainbowKit (рендерит модалку кошельков)
import { ConnectButton } from '@rainbow-me/rainbowkit'

// Контентные блоки страницы (хиро, инфо о минтаже, форма минта, статистика, соц.ссылки, дисклеймер)
import Hero from './components/Hero'
import MintInfo from './components/MintInfo'
import MintForm from './components/MintForm'
import MintStatsInline from './components/MintStatsInline'
import SocialIcons from './components/SocialIcons'
import Disclaimer from './components/Disclaimer'

// Карусель превью NFT
import NFTCarousel from './components/NFTCarousel'

export default function Page() {
  return (
    // Корневой контейнер страницы: фон, цвет текста, обрезка overflow для эффектов
    <main className="min-h-screen bg-[#0b0b0f] text-white relative overflow-hidden">
      {/* === ФИКСИРОВАННЫЙ ФОНОВЫЙ КОЛЛАЖ (под всем контентом) === */}
      <div className="bg-collage">
        <img src="/collage.png" alt="" />
      </div>

      {/* Фоновая музыка (плеер скрыт) */}
      <BackgroundAudio />

      {/* Слабые «световые орбы» над коллажем, но под контентом */}
      <div className="pointer-events-none absolute inset-0 opacity-60 blur-3xl">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_#2563eb_0%,_transparent_60%)]" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_#9333ea_0%,_transparent_60%)]" />
      </div>

      {/* Основной слой с контентом */}
      <div className="relative z-10">
        {/* Хиро-блок */}
        <Hero />

        {/* Карточка минта */}
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.35)] backdrop-blur">
            {/* Верхняя строка статуса + иконки соцсетей */}
            <div className="mb-4 flex items-center justify-between text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Ready to connect
              </span>

              <div className="flex items-center gap-3">
                <span className="opacity-80 hidden sm:inline">Network: Base</span>
                <SocialIcons />
              </div>
            </div>

            {/* Кнопка RainbowKit */}
            <div className="flex items-center justify-center mb-4">
              <ConnectButton accountStatus="address" chainStatus="name" showBalance={false} />
            </div>

            {/* Подсказка под кнопкой */}
            <p className="mt-2 text-xs text-white/60">
              <b>Having trouble connecting on mobile?</b> Try <span className="underline">WalletConnect</span> or a desktop browser.
            </p>

            {/* Информация, форма минта и инлайн-статистика */}
            <MintInfo />
            <MintForm />
            <MintStatsInline />

            {/* --- Showcase: превью NFT под цифрами --- */}
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-white/80">Preview the FROCs</h3>
              <NFTCarousel
                images={[
                  // Положи превью в /public/previews/... или вставь прямые HTTPS/IPFS ссылки
                  '/previews/001.png',
                  '/previews/002.png',
                  '/previews/003.png',
                  '/previews/004.png',
                  '/previews/005.png',
                  '/previews/006.png',
                  '/previews/007.png',
                  '/previews/008.png',
                  '/previews/009.png',
                  '/previews/010.png',
                  '/previews/011.png',
                  '/previews/012.png',
                ]}
                auto={true}
                intervalMs={3200}
                height={260} // 220–320 подбирай по вкусу
              />
              
            </div>
            {/* --- /Showcase --- */}

            {/* Дисклеймер и диагностический блок */}
            <Disclaimer />
            <DebugStatus />
          </div>

          {/* Низ карточки: ссылки Contract / BaseScan / OpenSea */}
          <div className="mx-auto max-w-6xl px-6 pt-4">
            <div className="flex items-center gap-4 text-sm text-white/60">
              <a className="hover:text-white/80" href="#">Contract</a>
              <span>•</span>
              <a className="hover:text-white/80" href="#">BaseScan</a>
              <span>•</span>
              <a className="hover:text-white/80" href="#">OpenSea</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
