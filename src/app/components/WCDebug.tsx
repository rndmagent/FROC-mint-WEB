'use client'

import { useEffect, useState } from 'react'
import { config } from '@/lib/wagmi'

type State = {
  connectors: string[]
  projectIdMasked: string
  hasWalletConnect: boolean
}

export default function WCDebugInline() {
  const [s, setS] = useState<State | null>(null)

  useEffect(() => {
    // Имена коннекторов из wagmi-конфига
    // @ts-ignore – у config есть поле connectors
    const names = (config.connectors ?? []).map((c: any) => c.name as string)

    // Значение env будет «захардкожено» на этапе билда,
    // маскируем, чтобы не светить целиком
    const pid = (process.env.NEXT_PUBLIC_WC_PROJECT_ID || '') as string
    const projectIdMasked = pid
      ? `${pid.slice(0, 6)}…${pid.slice(-4)}`
      : '(empty)'

    setS({
      connectors: names,
      projectIdMasked,
      hasWalletConnect: names.some((n) =>
        n.toLowerCase().includes('walletconnect'),
      ),
    })
  }, [])

  if (!s) return null

  return (
    <div
      style={{
        marginTop: 8,
        fontSize: 11,
        lineHeight: 1.2,
        color: 'rgba(255,255,255,.75)',
        background: 'rgba(255,255,255,.06)',
        border: '1px solid rgba(255,255,255,.12)',
        borderRadius: 8,
        padding: '8px 10px',
      }}
    >
      <div><b>WC Debug</b></div>
      <div>connectors: {s.connectors.length} — {s.connectors.join(', ') || '(none)'}</div>
      <div>projectId: {s.projectIdMasked}</div>
      <div>WalletConnect present: {s.hasWalletConnect ? 'YES' : 'NO'}</div>
    </div>
  )
}
