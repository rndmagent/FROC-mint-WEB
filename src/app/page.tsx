// src/app/page.tsx
'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Hero from './components/Hero'
import MintInfo from './components/MintInfo'
import MintForm from './components/MintForm'
import MintStatsInline from './components/MintStatsInline'
import SocialIcons from './components/SocialIcons'
import Disclaimer from './components/Disclaimer';

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white relative overflow-hidden">
      {/* слабые световые орбы */}
      <div className="pointer-events-none absolute inset-0 opacity-60 blur-3xl">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_#2563eb_0%,_transparent_60%)]" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_#9333ea_0%,_transparent_60%)]" />
      </div>

      <div className="relative z-10">
        <Hero />

        {/* карточка минта */}
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.35)] backdrop-blur">
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

            <div className="flex items-center justify-center mb-4">
              <ConnectButton accountStatus="address" chainStatus="name" showBalance={false} />
            </div>

            <MintInfo />
            <MintForm />
            <MintStatsInline />
            <Disclaimer />
          </div>

          {/* нижние ссылки */}
          <div className="mt-6 flex gap-4 text-xs text-white/60">
            <a className="hover:text-white/90" href="#">Contract</a>
            <span>•</span>
            <a className="hover:text-white/90" href="#">BaseScan</a>
            <span>•</span>
            <a className="hover:text-white/90" href="#">OpenSea</a>
          </div>
        </section>
      </div>
    </main>
    
  )
  
}