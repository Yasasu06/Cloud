'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const FREE_LIMIT = 5

export default function FreeTrialMeter() {
  const [count, setCount] = useState<number | null>(null)
  const [plan, setPlan] = useState<string>('Free')
  const [showSoftWarning, setShowSoftWarning] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        // Pull profile + count of analyses this month
        const monthStart = new Date()
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)

        const [profileRes, recsRes] = await Promise.all([
          supabase.from('profiles').select('plan').eq('id', session.user.id).maybeSingle(),
          supabase.from('saved_recommendations').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id).gte('created_at', monthStart.toISOString()),
        ])

        const userPlan = (profileRes.data as { plan?: string } | null)?.plan ?? 'Free'
        setPlan(userPlan)
        const monthCount = recsRes.count ?? 0
        setCount(monthCount)

        if (userPlan === 'Free' && monthCount === FREE_LIMIT - 1 && !sessionStorage.getItem('soft_warning_shown')) {
          setShowSoftWarning(true)
          sessionStorage.setItem('soft_warning_shown', '1')
        }
      } catch (_e) { /* graceful */ }
    }
    void load()
  }, [])

  if (count === null || plan !== 'Free') return null

  const pct = Math.min(100, (count / FREE_LIMIT) * 100)
  const atLimit = count >= FREE_LIMIT
  const color = atLimit ? '#ef4444' : count >= FREE_LIMIT - 1 ? '#f59e0b' : '#22c55e'

  return (
    <>
      <div style={{
        marginBottom: 24, padding: '14px 18px', borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${atLimit ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
            Free tier · {count} of {FREE_LIMIT} analyses this month
          </div>
          <Link href="/pricing" style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
            Upgrade for unlimited →
          </Link>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.3s, background 0.3s' }} />
        </div>
        {atLimit && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#fca5a5' }}>
            Free limit reached. Upgrade to Pro for unlimited analyses.
          </div>
        )}
      </div>

      {showSoftWarning && !atLimit && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowSoftWarning(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#0d0d18', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 16, padding: '24px 28px', maxWidth: 420, width: '100%' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: 'white', marginBottom: 8 }}>You&apos;re getting great value</h3>
            <p style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.6, marginBottom: 20 }}>
              You&apos;ve run {count} analyses this month and you&apos;re getting smarter with each one. Unlock unlimited analyses + premium features for $49/month.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/pricing" style={{ flex: 1, background: '#6366f1', borderRadius: 10, padding: '11px 0', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none', textAlign: 'center' }}>
                See Pro Features →
              </Link>
              <button onClick={() => setShowSoftWarning(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 18px', color: '#a0a0b0', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Continue Free →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
