'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PLANS } from '@/lib/stripe'
import type { User } from '@supabase/supabase-js'

interface Recommendation {
  id: string
  provider: string
  confidence: number
  workload: string
  team_size: string
  budget: string
  created_at: string
}

const PROVIDER_COLORS: Record<string, string> = {
  'Amazon Web Services': '#FF9900',
  'Microsoft Azure': '#0078D4',
  'Google Cloud Platform': '#34A853',
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      setUser(session.user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfile(profileData)

      const { data: recs } = await supabase
        .from('saved_recommendations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setRecommendations(recs || [])
      setLoading(false)
    }
    loadData()
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#a0a0b0' }}>Loading your dashboard...</div>
    </div>
  )

  const planKey = (profile?.plan as keyof typeof PLANS) ?? 'free'
  const plan = PLANS[planKey] ?? PLANS.free
  const queriesUsed = (profile?.ai_queries_today as number) || 0
  const queriesLimit = plan.limits.aiQueriesPerDay
  const queriesDisplay = queriesLimit === -1
    ? `${queriesUsed} / Unlimited`
    : `${queriesUsed} / ${queriesLimit}`

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Welcome back 👋</h1>
            <p style={{ color: '#a0a0b0' }}>{(profile?.full_name as string) || user?.email}</p>
          </div>
          <button onClick={handleSignOut} style={{
            background: 'transparent',
            border: '1px solid #ffffff20',
            borderRadius: 8,
            padding: '8px 20px',
            color: '#a0a0b0',
            cursor: 'pointer',
            fontSize: 14,
          }}>
            Sign Out
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Current Plan', value: plan.name, color: '#6366f1', sub: plan.price === 0 ? 'Free forever' : `$${plan.price}/month` },
            { label: 'AI Queries Today', value: queriesDisplay, color: '#22c55e', sub: queriesLimit === -1 ? 'Unlimited' : `${queriesLimit - queriesUsed} remaining` },
            { label: 'Saved Reports', value: recommendations.length.toString(), color: '#FF9900', sub: 'Total recommendations' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#1a1a2e', borderRadius: 12, padding: 24, borderTop: `3px solid ${stat.color}` }}>
              <div style={{ color: '#a0a0b0', fontSize: 12, marginBottom: 8 }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {profile?.plan === 'free' && (
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #1a1a2e)',
            borderRadius: 16,
            padding: 24,
            marginBottom: 32,
            border: '1px solid #6366f1',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Upgrade to Pro</h3>
                <p style={{ color: '#a0a0b0', fontSize: 14 }}>
                  Unlimited AI queries, saved reports, deployment roadmaps and more.
                </p>
              </div>
              <button
                onClick={() => router.push('/pricing')}
                style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Upgrade — $19/mo →
              </button>
            </div>
          </div>
        )}

        <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 32, border: '1px solid #ffffff08' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Saved Recommendations</h2>
            <button
              onClick={() => router.push('/advisor')}
              style={{ background: 'transparent', border: '1px solid #6366f1', borderRadius: 8, padding: '8px 16px', color: '#6366f1', cursor: 'pointer', fontSize: 13 }}
            >
              + New Recommendation
            </button>
          </div>

          {recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
              <p style={{ marginBottom: 16 }}>No saved recommendations yet.</p>
              <button
                onClick={() => router.push('/advisor')}
                style={{ background: '#6366f1', border: 'none', borderRadius: 8, padding: '10px 24px', color: 'white', cursor: 'pointer', fontSize: 14 }}
              >
                Get Your First Recommendation →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommendations.map(rec => (
                <div key={rec.id} style={{
                  background: '#12121a',
                  borderRadius: 12,
                  padding: '16px 20px',
                  borderLeft: `4px solid ${PROVIDER_COLORS[rec.provider] ?? '#6366f1'}`,
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1fr',
                  gap: 16,
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ color: PROVIDER_COLORS[rec.provider] ?? '#6366f1', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
                      {rec.provider}
                    </div>
                    <div style={{ color: '#22c55e', fontSize: 13 }}>{rec.confidence}% match</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#e0e0e0', marginBottom: 4 }}>{rec.workload || 'General workload'}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{rec.team_size} · {rec.budget}</div>
                  </div>
                  <div style={{ textAlign: 'right', color: '#666', fontSize: 12 }}>
                    {new Date(rec.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
