// src/app/page.tsx
'use client'
import WCDebug from './components/WCDebug'
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
import Disclaimer from './components/Disclaimer';

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

      {/* Слабые «световые орбы» над коллажем, но под контентом (pointer-events:none, чтобы не мешали кликам) */}
      <div className="pointer-events-none absolute inset-0 opacity-60 blur-3xl">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_#2563eb_0%,_transparent_60%)]" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_#9333ea_0%,_transparent_60%)]" />
      </div>

      {/* Основной слой с контентом (поверх фона/орбов) */}
      <div className="relative z-10">
        {/* Хиро-блок (баннер/текст) */}
        
        <Hero />
        

        {/* Карточка минта с рамкой/блюром */}
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

            {/* Кнопка RainbowKit. При клике открывает модалку выбора кошелька */}
            <div className="flex items-center justify-center mb-4">
              <ConnectButton accountStatus="address" chainStatus="name" showBalance={false} />
            </div>

            {/* Маленький подсказочный текст под кнопкой (вариант для iOS и для остальных) */}
            {typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) ? (
              <p className="mt-2 text-xs text-white/60">
                <b>Having trouble connecting on mobile?</b><br />
                On some iOS devices, tapping a wallet may not open the app. Try a desktop browser. A fix is on the way.
              </p>
            ) : (
              <p className="mt-2 text-xs text-white/60">
                <b>Having trouble connecting on mobile?</b> Try <span className="underline">WalletConnect</span> or a desktop browser.
              </p>
            )}

            {/* Информация, форма минта и инлайн-статистика */}
            <MintInfo />
            <MintForm />
            <MintStatsInline />

            {/* Дисклеймер и диагностический блок (WSS/WC) */}
            <Disclaimer />
            
            <DebugStatus />

            <WCDebug />            
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
