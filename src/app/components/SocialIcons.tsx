'use client'

import { FROC_ADDRESS } from '@/lib/contract'

type Link = { href: string; img: string; title: string }

const LINKS: Link[] = [
  // TODO: подставь свои ссылки
  { href: 'https://opensea.io/collection/froc-multiverse-nft', img: '/icons/opensea.svg', title: 'OpenSea' },
  { href: 'https://x.com/frocisbased', img: '/icons/x.png', title: 'X (Twitter)' },
  { href: 'https://frocofficial.com/', img: '/icons/globe.png', title: 'FROC Website' },
  { href: `https://basescan.org/address/0x9565BbD701cF12732B274b28E3A3E5099D2c5186`, img: '/icons/basescan.png', title: 'BaseScan' },
]

export default function SocialIcons() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {LINKS.map((l) => (
        <a
          key={l.title}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          title={l.title}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
        >
          {/* ИКОНКИ ЛЕЖАТ В /public/icons — используем строковый путь */}
          <img src={l.img} alt={l.title} width={18} height={18} />
        </a>
      ))}
    </div>
  )
}