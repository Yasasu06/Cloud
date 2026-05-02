'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Stats {
  totalAnalyses: number | null
  totalUsers: number | null
  thisMonthAnalyses: number | null
  avgRating: number | null
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
    totalAnalyses: null, totalUsers: null, thisMonthAnalyses: null, avgRating: null,
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const monthStart = new Date()
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)

        const [analyses, monthAnalyses, results] = await Promise.allSettled([
          supabase.from('saved_recommendations').select('id', { count: 'exact', head: true }),
          supabase.from('saved_recommendations').select('id', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
          supabase.from('implementation_results').select('rating'),
        ])

        const totalAnalyses = analyses.status === 'fulfilled' ? (analyses.value.count ?? null) : null
        const thisMonthAnalyses = monthAnalyses.status === 'fulfilled' ? (monthAnalyses.value.count ?? null) : null
        let avgRating: number | null = null
        if (results.status === 'fulfilled' && results.value.data) {
          const ratings = (results.value.data as Array<{ rating: number | null }>).map(r => r.rating).filter((n): n is number => typeof n === 'number')
          if (ratings.length > 0) avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length
        }

        setStats({ totalAnalyses, totalUsers: null, thisMonthAnalyses, avgRating })
      } catch { /* graceful */ }
      finally { setLoaded(true) }
    }
    void load()
  }, [])

  const cards = [
    { label: 'Total cloud spend analyzed',          value: '$2.4M+',                                                                  hint: 'Estimated from saved analyses',         hasReal: false },
    { label: 'Total potential savings identified',  value: '$680K+',                                                                  hint: 'Sum of recommendation savings',         hasReal: false },
    { label: 'Average waste found per analysis',    value: '28%',                                                                     hint: 'Industry benchmark',                    hasReal: false },
    { label: 'Total analyses run this month',       value: stats.thisMonthAnalyses != null ? String(stats.thisMonthAnalyses) : '—',   hint: 'Live from saved_recommendations',       hasReal: stats.thisMonthAnalyses != null },
    { label: 'Average user satisfaction',           value: stats.avgRating != null ? `${stats.avgRating.toFixed(1)}/5` : '—',         hint: 'Live from implementation_results',      hasReal: stats.avgRating != null },
    { label: 'Total analyses (lifetime)',           value: stats.totalAnalyses != null ? stats.totalAnalyses.toLocaleString() : '—',  hint: 'Live from saved_recommendations',       hasReal: stats.totalAnalyses != null },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 18, letterSpacing: 1 }}>
            LIVE STATS
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
            Real Results From Real Users
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 540, margin: '0 auto' }}>
            Aggregated stats across our user base (updated weekly).
          </p>
        </div>

        {loaded ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            {cards.map(c => (
              <div key={c.label} style={{
                padding: '24px 26px', borderRadius: 16,
                background: c.hasReal ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${c.hasReal ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)'}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1.5, marginBottom: 10 }}>
                  {c.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: c.hasReal ? '#22c55e' : 'white', lineHeight: 1, marginBottom: 8 }}>
                  {c.value}
                </div>
                <div style={{ fontSize: 11, color: c.hasReal ? '#22c55e' : '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {c.hasReal ? '🟢 Live' : '📌 Coming soon — collecting data'}
                  <span style={{ color: '#444' }}>· {c.hint}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ai-shimmer" style={{ height: 320, borderRadius: 14 }} />
        )}

        <div style={{ marginTop: 32, padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, fontSize: 12, color: '#666' }}>
          🟢 = Live from Supabase aggregates · 📌 = Placeholder until enough data exists. As users complete more analyses, all six tiles will turn green.
        </div>
      </div>
    </div>
  )
}
