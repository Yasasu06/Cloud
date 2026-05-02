'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Invite {
  id: string
  email: string
  status: string
  created_at: string
}

export default function TeamPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [plan, setPlan] = useState('Free')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/auth'); return }
      setUserEmail(session.user.email ?? null)

      const [{ data: inviteRows }, { data: profile }] = await Promise.all([
        supabase
          .from('team_invites')
          .select('id, email, status, created_at')
          .eq('invited_by', session.user.email)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single(),
      ])

      setInvites((inviteRows ?? []) as Invite[])
      if (profile?.plan) setPlan(capitalize(profile.plan as string))
      setLoading(false)
    }
    load()
  }, [router])

  async function sendInvite() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (invites.some(i => i.email === email.trim())) {
      setError('This email has already been invited.')
      return
    }
    setSending(true)
    setError('')
    setSuccess('')
    try {
      const { error: dbErr } = await supabase.from('team_invites').insert({
        email: email.trim(),
        invited_by: userEmail,
        status: 'pending',
      })
      if (dbErr) throw dbErr
      setInvites(prev => [{
        id: crypto.randomUUID(),
        email: email.trim(),
        status: 'pending',
        created_at: new Date().toISOString(),
      }, ...prev])
      setEmail('')
      setSuccess(`Invite sent to ${email.trim()}`)
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send invite.')
    } finally {
      setSending(false)
    }
  }

  async function revokeInvite(id: string, inviteEmail: string) {
    await supabase.from('team_invites').delete().eq('id', id)
    setInvites(prev => prev.filter(i => i.id !== id))
    setSuccess(`Invite to ${inviteEmail} revoked.`)
    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#a0a0b0' }}>Loading…</div>
      </div>
    )
  }

  const isFree = plan === 'Free'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, letterSpacing: 1 }}>
              TEAM
            </div>
            <Link href="/dashboard" style={{ fontSize: 13, color: '#555', textDecoration: 'none' }}>
              ← Dashboard
            </Link>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, marginBottom: 10 }}>
            Invite your team
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 480 }}>
            Collaborate on cloud analyses and share recommendations with your team.
          </p>
        </div>

        {/* Upgrade prompt for Free users */}
        {isFree && (
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 14, padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#818cf8', marginBottom: 4 }}>Upgrade to add team members</div>
              <div style={{ fontSize: 13, color: '#666' }}>Team invites are available on Pro and Enterprise plans.</div>
            </div>
            <Link href="/pricing" style={{ background: '#6366f1', color: 'white', padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              View Plans →
            </Link>
          </div>
        )}

        {/* Invite form */}
        <div style={{ background: '#1a1a2e', borderRadius: 16, padding: '24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32, opacity: isFree ? 0.5 : 1, pointerEvents: isFree ? 'none' : 'auto' }}>
          <label htmlFor="invite-email" style={{ fontSize: 13, fontWeight: 700, color: '#a0a0b0', marginBottom: 16, display: 'block' }}>SEND INVITE</label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendInvite()}
              placeholder="colleague@company.com"
              aria-label="Colleague email address"
              style={{
                flex: 1,
                minWidth: 220,
                background: '#0a0a0f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '12px 16px',
                color: 'white',
                fontSize: 14,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={sendInvite}
              disabled={sending || !email.trim()}
              style={{
                background: '#6366f1',
                border: 'none',
                borderRadius: 10,
                padding: '12px 24px',
                color: 'white',
                fontWeight: 700,
                fontSize: 14,
                cursor: sending || !email.trim() ? 'not-allowed' : 'pointer',
                opacity: sending || !email.trim() ? 0.5 : 1,
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (!sending && email.trim()) e.currentTarget.style.background = '#4f46e5' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#6366f1' }}
            >
              {sending ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
          {error && <p style={{ fontSize: 13, color: '#f87171', marginTop: 10 }}>{error}</p>}
          {success && <p style={{ fontSize: 13, color: '#22c55e', marginTop: 10 }}>{success}</p>}
        </div>

        {/* Pending invites */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 14 }}>
            PENDING INVITES {invites.length > 0 && `(${invites.length})`}
          </div>
          {invites.length === 0 ? (
            <div style={{ background: '#111118', borderRadius: 12, padding: '32px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', color: '#444', fontSize: 14 }}>
              No invites sent yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {invites.map(inv => (
                <div key={inv.id} style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#818cf8', fontWeight: 700, flexShrink: 0 }}>
                      {inv.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>{inv.email}</div>
                      <div style={{ fontSize: 12, color: '#555' }}>Invited {formatDate(inv.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: inv.status === 'accepted' ? '#22c55e' : '#f59e0b',
                      background: inv.status === 'accepted' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                      border: `1px solid ${inv.status === 'accepted' ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
                      padding: '2px 10px', borderRadius: 8, letterSpacing: 0.5,
                    }}>
                      {inv.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => revokeInvite(inv.id, inv.email)}
                      style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}
                      title="Revoke invite"
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming soon */}
        <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>COMING SOON</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🗂️', label: 'Shared analyses', desc: 'Share any analysis with teammates with a link' },
              { icon: '📊', label: 'Team dashboard', desc: 'See all team members\' analyses in one view' },
              { icon: '💬', label: 'Inline comments', desc: 'Annotate and discuss analyses together' },
              { icon: '📋', label: 'Shared report cards', desc: 'Team cloud health scores and benchmarks' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#a0a0b0', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#444' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
