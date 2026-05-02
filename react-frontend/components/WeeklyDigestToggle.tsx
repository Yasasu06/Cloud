'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function WeeklyDigestToggle() {
  const [enabled, setEnabled] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setLoaded(true); return }
        const { data, error: dbErr } = await supabase
          .from('profiles')
          .select('weekly_digest_enabled')
          .eq('id', session.user.id)
          .maybeSingle()
        if (dbErr && !dbErr.message.includes('does not exist')) setError('Could not load preference')
        setEnabled(Boolean(data?.weekly_digest_enabled))
      } catch {
        setError('Could not load preference')
      } finally {
        setLoaded(true)
      }
    }
    void load()
  }, [])

  async function toggle() {
    const next = !enabled
    setEnabled(next)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ weekly_digest_enabled: next })
        .eq('id', session.user.id)
      if (dbErr) {
        if (dbErr.message.includes('weekly_digest_enabled') || dbErr.code === '42703') {
          setError('Column profiles.weekly_digest_enabled not yet provisioned. Saved locally for now.')
          localStorage.setItem('weekly_digest_enabled', String(next))
        } else {
          setError(dbErr.message)
          setEnabled(!next)
          return
        }
      }
      setSavedAt(Date.now())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
      setEnabled(!next)
    }
  }

  if (!loaded) return null

  return (
    <div style={{
      marginBottom: 32, padding: '14px 18px', borderRadius: 12,
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 4 }}>📧 Weekly Digest</div>
        <div style={{ fontSize: 12, color: '#a0a0b0', lineHeight: 1.5 }}>
          Get a summary email each week with your recent analyses + pricing changes.
        </div>
        {error && <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 4 }}>{error}</div>}
        {savedAt > 0 && !error && <div style={{ fontSize: 11, color: '#22c55e', marginTop: 4 }}>✓ Preference saved</div>}
      </div>
      <button
        onClick={toggle}
        aria-label="Toggle weekly digest"
        style={{
          width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
          background: enabled ? '#22c55e' : 'rgba(255,255,255,0.1)',
          position: 'relative', transition: 'background 0.15s', flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: enabled ? 23 : 3,
          width: 20, height: 20, borderRadius: '50%', background: 'white',
          transition: 'left 0.15s',
        }} />
      </button>
    </div>
  )
}
