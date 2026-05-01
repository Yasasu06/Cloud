'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Rec {
  id: string
  provider: string
  confidence: number
  workload: string
  created_at: string
}

interface Stats {
  total: number
  lastDate: string | null
  topProvider: string | null
  plan: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [recs, setRecs] = useState<Rec[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, lastDate: null, topProvider: null, plan: 'Free' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/auth')
        return
      }
      setEmail(session.user.email ?? null)

      const [{ data: allRecs }, { data: profile }] = await Promise.all([
        supabase
          .from('saved_recommendations')
          .select('id, provider, confidence, workload, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single(),
      ])

      const list = (allRecs ?? []) as Rec[]
      setRecs(list.slice(0, 5))
      setStats({
        total: list.length,
        lastDate: list[0]?.created_at ?? null,
        topProvider: list[0]?.provider ?? null,
        plan: profile?.plan ? capitalize(profile.plan as string) : 'Free',
      })
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#a0a0b0', fontSize: 16 }}>Loading…</div>
      </div>
    )
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: '#6366f1', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>DASHBOARD</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
            Welcome back, {email}
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15 }}>Here's your cloud intelligence overview.</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>ANALYSES RUN</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>{stats.total}</div>
          </div>
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>LAST ANALYSIS</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{stats.lastDate ? formatDate(stats.lastDate) : '—'}</div>
          </div>
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>TOP PROVIDER</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#6366f1' }}>{stats.topProvider ?? '—'}</div>
          </div>
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>ACCOUNT PLAN</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#22c55e' }}>{stats.plan}</div>
          </div>
        </div>

        {/* Recent analyses */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Analyses</h2>
          {recs.length === 0 ? (
            <div style={{
              background: '#1a1a2e',
              borderRadius: 16,
              padding: '48px 24px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 20 }}>No analyses yet. Start your first one.</p>
              <button
                onClick={() => router.push('/analyze')}
                style={{
                  background: '#6366f1',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 28px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Start Analysis →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recs.map(rec => (
                <div
                  key={rec.id}
                  onClick={() => router.push('/analyze')}
                  style={{
                    background: '#1a1a2e',
                    borderRadius: 12,
                    padding: '16px 20px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{
                      background: 'rgba(99,102,241,0.15)',
                      color: '#818cf8',
                      fontWeight: 700,
                      fontSize: 13,
                      padding: '4px 10px',
                      borderRadius: 6,
                      minWidth: 56,
                      textAlign: 'center',
                    }}>
                      {rec.provider}
                    </span>
                    <span style={{ fontSize: 14, color: '#e0e0e0' }}>{rec.workload}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>{rec.confidence}% match</span>
                    <span style={{ fontSize: 12, color: '#666' }}>{formatDate(rec.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <ActionLink href="/analyze" label="New Analysis" primary />
            <ActionLink href="/report-card" label="Report Card" />
            <ActionLink href="/chat" label="Ask AI" />
            <ActionLink href="/pricing" label="Upgrade Plan" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionLink({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        padding: '11px 22px',
        borderRadius: 10,
        background: primary ? '#6366f1' : 'transparent',
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.15)',
        color: primary ? 'white' : '#a0a0b0',
        fontWeight: 600,
        fontSize: 14,
        textDecoration: 'none',
        display: 'inline-block',
      }}
      onMouseEnter={e => {
        if (!primary) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.color = 'white'
        } else {
          e.currentTarget.style.background = '#4f46e5'
        }
      }}
      onMouseLeave={e => {
        if (!primary) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#a0a0b0'
        } else {
          e.currentTarget.style.background = '#6366f1'
        }
      }}
    >
      {label}
    </Link>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
