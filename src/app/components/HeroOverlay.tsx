'use client'
import Image from 'next/image'

export default function HeroOverlay() {
  return (
    <section className="mx-auto mt-8 mb-8 max-w-6xl px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        {/* Баннер */}
        <div className="relative h-[320px] sm:h-[380px] md:h-[420px]">
          <Image
            src="/banner.png"          // файл в /public/banner.png
            alt="FROC Multiverse"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Маска для читабельности текста */}
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
        </div>

        {/* Текстовая панель поверх баннера (слева) */}
        <div className="pointer-events-none absolute inset-0 flex items-start">
          <div className="pointer-events-auto m-6 sm:m-8 md:m-10 max-w-2xl rounded-2xl bg-black/35 p-5 sm:p-6 md:p-7 backdrop-blur-md border border-white/10">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              FROC <span className="opacity-90">Multiverse NFT</span>
            </h1>
            <p className="mt-3 text-[15px] sm:text-[16px] leading-7 text-white/90">
              The Froc Multiverse NFT collection is a limited series featuring <b>3,333 unique frogs</b> with a
              distinctive, eye-catching design. Each Froc is ready to become a special addition to your collection or
              serve as a really cool profile picture, effortlessly showcasing your style online.
            </p>
            <p className="mt-3 text-[15px] sm:text-[16px] leading-7 text-white/90">
              This digital art is centered purely around the spirit of collecting and fun. We have also hidden a few
              secrets within the Multiverse lore that the community will enjoy discovering and unraveling. <b>Find your
              own unique Froc</b> and join the adventure.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}