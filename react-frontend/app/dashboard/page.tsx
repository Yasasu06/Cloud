'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PLANS } from '@/lib/stripe'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-[#ffffff20] text-[#a0a0b0] bg-transparent hover:bg-[#ffffff10] hover:text-white"
          >
            Sign Out
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 40 }}>
          <Card className="bg-[#1a1a2e] border-t-[3px] border-t-[#6366f1] border-x-0 border-b-0 rounded-xl">
            <CardContent className="pt-6">
              <div className="text-xs text-[#a0a0b0] mb-2">CURRENT PLAN</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[#6366f1]">{plan.name}</span>
                <Badge className="bg-[#6366f1]/20 text-[#6366f1] border-[#6366f1]/30">
                  {plan.price === 0 ? 'Free' : 'Active'}
                </Badge>
              </div>
              <div className="text-xs text-[#666] mt-1">
                {plan.price === 0 ? 'Free forever' : `$${plan.price}/month`}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-t-[3px] border-t-[#22c55e] border-x-0 border-b-0 rounded-xl">
            <CardContent className="pt-6">
              <div className="text-xs text-[#a0a0b0] mb-2">AI QUERIES TODAY</div>
              <div className="text-2xl font-black text-[#22c55e] mb-2">{queriesDisplay}</div>
              {queriesLimit !== -1 && (
                <Progress
                  value={(queriesUsed / queriesLimit) * 100}
                  className="h-2 bg-[#ffffff10]"
                />
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-t-[3px] border-t-[#FF9900] border-x-0 border-b-0 rounded-xl">
            <CardContent className="pt-6">
              <div className="text-xs text-[#a0a0b0] mb-2">SAVED REPORTS</div>
              <div className="text-2xl font-black text-[#FF9900]">{recommendations.length}</div>
              <div className="text-xs text-[#666] mt-1">Total recommendations</div>
            </CardContent>
          </Card>
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
              <Button
                onClick={() => router.push('/pricing')}
                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold whitespace-nowrap"
              >
                Upgrade — $19/mo →
              </Button>
            </div>
          </div>
        )}

        <Card className="bg-[#1a1a2e] border-[#ffffff08]">
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle className="text-white text-xl">Saved Recommendations</CardTitle>
              <Button
                onClick={() => router.push('/advisor')}
                variant="outline"
                className="border-[#6366f1] text-[#6366f1] bg-transparent hover:bg-[#6366f1]/10 text-sm"
              >
                + New Recommendation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
                <p style={{ marginBottom: 16 }}>No saved recommendations yet.</p>
                <Button
                  onClick={() => router.push('/advisor')}
                  className="bg-[#6366f1] hover:bg-[#4f46e5] text-white"
                >
                  Get Your First Recommendation →
                </Button>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
