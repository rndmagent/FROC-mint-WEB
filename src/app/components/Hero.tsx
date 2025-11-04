'use client'
import Image from 'next/image'

/**
 * HERO
 * — Мобила (< md): баннер 16:9, текст идёт СНИЗУ (ничего не перекрывается)
 * — Десктоп (>= md): баннер фиксированной высоты, текст ЛЕЖИТ СВЕРХУ по центру,
 *   под ним полупрозрачный градиент для читаемости.
 */
export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-10">
      <div
        className="
          relative overflow-hidden rounded-2xl sm:rounded-3xl
          border border-white/10 bg-white/5 backdrop-blur
          shadow-[0_8px_30px_rgba(0,0,0,.35)]
        "
      >
        {/* === БАННЕР ============================================= */}
        <div className="relative w-full aspect-[16/9] md:aspect-auto md:h-[520px] lg:h-[560px]">
          <Image
            src="/banner.png"               // лежит в /public — не трогаем
            alt="FROC Multiverse"
            fill
            priority
            // Подсказываем реальную ширину карточки (max-w-6xl ≈ 1152px)
            sizes="(min-width:1280px) 1152px, (min-width:1024px) 1024px, 100vw"
            className="object-cover object-center"
          />
        </div>

        {/* === ОВЕРЛЕЙ ДЛЯ ДЕСКТОПА (градиент + лёгкий blur) ===== */}
        <div className="pointer-events-none absolute inset-0 hidden md:block z-10">
          <div className="h-full w-full backdrop-blur-[1.5px] bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        {/* === ТЕКСТ: МОБИЛА (под картинкой) ===================== */}
        <div className="block md:hidden px-5 sm:px-8 pb-6">
          <HeroText />
        </div>

        {/* === ТЕКСТ: ДЕСКТОП (поверх баннера по центру) ========= */}
        <div className="hidden md:flex absolute inset-0 items-center px-8 z-20">
          <div className="max-w-2xl">
            <HeroText desktop />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Контент заголовка и абзацев (один источник правды) ---------- */
function HeroText({ desktop = false }: { desktop?: boolean }) {
  return (
    <>
      <h1
        className={[
          'font-extrabold tracking-tight leading-tight',
          desktop ? 'text-5xl lg:text-6xl' : 'text-4xl'
        ].join(' ')}
      >
        <span className="block">FROC</span>
        <span className="block">Multiverse NFT</span>
      </h1>

      <div
        className={[
          'mt-3 space-y-3 text-white/95',
          desktop ? 'text-[15px] leading-7' : 'text-[14px] leading-6'
        ].join(' ')}
      >
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
        <p className={desktop ? 'pt-1 text-xl font-semibold' : 'pt-1 text-lg font-semibold'}>
          Find your own unique Froc and join the adventure.
        </p>
      </div>
    </>
  )
}
