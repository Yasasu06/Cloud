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
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError('Sign in to change this preference.'); return }
      const { data: updated, error: dbErr } = await supabase
        .from('profiles')
        .update({ weekly_digest_enabled: next })
        .eq('id', session.user.id)
        .select('id')
        .maybeSingle()
      if (dbErr || !updated) {
        setError('Could not save digest preference.')
        return
      }
      setEnabled(next)
      setSavedAt(Date.now())
    } catch (e) {
      setError('Could not save digest preference.')
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
          Opt in to recaps of saved analyses. Emails are sent only when an administrator triggers a digest; there is no automatic schedule.
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
