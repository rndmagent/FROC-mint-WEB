'use client'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-10">
      <div className="relative overflow-hidden rounded-3xl">
        {/* картинка */}
        <div className="relative h-[360px] sm:h-[420px]">
          <Image
            src="/banner.png"         // файл лежит в /public — НЕ меняем
            alt="FROC Multiverse"
            fill
            priority
            sizes="(min-width:1024px) 1024px, 100vw"
            className="object-cover"
          />
        </div>

        {/* лёгкий блюр + мягкий градиент слева */}
        <div className="pointer-events-none absolute inset-0">
          <div className="h-full w-full backdrop-blur-[1.5px] bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        </div>

        {/* текст поверх */}
        <div className="absolute inset-0 flex items-center">
          <div className="px-8 sm:px-12 max-w-2xl">
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="block">FROC</span>
              <span className="block">Multiverse NFT</span>
            </h1>

            <div className="mt-4 space-y-3 text-[15px] leading-6 sm:leading-7 text-white/95">
              <p>
                The Froc Multiverse NFT collection is a limited series featuring
                <b> 3,333 unique frogs</b> with a distinctive, eye-catching design. Each Froc is ready to
                become a special addition to your collection or serve as a really cool profile picture,
                effortlessly showcasing your style online.
              </p>
              <p>
                This digital art is centered purely around the spirit of collecting and fun. We have also
                hidden a few secrets within the Multiverse lore that the community will enjoy discovering
                and unraveling.
              </p>
              <p className="pt-1 text-lg sm:text-xl font-semibold text-white">
                Find your own unique Froc and join the adventure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}