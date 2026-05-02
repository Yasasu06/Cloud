'use client'

import { useEffect, useState } from 'react'
import { getUserMode, setUserMode, type UserMode } from '@/lib/userMode'

export default function ModeToggle() {
  const [mode, setMode] = useState<UserMode>('plain')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMode(getUserMode())
    setMounted(true)
  }, [])

  function toggle(next: UserMode) {
    setMode(next)
    setUserMode(next)
  }

  if (!mounted) return null

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 0,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8, padding: 2,
    }}>
      <button
        onClick={() => toggle('plain')}
        style={{
          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          border: 'none', cursor: 'pointer',
          background: mode === 'plain' ? 'rgba(99,102,241,0.2)' : 'transparent',
          color: mode === 'plain' ? '#818cf8' : '#666',
        }}
      >
        Plain English
      </button>
      <button
        onClick={() => toggle('technical')}
        style={{
          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          border: 'none', cursor: 'pointer',
          background: mode === 'technical' ? 'rgba(99,102,241,0.2)' : 'transparent',
          color: mode === 'technical' ? '#818cf8' : '#666',
        }}
      >
        Technical
      </button>
    </div>
  )
}
