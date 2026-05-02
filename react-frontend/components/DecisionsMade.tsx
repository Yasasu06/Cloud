'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Decision {
  id: string
  decision_text: string
  reasoning: string
  review_date: string
  status: 'active' | 'reviewed' | 'archived'
  outcome: 'succeeded' | 'failed' | 'mixed' | null
  created_at: string
}

const OUTCOME_STYLE: Record<NonNullable<Decision['outcome']>, { color: string; label: string; emoji: string }> = {
  succeeded: { color: '#22c55e', label: 'Succeeded', emoji: '✓' },
  failed:    { color: '#ef4444', label: 'Failed',    emoji: '✗' },
  mixed:     { color: '#f59e0b', label: 'Mixed',     emoji: '~' },
}

function daysUntil(dateStr: string): number {
  const ms = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export default function DecisionsMade() {
  const [decisions, setDecisions] = useState<Decision[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setDecisions([]); return }
        const { data, error: dbErr } = await supabase
          .from('decisions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        if (dbErr) { setError(true); setDecisions([]); return }
        setDecisions((data as Decision[]) ?? [])
      } catch {
        setError(true)
        setDecisions([])
      }
    }
    void load()
  }, [])

  async function markOutcome(id: string, outcome: NonNullable<Decision['outcome']>) {
    setDecisions(prev => prev?.map(d => d.id === id ? { ...d, outcome, status: 'reviewed' } : d) ?? null)
    try {
      await supabase.from('decisions').update({ outcome, status: 'reviewed' }).eq('id', id)
    } catch { /* silent */ }
  }

  if (decisions === null) return null
  if (decisions.length === 0 && !error) return null

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📝 Decisions Made</h2>
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, fontSize: 12, color: '#a0a0b0', marginBottom: 12 }}>
          Decisions table not yet provisioned in Supabase. Schema:
          <code style={{ display: 'block', marginTop: 8, padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: 6, fontSize: 11, color: '#818cf8', whiteSpace: 'pre-wrap' }}>
            {`CREATE TABLE decisions (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid REFERENCES auth.users(id), decision_text text, reasoning text, alternatives text, expected_outcome text, review_date date, status text DEFAULT 'active', outcome text, tags text[], created_at timestamp DEFAULT now());`}
          </code>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {decisions.map(d => {
          const days = daysUntil(d.review_date)
          const dueForReview = days <= 0 && !d.outcome
          const outcome = d.outcome ? OUTCOME_STYLE[d.outcome] : null
          return (
            <div key={d.id} style={{
              padding: '14px 18px', borderRadius: 12,
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${dueForReview ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.07)'}`,
              borderLeft: outcome ? `3px solid ${outcome.color}` : (dueForReview ? '3px solid #f59e0b' : '3px solid #6366f1'),
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{d.decision_text}</div>
                  <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{d.reasoning}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {outcome ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: outcome.color, padding: '3px 10px', background: `${outcome.color}15`, border: `1px solid ${outcome.color}30`, borderRadius: 6 }}>
                      {outcome.emoji} {outcome.label}
                    </span>
                  ) : dueForReview ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>Review now</span>
                  ) : (
                    <span style={{ fontSize: 11, color: '#666' }}>Review in {days}d</span>
                  )}
                </div>
              </div>
              {dueForReview && !outcome && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  {(['succeeded', 'mixed', 'failed'] as const).map(o => {
                    const s = OUTCOME_STYLE[o]
                    return (
                      <button
                        key={o}
                        onClick={() => markOutcome(d.id, o)}
                        style={{ fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 6, border: `1px solid ${s.color}30`, background: 'transparent', color: s.color, cursor: 'pointer' }}
                      >
                        {s.emoji} {s.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
