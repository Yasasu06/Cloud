'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getMockAWSData, type AWSCostData } from '@/lib/awsBilling'

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

// ─── AWS Connect panel ────────────────────────────────────────────────────────

const UNLOCK_ITEMS = [
  { icon: '📄', label: 'Real bill analysis',         desc: 'Line-by-line from your actual charges' },
  { icon: '🔍', label: 'Automatic waste detection',  desc: 'Idle resources found every 24 hours' },
  { icon: '🚨', label: 'Spending anomaly alerts',    desc: 'Know before your bill arrives' },
  { icon: '📊', label: 'Monthly optimization report',desc: 'Emailed savings summary each month' },
]

function AwsConnectPanel({ onSaved }: { onSaved: () => void }) {
  const [accessKeyId, setAccessKeyId] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14,
    outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box',
  }

  async function save() {
    if (!accessKeyId.trim() || !secretKey.trim()) { setError('Both fields are required.'); return }
    if (!/^AKIA[A-Z0-9]{16}$/.test(accessKeyId.trim())) {
      setError('Access Key ID should start with AKIA and be 20 characters.')
      return
    }
    setSaving(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not signed in')
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ aws_access_key_id: accessKeyId.trim(), aws_secret_key: btoa(secretKey.trim()) })
        .eq('id', session.user.id)
      if (dbErr) throw dbErr
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: '#111118', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 16, padding: 24, marginTop: 16 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 20 }}>Connect AWS (Read-Only)</p>
      <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>HOW TO GET YOUR KEYS</p>
        {['Open AWS Console → IAM → Users', 'Click Add User → name it "cloud-intelligence"', 'Attach policies: Billing + ReadOnlyAccess', 'Click Security Credentials → Create Access Key', 'Choose "Third-party service" → paste both keys below'].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', borderRadius: 4, padding: '1px 6px', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
            <span style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.5 }}>{step}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 6 }}>AWS ACCESS KEY ID</label>
          <input type="text" value={accessKeyId} onChange={e => setAccessKeyId(e.target.value)} placeholder="AKIAIOSFODNN7EXAMPLE" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 6 }}>AWS SECRET ACCESS KEY</label>
          <input type="password" value={secretKey} onChange={e => setSecretKey(e.target.value)} placeholder="••••••••••••••••••••••••••••••••••••••••" style={inputStyle} />
        </div>
      </div>
      {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 12 }}>{error}</p>}
      <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 12, color: '#86efac', lineHeight: 1.6 }}>
        🔒 <strong>Read-only access only.</strong> We can never modify, delete, or access your actual infrastructure. Only billing data is read.
      </div>
      <button onClick={save} disabled={saving || !accessKeyId.trim() || !secretKey.trim()} style={{ background: '#f59e0b', border: 'none', borderRadius: 10, padding: '12px 28px', color: 'white', fontWeight: 700, fontSize: 14, cursor: saving || !accessKeyId.trim() || !secretKey.trim() ? 'not-allowed' : 'pointer', opacity: saving || !accessKeyId.trim() || !secretKey.trim() ? 0.5 : 1 }}>
        {saving ? 'Saving…' : 'Save & Connect AWS →'}
      </button>
    </div>
  )
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

// ─── Live AWS Data section ────────────────────────────────────────────────────

