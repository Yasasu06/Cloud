'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { QuickWin } from './types'

export default function QuickWinsList({ data }: { data: QuickWin[] }) {
  const [done, setDone] = useState<Record<number, boolean>>({})

  if (!data?.length) return null

  async function markDone(idx: number, win: QuickWin) {
    setDone(prev => ({ ...prev, [idx]: !prev[idx] }))
    if (done[idx]) return // already marked, just toggling off
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await supabase.from('implementation_results').insert({
        user_id: session.user.id,
        recommendation: win.title,
        action_taken: 'marked_done_quick_win',
        outcome: 'completed',
        metadata: { savings: win.savings, time: win.time },
      })
    } catch (_e) {
      // table may not exist yet — fail silently
    }
  }

  return (
    <div style={{ marginTop: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: 2 }}>⚡ QUICK WINS — DO TODAY</span>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {data.map((win, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px', borderRadius: 12,
            background: done[i] ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${done[i] ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.07)'}`,
            transition: 'all 0.15s',
          }}>
            <button
              onClick={() => markDone(i, win)}
              aria-label="Mark done"
              style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: done[i] ? '#22c55e' : 'transparent',
                border: `2px solid ${done[i] ? '#22c55e' : 'rgba(255,255,255,0.2)'}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: 'white',
              }}
            >
              {done[i] && '✓'}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4, textDecoration: done[i] ? 'line-through' : 'none', opacity: done[i] ? 0.6 : 1 }}>
                {win.title}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>⏱ {win.time}</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#22c55e', whiteSpace: 'nowrap' }}>
              {win.savings}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
