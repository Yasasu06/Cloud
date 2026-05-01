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

// ─── AWS Connect section ──────────────────────────────────────────────────────

const UNLOCK_ITEMS = [
  { icon: '📄', label: 'Real bill analysis',         desc: 'Line-by-line from your actual charges' },
  { icon: '🔍', label: 'Automatic waste detection',  desc: 'Idle resources found every 24 hours' },
  { icon: '🚨', label: 'Spending anomaly alerts',    desc: 'Know before your bill arrives' },
  { icon: '📊', label: 'Monthly optimization report',desc: 'Emailed savings summary each month' },
]

function AwsConnectPanel({
  onSaved,
}: {
  onSaved: () => void
}) {
  const [accessKeyId, setAccessKeyId] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    if (!accessKeyId.trim() || !secretKey.trim()) {
      setError('Both fields are required.')
      return
    }
    if (!/^AKIA[A-Z0-9]{16}$/.test(accessKeyId.trim())) {
      setError('Access Key ID should start with AKIA and be 20 characters.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not signed in')
      const encoded = btoa(secretKey.trim())
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ aws_access_key_id: accessKeyId.trim(), aws_secret_key: encoded })
        .eq('id', session.user.id)
      if (dbErr) throw dbErr
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0a0a0f',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '12px 14px',
    color: 'white',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'monospace',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      background: '#111118',
      border: '1px solid rgba(245,158,11,0.25)',
      borderRadius: 16,
      padding: '24px',
      marginTop: 16,
    }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 20 }}>
        Connect AWS (Read-Only)
      </p>

      {/* Step-by-step instructions */}
      <div style={{
        background: 'rgba(245,158,11,0.05)',
        border: '1px solid rgba(245,158,11,0.15)',
        borderRadius: 12,
        padding: '16px 18px',
        marginBottom: 20,
      }}>
        <p style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
          HOW TO GET YOUR KEYS
        </p>
        {[
          'Open AWS Console → IAM → Users',
          'Click Add User → name it "cloud-intelligence"',
          'Attach policies: Billing + ReadOnlyAccess',
          'Click Security Credentials → Create Access Key',
          'Choose "Third-party service" → paste both keys below',
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', borderRadius: 4, padding: '1px 6px', flexShrink: 0, marginTop: 1 }}>
              {i + 1}
            </span>
            <span style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.5 }}>{step}</span>
          </div>
        ))}
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 6 }}>
            AWS ACCESS KEY ID
          </label>
          <input
            type="text"
            value={accessKeyId}
            onChange={e => setAccessKeyId(e.target.value)}
            placeholder="AKIAIOSFODNN7EXAMPLE"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 6 }}>
            AWS SECRET ACCESS KEY
          </label>
          <input
            type="password"
            value={secretKey}
            onChange={e => setSecretKey(e.target.value)}
            placeholder="••••••••••••••••••••••••••••••••••••••••"
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: '#f87171', marginBottom: 12 }}>{error}</p>
      )}

      {/* Disclaimer */}
      <div style={{
        background: 'rgba(34,197,94,0.06)',
        border: '1px solid rgba(34,197,94,0.15)',
        borderRadius: 10,
        padding: '12px 14px',
        marginBottom: 16,
        fontSize: 12,
        color: '#86efac',
        lineHeight: 1.6,
      }}>
        🔒 <strong>Read-only access only.</strong> We can never modify, delete, or access your actual
        infrastructure. Only billing data is read.
      </div>

      <button
        onClick={save}
        disabled={saving || !accessKeyId.trim() || !secretKey.trim()}
        style={{
          background: '#f59e0b',
          border: 'none',
          borderRadius: 10,
          padding: '12px 28px',
          color: 'white',
          fontWeight: 700,
          fontSize: 14,
          cursor: saving || !accessKeyId.trim() || !secretKey.trim() ? 'not-allowed' : 'pointer',
          opacity: saving || !accessKeyId.trim() || !secretKey.trim() ? 0.5 : 1,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#d97706' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#f59e0b' }}
      >
        {saving ? 'Saving…' : 'Save & Connect AWS →'}
      </button>
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [recs, setRecs] = useState<Rec[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, lastDate: null, topProvider: null, plan: 'Free' })
  const [loading, setLoading] = useState(true)
  const [awsConnected, setAwsConnected] = useState(false)
  const [showAwsPanel, setShowAwsPanel] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/auth'); return }
      setEmail(session.user.email ?? null)

      const [{ data: allRecs }, { data: profile }] = await Promise.all([
        supabase
          .from('saved_recommendations')
          .select('id, provider, confidence, workload, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('plan, aws_access_key_id')
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
      if (profile?.aws_access_key_id) setAwsConnected(true)
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
          <p style={{ color: '#a0a0b0', fontSize: 15 }}>Here&apos;s your cloud intelligence overview.</p>
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
            <div style={{ background: '#1a1a2e', borderRadius: 16, padding: '48px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 20 }}>No analyses yet. Start your first one.</p>
              <button
                onClick={() => router.push('/analyze')}
                style={{ background: '#6366f1', border: 'none', borderRadius: 10, padding: '12px 28px', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
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
                  style={{ background: '#1a1a2e', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.15s', flexWrap: 'wrap', gap: 8 }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 700, fontSize: 13, padding: '4px 10px', borderRadius: 6, minWidth: 56, textAlign: 'center' }}>
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
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <ActionLink href="/analyze"     label="New Analysis" primary />
            <ActionLink href="/report-card" label="Report Card" />
            <ActionLink href="/chat"        label="Ask AI" />
            <ActionLink href="/pricing"     label="Upgrade Plan" />
          </div>
        </div>

        {/* ── Connect Your Cloud ── */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Connect Your Cloud</h2>
          <p style={{ color: '#555', fontSize: 13, marginBottom: 20 }}>
            Connect your account for real bill analysis, automatic waste detection, and anomaly alerts.
          </p>

          {/* Provider cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>

            {/* AWS */}
            <div style={{
              background: '#111118',
              border: `1px solid ${awsConnected ? 'rgba(34,197,94,0.4)' : showAwsPanel ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 16,
              padding: '20px',
              transition: 'border-color 0.15s',
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b', marginBottom: 12 }}>AWS</div>
              {awsConnected ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', padding: '4px 12px', borderRadius: 8 }}>
                    ✓ Connected
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setShowAwsPanel(p => !p)}
                  style={{
                    background: showAwsPanel ? 'rgba(245,158,11,0.15)' : '#f59e0b',
                    border: showAwsPanel ? '1px solid rgba(245,158,11,0.4)' : 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    color: showAwsPanel ? '#f59e0b' : 'white',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {showAwsPanel ? 'Cancel' : 'Connect →'}
                </button>
              )}
            </div>

            {/* Azure */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px', opacity: 0.6 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0078D4', marginBottom: 12 }}>Azure</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#555', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 6 }}>
                Coming soon
              </span>
            </div>

            {/* GCP */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px', opacity: 0.6 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e', marginBottom: 12 }}>GCP</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#555', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 6 }}>
                Coming soon
              </span>
            </div>
          </div>

          {/* AWS connect panel (inline expand) */}
          {showAwsPanel && !awsConnected && (
            <AwsConnectPanel onSaved={() => { setAwsConnected(true); setShowAwsPanel(false) }} />
          )}

          {/* What you unlock */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(99,102,241,0.02))',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 16,
            padding: '20px 24px',
            marginTop: 20,
          }}>
            <p style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>
              WHAT YOU UNLOCK WITH A CONNECTED ACCOUNT
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {UNLOCK_ITEMS.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
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
        padding: '11px 22px', borderRadius: 10,
        background: primary ? '#6366f1' : 'transparent',
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.15)',
        color: primary ? 'white' : '#a0a0b0',
        fontWeight: 600, fontSize: 14, textDecoration: 'none', display: 'inline-block',
      }}
      onMouseEnter={e => {
        if (!primary) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'white' }
        else e.currentTarget.style.background = '#4f46e5'
      }}
      onMouseLeave={e => {
        if (!primary) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a0a0b0' }
        else e.currentTarget.style.background = '#6366f1'
      }}
    >
      {label}
    </Link>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
