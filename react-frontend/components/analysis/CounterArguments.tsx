'use client'

import { useState } from 'react'

export interface CounterArgument {
  title: string
  explanation: string
  when_applies: string
}

export default function CounterArguments({ data }: { data: CounterArgument[] }) {
  const [open, setOpen] = useState(false)
  if (!data?.length) return null

  return (
    <div style={{
      marginTop: 20, marginBottom: 24,
      borderRadius: 14,
      background: 'rgba(245,158,11,0.04)',
      border: '1px solid rgba(245,158,11,0.2)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '16px 20px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          textAlign: 'left',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>
            ⚠️ Consider The Counter-Argument
          </div>
          <div style={{ fontSize: 12, color: '#a0a0b0' }}>
            Why this might NOT be right for you (click to {open ? 'collapse' : 'expand'})
          </div>
        </div>
        <span style={{ color: '#f59e0b', fontSize: 14, transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: '4px 20px 20px', display: 'grid', gap: 12 }}>
          {data.map((item, i) => (
            <div key={i} style={{
              padding: '14px 16px', borderRadius: 10,
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.18)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                {item.title}
              </div>
              <p style={{ fontSize: 13, color: '#c0c0d0', lineHeight: 1.65, margin: '0 0 8px' }}>
                {item.explanation}
              </p>
              <div style={{ fontSize: 11, color: '#666', fontStyle: 'italic' }}>
                <strong style={{ color: '#888', fontStyle: 'normal' }}>When this applies: </strong>
                {item.when_applies}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
