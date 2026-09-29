'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import DecisionsMade from '@/components/DecisionsMade'
import RoleAwareToolGrid from '@/components/RoleAwareToolGrid'
import OnboardingTour from '@/components/OnboardingTour'
import WeeklyDigestToggle from '@/components/WeeklyDigestToggle'
import EmptyState from '@/components/EmptyState'

const ROLE_LABELS: Record<string, { icon: string; label: string }> = {
  founder:    { icon: '🚀', label: 'Founder' },
  finops:     { icon: '💰', label: 'FinOps Lead' },
  architect:  { icon: '🏗️', label: 'Architect' },
  itmanager:  { icon: '👥', label: 'IT Manager' },
  consultant: { icon: '🎯', label: 'Consultant' },
  beginner:   { icon: '🧑‍💻', label: 'Beginner' },
}

type Tab = 'overview' | 'analyses' | 'team' | 'clients'

interface Rec {
  id: string
  provider: string
  confidence: number
  workload: string
  created_at: string
}

interface Invite {
  id: string
  email: string
  status: string
  created_at: string
}

interface Stats {
  total: number
  lastDate: string | null
  topProvider: string | null
  plan: string
}

// ─── Saved Analyses tab ───────────────────────────────────────────────────────

function SavedAnalysesTab() {
  const router = useRouter()
  const [allRecs, setAllRecs] = useState<Rec[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('saved_recommendations')
        .select('id, provider, confidence, workload, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      setAllRecs((data ?? []) as Rec[])
      setLoading(false)
    }
    load()
  }, [])

  async function deleteRec(id: string) {
    setDeletingId(id)
    await supabase.from('saved_recommendations').delete().eq('id', id)
    setAllRecs(prev => prev.filter(r => r.id !== id))
    setDeletingId(null)
  }

  function copyLink(id: string) {
    const url = `${window.location.origin}/analyze?shared=${id}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) return <div style={{ color: '#555', padding: '40px 0', textAlign: 'center' }}>Loading analyses…</div>

  if (allRecs.length === 0) {
    return (
      <div style={{ background: '#1a1a2e', borderRadius: 16, padding: '48px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 20 }}>No saved analyses yet. Run your first one.</p>
        <button onClick={() => router.push('/analyze')} style={{ background: '#6366f1', border: 'none', borderRadius: 10, padding: '12px 28px', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Start Analysis →
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>{allRecs.length} saved {allRecs.length === 1 ? 'analysis' : 'analyses'}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {allRecs.map(rec => (
          <div key={rec.id} style={{ background: '#1a1a2e', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
          >
            {/* Main info — clickable */}
            <div onClick={() => router.push('/analyze')} style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, cursor: 'pointer', minWidth: 0 }}>
              <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 700, fontSize: 13, padding: '4px 10px', borderRadius: 6, minWidth: 56, textAlign: 'center', flexShrink: 0 }}>
                {rec.provider}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.workload}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{formatDate(rec.created_at)}</div>
              </div>
            </div>

            {/* Confidence */}
            <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, flexShrink: 0 }}>{rec.confidence}% match</span>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => copyLink(rec.id)}
                title="Copy share link"
                style={{ background: copiedId === rec.id ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copiedId === rec.id ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '6px 12px', color: copiedId === rec.id ? '#22c55e' : '#a0a0b0', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s' }}
              >
                {copiedId === rec.id ? '✓ Copied' : '🔗 Share'}
              </button>
              <button
                onClick={() => deleteRec(rec.id)}
                disabled={deletingId === rec.id}
                title="Delete analysis"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 10px', color: '#ef4444', cursor: deletingId === rec.id ? 'not-allowed' : 'pointer', fontSize: 14, opacity: deletingId === rec.id ? 0.5 : 1, transition: 'all 0.15s' }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Team tab ─────────────────────────────────────────────────────────────────

function TeamTab({ userEmail, plan }: { userEmail: string | null; plan: string }) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [invites, setInvites] = useState<Invite[]>([])
  const [loadingInvites, setLoadingInvites] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isFree = plan === 'Free'

  const loadInvites = useCallback(async () => {
    if (!userEmail) return
    const { data } = await supabase
      .from('team_invites')
      .select('id, email, status, created_at')
      .eq('invited_by', userEmail)
      .order('created_at', { ascending: false })
    setInvites((data ?? []) as Invite[])
    setLoadingInvites(false)
  }, [userEmail])

  useEffect(() => { loadInvites() }, [loadInvites])

  async function sendInvite() {
    if (!inviteEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setError('Enter a valid email address.')
      return
    }
    setSending(true); setError(''); setSuccess('')
    try {
      const { error: dbErr } = await supabase.from('team_invites').insert({
        email: inviteEmail.trim(), invited_by: userEmail, status: 'pending',
      })
      if (dbErr) throw dbErr
      setInvites(prev => [{ id: crypto.randomUUID(), email: inviteEmail.trim(), status: 'pending', created_at: new Date().toISOString() }, ...prev])
      setInviteEmail('')
      setSuccess(`Invite sent to ${inviteEmail.trim()}`)
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send invite.')
    } finally {
      setSending(false)
    }
  }

  async function revokeInvite(id: string, email: string) {
    await supabase.from('team_invites').delete().eq('id', id)
    setInvites(prev => prev.filter(i => i.id !== id))
    setSuccess(`Revoked invite for ${email}`)
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div>
      {isFree && (
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 14, padding: '18px 22px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#818cf8', marginBottom: 3 }}>Upgrade to add team members</div>
            <div style={{ fontSize: 13, color: '#555' }}>Team invites available on Pro and Enterprise plans.</div>
          </div>
          <Link href="/pricing" style={{ background: '#6366f1', color: 'white', padding: '9px 18px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>View Plans →</Link>
        </div>
      )}

      <div style={{ background: '#1a1a2e', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24, opacity: isFree ? 0.5 : 1, pointerEvents: isFree ? 'none' : 'auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 14 }}>SEND INVITE</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendInvite()}
            placeholder="colleague@company.com"
            style={{ flex: 1, minWidth: 200, background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
          />
          <button onClick={sendInvite} disabled={sending || !inviteEmail.trim()} style={{ background: '#6366f1', border: 'none', borderRadius: 10, padding: '11px 22px', color: 'white', fontWeight: 700, fontSize: 14, cursor: sending || !inviteEmail.trim() ? 'not-allowed' : 'pointer', opacity: sending || !inviteEmail.trim() ? 0.5 : 1 }}>
            {sending ? 'Sending…' : 'Send Invite'}
          </button>
        </div>
        {error && <p style={{ fontSize: 13, color: '#f87171', marginTop: 8 }}>{error}</p>}
        {success && <p style={{ fontSize: 13, color: '#22c55e', marginTop: 8 }}>{success}</p>}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 12 }}>
        PENDING INVITES {!loadingInvites && invites.length > 0 && `(${invites.length})`}
      </div>
      {loadingInvites ? (
        <div style={{ color: '#555', fontSize: 14, padding: '20px 0' }}>Loading…</div>
      ) : invites.length === 0 ? (
        <div style={{ background: '#111118', borderRadius: 12, padding: '28px 20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', color: '#444', fontSize: 14 }}>No invites sent yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {invites.map(inv => (
            <div key={inv.id} style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#818cf8', flexShrink: 0 }}>
                  {inv.email[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>{inv.email}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{formatDate(inv.created_at)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: inv.status === 'accepted' ? '#22c55e' : '#f59e0b', background: inv.status === 'accepted' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 6 }}>
                  {inv.status.toUpperCase()}
                </span>
                <button onClick={() => revokeInvite(inv.id, inv.email)} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '2px 4px' }} title="Revoke">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 12 }}>COMING SOON</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {[
            { icon: '🗂️', label: 'Shared analyses' },
            { icon: '📊', label: 'Team dashboard' },
            { icon: '💬', label: 'Inline comments' },
            { icon: '📋', label: 'Shared report cards' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: '#555' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>('overview')
  const [role, setRole] = useState<string | null>(null)
  const [tourOpen, setTourOpen] = useState(false)

  useEffect(() => {
    const urlRole = searchParams.get('role')
    if (urlRole && ROLE_LABELS[urlRole]) {
      setRole(urlRole)
      localStorage.setItem('user_role', urlRole)
    } else {
      const stored = localStorage.getItem('user_role')
      if (stored && ROLE_LABELS[stored]) setRole(stored)
    }
  }, [searchParams])
  const [email, setEmail] = useState<string | null>(null)
  const [recentRecs, setRecentRecs] = useState<Rec[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, lastDate: null, topProvider: null, plan: 'Free' })
  const [loading, setLoading] = useState(true)
  const [loggedOut, setLoggedOut] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<{ title: string; url: string; emoji: string; desc: string; visitedAt?: number }[]>([])

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('recently_viewed') ?? '[]')
      setRecentlyViewed(raw.filter((e: { url: string }) => e.url !== '/dashboard').slice(0, 3))
    } catch (_e) {}
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoggedOut(true); setLoading(false); return }
      setEmail(session.user.email ?? null)

      const [{ data: allRecs }, { data: profile }] = await Promise.all([
        supabase
          .from('saved_recommendations')
          .select('id, provider, confidence, workload, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('plan').eq('id', session.user.id).single(),
      ])

      const list = (allRecs ?? []) as Rec[]
      setRecentRecs(list.slice(0, 5))
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

  if (loggedOut) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Sign in to see your dashboard</h2>
          <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            Your saved analyses, achievements, and progress are waiting for you.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth" style={{ background: '#6366f1', borderRadius: 10, padding: '12px 24px', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Sign In →
            </a>
            <a href="/analyze" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 24px', color: '#a0a0b0', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Try tools without an account →
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#a0a0b0', fontSize: 16 }}>Loading…</div>
      </div>
    )
  }

  const isGrowthOrEnterprise = stats.plan === 'Growth' || stats.plan === 'Enterprise'

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview',  label: 'Overview' },
    { id: 'analyses',  label: `Saved Analyses${stats.total > 0 ? ` (${stats.total})` : ''}` },
    { id: 'team',      label: 'Team' },
    { id: 'clients',   label: 'Clients' },
  ]

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 10,
    padding: '8px 20px',
    color: active ? '#818cf8' : '#666',
    fontWeight: active ? 700 : 500,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: '#6366f1', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>DASHBOARD</p>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Welcome back, {email}</h1>
            <p style={{ color: '#a0a0b0', fontSize: 15 }}>Your cloud intelligence overview.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setTourOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '6px 12px', color: '#a0a0b0',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              🎯 Take Tour Again
            </button>
            {role && ROLE_LABELS[role] && (
              <Link href="/for-you" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 10,
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#818cf8', fontSize: 13, fontWeight: 600,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}>
                <span style={{ color: '#666', fontSize: 11 }}>Showing tools for:</span>
                <span>{ROLE_LABELS[role].icon} {ROLE_LABELS[role].label}</span>
                <span style={{ color: '#666' }}>▾</span>
              </Link>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
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

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={tabBtnStyle(tab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview tab ── */}
        {tab === 'overview' && (
          <>
            {/* Continue Where You Left Off */}
            {(recentlyViewed.length > 0 || recentRecs.length > 0) && (
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Continue Where You Left Off</h2>

                {/* Last analysis nudge */}
                {recentRecs.length > 0 && (
                  <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ fontSize: 13, color: '#a0a0b0' }}>
                      Your last analysis: <strong style={{ color: 'white' }}>{recentRecs[0].provider}</strong> · {formatDate(recentRecs[0].created_at)}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => router.push('/analyze')} style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '6px 14px', color: '#818cf8', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>View again</button>
                      <button onClick={() => router.push('/analyze')} style={{ background: '#6366f1', border: 'none', borderRadius: 8, padding: '6px 14px', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Fresh analysis →</button>
                    </div>
                  </div>
                )}

                {/* Recently viewed pages */}
                {recentlyViewed.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                    {recentlyViewed.map(page => (
                      <div
                        key={page.url}
                        onClick={() => router.push(page.url)}
                        style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px 18px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                      >
                        <div style={{ fontSize: 22, marginBottom: 8 }}>{page.emoji}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>{page.title}</div>
                        <div style={{ fontSize: 12, color: '#555', marginBottom: 10 }}>
                          {page.visitedAt ? timeAgo(page.visitedAt) : 'Recently visited'}
                        </div>
                        <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>Continue →</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Analyses</h2>
              {recentRecs.length === 0 ? (
                <EmptyState
                  icon="✨"
                  title="No analyses yet"
                  subtitle="Run your first analysis to see results here."
                  cta={{ label: 'Start Analysis', href: '/analyze' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentRecs.map(rec => (
                    <div key={rec.id} onClick={() => router.push('/analyze')} style={{ background: '#1a1a2e', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.15s', flexWrap: 'wrap', gap: 8 }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 700, fontSize: 13, padding: '4px 10px', borderRadius: 6, minWidth: 56, textAlign: 'center' }}>{rec.provider}</span>
                        <span style={{ fontSize: 14, color: '#e0e0e0' }}>{rec.workload}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>{rec.confidence}% match</span>
                        <span style={{ fontSize: 12, color: '#666' }}>{formatDate(rec.created_at)}</span>
                      </div>
                    </div>
                  ))}
                  {stats.total > 5 && (
                    <button onClick={() => setTab('analyses')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', color: '#666', cursor: 'pointer', fontSize: 13 }}>
                      View all {stats.total} analyses →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Free tier usage meter */}

            {/* Weekly digest preference */}
            <WeeklyDigestToggle />

            {/* Role-aware tool grid */}
            <RoleAwareToolGrid />

            {/* Decisions Made */}
            <DecisionsMade />

            {/* Suggested next steps */}
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Suggested next steps</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { dot: '#22c55e', tag: 'BILL', text: 'Upload a compatible CSV to review service-level spend.' },
                  { dot: '#f59e0b', tag: 'REVIEW', text: 'Check optimization suggestions against actual resource utilization.' },
                  { dot: '#818cf8', tag: 'PRICING', text: 'Compare selected compute prices and verify the final quote with providers.' },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: 1, marginRight: 8 }}>{item.tag}</span>
                      <span style={{ fontSize: 13, color: '#a0a0b0' }}>{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Achievements</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[
                  { icon: '🔍', title: 'First Analysis',       unlocked: stats.total >= 1,  color: '#6366f1' },
                  { icon: '💰', title: 'Savings Hunter',        unlocked: false,              color: '#22c55e' },
                  { icon: '⚡', title: 'Implementation Pro',    unlocked: false,              color: '#f59e0b' },
                  { icon: '🏆', title: 'Cloud Optimizer',       unlocked: stats.total >= 5,   color: '#a855f7' },
                  { icon: '🌐', title: 'Vendor Neutral',        unlocked: false,              color: '#0ea5e9' },
                ].map(a => (
                  <div key={a.title} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 10, background: a.unlocked ? `rgba(${hexRgb(a.color)},0.08)` : 'rgba(255,255,255,0.02)',
                    border: a.unlocked ? `1px solid rgba(${hexRgb(a.color)},0.25)` : '1px solid rgba(255,255,255,0.06)',
                    opacity: a.unlocked ? 1 : 0.45, transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: 20, filter: a.unlocked ? 'none' : 'grayscale(1)' }}>{a.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: a.unlocked ? a.color : '#555' }}>{a.title}</div>
                      <div style={{ fontSize: 10, color: '#444' }}>{a.unlocked ? 'Unlocked' : 'Locked'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <ActionLink href="/analyze"     label="New Analysis" primary />
                <ActionLink href="/report-card" label="Report Card" />
                <ActionLink href="/chat"        label="Ask AI" />
                <ActionLink href="/pricing"     label="Upgrade Plan" />
              </div>
            </div>

            <div style={{ padding: 24, borderRadius: 14, background: '#111118', marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Analyze a billing export</h2>
              <p style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 12 }}>Direct AWS account connection is not enabled in this demo. Upload a compatible billing CSV for a service-level cost breakdown and estimated optimization suggestions.</p>
              <Link href="/bill-upload" style={{ color: '#818cf8', fontWeight: 700 }}>Open Bill Analyzer →</Link>
            </div>
          </>
        )}

        {/* ── Saved Analyses tab ── */}
        {tab === 'analyses' && <SavedAnalysesTab />}

        {/* ── Team tab ── */}
        {tab === 'team' && <TeamTab userEmail={email} plan={stats.plan} />}

        {/* ── Clients tab ── */}
        {tab === 'clients' && (
          isGrowthOrEnterprise ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Client Workspaces</h2>
                <button style={{ background: '#6366f1', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  + Add Client
                </button>
              </div>
              {recentRecs.length === 0 ? (
                <div style={{ background: '#111118', borderRadius: 16, padding: '48px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', color: '#555', fontSize: 14 }}>
                  No client analyses yet. Run an analysis for a client and it will appear here.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentRecs.map(rec => (
                    <div key={rec.id} style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#818cf8' }}>
                          {rec.provider.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{rec.provider}</div>
                          <div style={{ fontSize: 12, color: '#555' }}>{rec.workload} · {formatDate(rec.created_at)}</div>
                        </div>
                      </div>
                      <button onClick={() => router.push('/analyze')} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 7, padding: '6px 14px', color: '#818cf8', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        View →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: '48px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>💼</div>
              <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Multi-client management</h3>
              <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 24, maxWidth: 380, margin: '0 auto 24px', lineHeight: 1.6 }}>
                Organize analyses by client, switch between workspaces, and generate reports per client.
                Available on <strong style={{ color: 'white' }}>Growth</strong> and <strong style={{ color: 'white' }}>Enterprise</strong> plans.
              </p>
              <a href="/pricing" style={{ background: '#6366f1', borderRadius: 10, padding: '12px 24px', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                Upgrade to Growth →
              </a>
            </div>
          )
        )}

      </div>
      <OnboardingTour forceOpen={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  )
}

function ActionLink({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link href={href} style={{ padding: '11px 22px', borderRadius: 10, background: primary ? '#6366f1' : 'transparent', border: primary ? 'none' : '1px solid rgba(255,255,255,0.15)', color: primary ? 'white' : '#a0a0b0', fontWeight: 600, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}
      onMouseEnter={e => { if (!primary) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'white' } else e.currentTarget.style.background = '#4f46e5' }}
      onMouseLeave={e => { if (!primary) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a0a0b0' } else e.currentTarget.style.background = '#6366f1' }}
    >
      {label}
    </Link>
  )
}

function hexRgb(hex: string): string { const h = hex.replace('#',''); return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}` }
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }
function formatDate(iso: string) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins} minutes ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`
  const days = Math.floor(hrs / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}
