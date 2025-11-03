'use client'

import { useEffect, useRef, useState } from 'react'

const DEFAULT_VOL = 0.3 // 30%

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_VOL
    const v = Number(localStorage.getItem('bgm_volume'))
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : DEFAULT_VOL
  })

  // применяем громкость и сохраняем
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
    if (typeof window !== 'undefined') localStorage.setItem('bgm_volume', String(volume))
  }, [volume])

  // плавный фейд к целевой громкости
  const fadeTo = (target: number, ms = 800) => {
    const a = audioRef.current
    if (!a) return
    const start = a.volume
    const diff = target - start
    if (diff === 0) return
    const startTs = performance.now()
    const step = (t: number) => {
      const k = Math.min(1, (t - startTs) / ms)
      const v = start + diff * k
      a.volume = v
      setVolume(v)
      if (k < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  // автоплей при монтировании: стартуем muted и делаем fade-in до 30%, если разрешено
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.muted = true
    a.volume = 0
    // пробуем автоплей
    a.play()
      .then(() => {
        setPlaying(true)
        // небольшая задержка и мягкий вход
        setTimeout(() => {
          a.muted = false
          fadeTo(volume ?? DEFAULT_VOL, 900)
        }, 300)
      })
      .catch(() => {
        // заблокировано политикой — ждём клика по Play
        setPlaying(false)
      })
  }, []) // один раз

  const toggle = async () => {
    setErr(null)
    const a = audioRef.current
    if (!a) return
    try {
      if (!playing) {
        // на ручной запуск снимаем mute и поднимаем до текущей громкости
        a.muted = false
        if (a.volume === 0) a.volume = Math.max(0.01, volume || DEFAULT_VOL)
        await a.play()
        setPlaying(true)
      } else {
        a.pause()
        setPlaying(false)
      }
    } catch (e: any) {
      setErr(e?.message || 'Audio blocked by browser')
    }
  }

  return (
    <>
      <audio ref={audioRef} loop preload="auto" playsInline>
        {/* Оставь только те источники, которые реально лежат в /public */}
        {/* <source src="/bgm.mp3" type="audio/mpeg" /> */}
        {/* <source src="/bgm.ogg" type="audio/ogg" /> */}
        <source src="/bgm.wav" type="audio/wav" />
      </audio>

      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 backdrop-blur px-3 py-2 text-sm">
        <button
          onClick={toggle}
          className="rounded-md bg-white/20 hover:bg-white/30 px-3 py-1 font-semibold"
          aria-label={playing ? 'Pause music' : 'Play music'}
        >
          {playing ? 'Pause' : 'Play'}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-white/70 text-xs">Vol</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="h-1 w-28 accent-white/90"
          />
        </div>
      </div>

      {err && (
        <div className="fixed bottom-16 right-4 z-50 text-xs text-red-300">
          {err}
        </div>
      )}
    </>
  )
}
