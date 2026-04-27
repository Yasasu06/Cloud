'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PLANS } from '@/lib/stripe'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth')
      } else {
        setUser(session.user)
      }
      setLoading(false)
    })
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 40,
        }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Welcome back 👋</h1>
            <p style={{ color: '#a0a0b0' }}>{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              background: 'transparent',
              border: '1px solid #ffffff20',
              borderRadius: 8,
              padding: '8px 20px',
              color: '#a0a0b0',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Sign Out
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Current Plan', value: 'Free', color: '#6366f1' },
            { label: 'AI Queries Today', value: '0 / 3', color: '#22c55e' },
            { label: 'Saved Reports', value: '0', color: '#FF9900' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#1a1a2e',
              borderRadius: 12,
              padding: 24,
              borderTop: `3px solid ${stat.color}`,
            }}>
              <div style={{ color: '#a0a0b0', fontSize: 12, marginBottom: 8 }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: '#1a1a2e',
          borderRadius: 16,
          padding: 32,
          marginBottom: 32,
          border: '1px solid #ffffff08',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Upgrade to Pro</h2>
          <p style={{ color: '#a0a0b0', marginBottom: 24, fontSize: 15 }}>
            Get unlimited AI queries, saved reports, and your personalized deployment roadmap.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {PLANS.pro.features.map(f => (
              <div key={f} style={{ display: 'flex', gap: 8, color: '#e0e0e0', fontSize: 14 }}>
                <span style={{ color: '#22c55e' }}>✓</span>
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/pricing')}
            style={{
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '14px 32px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Upgrade to Pro — $19/month →
          </button>
        </div>

        <div style={{
          background: '#1a1a2e',
          borderRadius: 16,
          padding: 32,
          border: '1px solid #ffffff08',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Saved Recommendations</h2>
          <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 24 }}>
            Your past cloud advisor results will appear here.
          </p>
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <p>No saved recommendations yet.</p>
            <button
              onClick={() => router.push('/advisor')}
              style={{
                background: 'transparent',
                border: '1px solid #6366f1',
                borderRadius: 8,
                padding: '10px 24px',
                color: '#6366f1',
                cursor: 'pointer',
                marginTop: 16,
                fontSize: 14,
              }}
            >
              Get Your First Recommendation →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