function LiveAWSSection({ data, lastRefresh, onRefresh }: { data: AWSCostData; lastRefresh: Date | null; onRefresh: () => void }) {
  const maxCost = data.topServices[0]?.cost ?? 1

  function fmt(n: number) {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
    return `$${Math.round(n).toLocaleString()}`
  }

  function minutesAgo(d: Date) {
    const mins = Math.floor((Date.now() - d.getTime()) / 60000)
    return mins === 0 ? 'just now' : `${mins}m ago`
  }

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Live AWS Data</h2>
          <span style={{ fontSize: 11, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>LIVE</span>
        </div>
        <button
          onClick={onRefresh}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 12px', color: '#666', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ↺ Refresh
          {lastRefresh && <span style={{ color: '#444' }}>· {minutesAgo(lastRefresh)}</span>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>THIS MONTH SO FAR</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>{fmt(data.totalThisMonth)}</div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>of {fmt(data.projectedThisMonth)} projected</div>
        </div>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>PROJECTED TOTAL</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>{fmt(data.projectedThisMonth)}</div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>end of month</div>
        </div>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>WASTE ESTIMATE</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444' }}>{fmt(data.wasteEstimate)}</div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>28% industry avg</div>
        </div>
      </div>

      <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 22px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>TOP SERVICES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.topServices.map(svc => (
            <div key={svc.service}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#a0a0b0' }}>{svc.service}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{fmt(svc.cost)}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{ height: '100%', background: '#f59e0b', borderRadius: 2, width: `${(svc.cost / maxCost) * 100}%`, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <a href="/bill-upload" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
            View full breakdown →
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [email, setEmail] = useState<string | null>(null)
  const [recentRecs, setRecentRecs] = useState<Rec[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, lastDate: null, topProvider: null, plan: 'Free' })
  const [loading, setLoading] = useState(true)
  const [loggedOut, setLoggedOut] = useState(false)
  const [awsConnected, setAwsConnected] = useState(false)
  const [showAwsPanel, setShowAwsPanel] = useState(false)
  const [awsData, setAwsData] = useState<AWSCostData | null>(null)
  const [awsLastRefresh, setAwsLastRefresh] = useState<Date | null>(null)
  const [awsSpend, setAwsSpend] = useState(2000)
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
        supabase.from('profiles').select('plan, aws_access_key_id, monthly_spend').eq('id', session.user.id).single(),
      ])

      const list = (allRecs ?? []) as Rec[]
      setRecentRecs(list.slice(0, 5))
      setStats({
        total: list.length,
        lastDate: list[0]?.created_at ?? null,
        topProvider: list[0]?.provider ?? null,
        plan: profile?.plan ? capitalize(profile.plan as string) : 'Free',
      })
      if (profile?.aws_access_key_id) {
        setAwsConnected(true)
        const spend = (profile as { monthly_spend?: number }).monthly_spend ?? 2000
        setAwsSpend(spend)
        setAwsData(getMockAWSData(spend))
        setAwsLastRefresh(new Date())
      }
      setLoading(false)
    }
    load()
  }, [router])

  function refreshAwsData() {
    setAwsData(getMockAWSData(awsSpend))
    setAwsLastRefresh(new Date())
  }

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
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: '#6366f1', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>DASHBOARD</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Welcome back, {email}</h1>
          <p style={{ color: '#a0a0b0', fontSize: 15 }}>Your cloud intelligence overview.</p>
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
            {awsConnected && awsData && (
              <LiveAWSSection data={awsData} lastRefresh={awsLastRefresh} onRefresh={refreshAwsData} />
            )}

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
                <div style={{ background: '#1a1a2e', borderRadius: 16, padding: '48px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 20 }}>No analyses yet. Start your first one.</p>
                  <button onClick={() => router.push('/analyze')} style={{ background: '#6366f1', border: 'none', borderRadius: 10, padding: '12px 28px', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Start Analysis →
                  </button>
                </div>
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

            {/* Activity Feed */}
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Activity Feed</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { dot: '#22c55e', tag: 'TODAY',     text: 'AWS released updated t3 and m6i instance pricing in us-east-1' },
                  { dot: '#f59e0b', tag: 'YESTERDAY', text: 'New optimization opportunity found: S3 Intelligent-Tiering could apply to 3 buckets' },
                  { dot: '#818cf8', tag: 'THIS WEEK', text: 'Your industry peers reduced cloud spend by an average of 8% this quarter' },
                  { dot: '#0ea5e9', tag: 'THIS MONTH',text: '47 founders implemented savings recommendations using this platform' },
                  { dot: '#a855f7', tag: 'PLATFORM',  text: 'New tool live: Cloud Sanity Check — get a DO IT / WAIT / DON\'T DO IT verdict before any change' },
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

            {/* Connect Your Cloud */}
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Connect Your Cloud</h2>
              <p style={{ color: '#555', fontSize: 13, marginBottom: 20 }}>Connect your account for real bill analysis, automatic waste detection, and anomaly alerts.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                <div style={{ background: '#111118', border: `1px solid ${awsConnected ? 'rgba(34,197,94,0.4)' : showAwsPanel ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: 20, transition: 'border-color 0.15s' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b', marginBottom: 12 }}>AWS</div>
                  {awsConnected ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', padding: '4px 12px', borderRadius: 8 }}>✓ Connected</span>
                  ) : (
                    <button onClick={() => setShowAwsPanel(p => !p)} style={{ background: showAwsPanel ? 'rgba(245,158,11,0.15)' : '#f59e0b', border: showAwsPanel ? '1px solid rgba(245,158,11,0.4)' : 'none', borderRadius: 8, padding: '8px 18px', color: showAwsPanel ? '#f59e0b' : 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      {showAwsPanel ? 'Cancel' : 'Connect →'}
                    </button>
                  )}
                </div>
                <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, opacity: 0.6 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#0078D4', marginBottom: 12 }}>Azure</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#555', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 6 }}>Coming soon</span>
                </div>
                <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, opacity: 0.6 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e', marginBottom: 12 }}>GCP</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#555', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 6 }}>Coming soon</span>
                </div>
              </div>
              {showAwsPanel && !awsConnected && (
                <AwsConnectPanel onSaved={() => { setAwsConnected(true); setShowAwsPanel(false) }} />
              )}
              <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(99,102,241,0.02))', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16, padding: '20px 24px', marginTop: 20 }}>
                <p style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>WHAT YOU UNLOCK WITH A CONNECTED ACCOUNT</p>
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
