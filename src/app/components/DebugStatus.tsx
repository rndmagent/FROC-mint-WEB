'use client'
import { useChainId, useBlockNumber } from 'wagmi'

export default function DebugStatus() {
  const chainId = useChainId()
  const { data: block, status } = useBlockNumber({ watch: true })
  return (
    <div style={{opacity:.8,fontSize:12,marginTop:16}}>
      <div>chainId: {chainId}</div>
      <div>block: {status==='success' ? block?.toString() : status}</div>
    </div>
  )
}