'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const RECOMMENDATIONS = [
  'Reserved Instances / Savings Plans',
  'Right-sizing instances',
  'Deleting idle / orphaned resources',
  'Storage tier migration (e.g. S3 Glacier)',
  'Switching cloud providers',
  'Adding CDN / caching layer',
  'Reserved DB instances (RDS / Aurora)',
  'Spot instances for batch workloads',
  'Consolidating multi-region deployments',
  'Reducing data transfer / egress costs',
  'Kubernetes right-sizing',
  'Serverless migration',
  'Other',
]

type Outcome = 'saved_money' | 'saved_time' | 'no_impact' | 'worse'

const OUTCOME_OPTIONS: { id: Outcome; label: string; icon: string; color: string }[] = [
  { id: 'saved_money', label: 'Saved money',         icon: '💰', color: '#22c55e' },
  { id: 'saved_time',  label: 'Saved time',           icon: '⏰', color: '#6366f1' },
  { id: 'no_impact',   label: 'No measurable impact', icon: '➡️', color: '#a0a0b0' },
  { id: 'worse',       label: 'Made things worse',    icon: '⚠️', color: '#ef4444' },
]

interface AggStats {
  count: number
  avg_saving: number
  success_rate: number
}

export default function TrackResultsPage() {
  const [recommendation, setRecommendation] = useState(RECOMMENDATIONS[0])
  const [action, setAction]                 = useState('')
  const [outcome, setOutcome]               = useState<Outcome | null>(null)
  const [saving, setSaving]                 = useState('')
  const [timeSaved, setTimeSaved]           = useState('')
  const [stars, setStars]                   = useState(0)
  const [hoverStar, setHoverStar]           = useState(0)
  const [submitting, setSubmitting]         = useState(false)
  const [submitted, setSubmitted]           = useState(false)
  const [stats, setStats]                   = useState<AggStats | null>(null)
  const [statsLoading, setStatsLoading]     = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const since = new Date()
        since.setDate(since.getDate() - 30)
        const { data, error } = await supabase
          .from('implementation_results')
          .select('outcome, saving_amount')
          .gte('created_at', since.toISOString())
        if (error || !data) { setStatsLoading(false); return }
        const success = data.filter(r => r.outcome === 'saved_money' || r.outcome === 'saved_time').length
        const savings = data.filter(r => r.outcome === 'saved_money' && r.saving_amount > 0).map(r => r.saving_amount as number)
        setStats({
          count: data.length,
          avg_saving: savings.length ? Math.round(savings.reduce((a, b) => a + b, 0) / savings.length) : 0,
          success_rate: data.length ? Math.round((success / data.length) * 100) : 0,
        })
      } catch {
        // stats unavailable
      } finally {
        setStatsLoading(false)
      }
    }
    loadStats()
  }, [])

  async function submit() {
    if (!outcome || !stars || !action.trim()) return
    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await supabase.from('implementation_results').insert({
        user_id: session?.user?.id ?? null,
        recommendation,
        action_taken: action.trim(),
        outcome,
        saving_amount: outcome === 'saved_money' ? parseFloat(saving) || 0 : 0,
        time_saved: outcome === 'saved_time' ? timeSaved : '',
        rating: stars,
        created_at: new Date().toISOString(),
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, fontWeight: 500,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', outline: 'none', boxSizing: 'border-box',
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, padding: '24px' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🙏</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>Thank you for sharing!</h2>
          <p style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Your result helps us improve recommendations for everyone. Every piece of feedback makes the platform smarter.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/analyze" style={{ background: '#6366f1', border: 'none', borderRadius: 10, padding: '12px 24px', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Run Another Analysis →
            </a>
            <a href="/optimize?tab=savings" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 24px', color: '#a0a0b0', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Savings Calculator
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            RESULTS TRACKER
          </div>
          <h1 style={{ fontSize: 'clamp(24px,5vw,38px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
            Did the recommendation work?
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 420, margin: '0 auto' }}>
            Come back and tell us what happened. Your feedback improves recommendations for everyone.
          </p>
        </div>

        {/* Aggregate stats */}
        {!statsLoading && stats && stats.count > 0 && (
          <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>📊 Last 30 days</div>
            <div style={{ fontSize: 13, color: '#666' }}><strong style={{ color: 'white' }}>{stats.count}</strong> users tracked results</div>
            {stats.avg_saving > 0 && <div style={{ fontSize: 13, color: '#666' }}>Average saving: <strong style={{ color: '#22c55e' }}>${stats.avg_saving.toLocaleString()}/mo</strong></div>}
            <div style={{ fontSize: 13, color: '#666' }}>Success rate: <strong style={{ color: 'white' }}>{stats.success_rate}%</strong></div>
          </div>
        )}

        {/* Form */}
        <div className="glass-card" style={{ padding: 28 }}>

          {/* Q1: Recommendation */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
              1. WHICH RECOMMENDATION DID YOU FOLLOW?
            </label>
            <select
              value={recommendation}
              onChange={e => setRecommendation(e.target.value)}
              style={{ ...inputStyle, background: '#0a0a0f' }}
            >
              {RECOMMENDATIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Q2: What did you do */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
              2. WHAT DID YOU DO?
            </label>
            <textarea
              value={action}
              onChange={e => setAction(e.target.value)}
              placeholder="e.g. Moved 3 RDS instances from on-demand to 1-year reserved, saving $340/month"
              rows={3}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.5, fontFamily: 'inherit' }}
            />
          </div>

          {/* Q3: Outcome */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 10 }}>
              3. WHAT WAS THE RESULT?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {OUTCOME_OPTIONS.map(o => (
                <button
                  key={o.id}
                  onClick={() => setOutcome(o.id)}
                  style={{
                    padding: '14px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    border: outcome === o.id ? `1px solid ${o.color}60` : '1px solid rgba(255,255,255,0.08)',
                    background: outcome === o.id ? `rgba(${hexToRgb(o.color)},0.08)` : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{o.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: outcome === o.id ? o.color : '#a0a0b0' }}>{o.label}</div>
                </button>
              ))}
            </div>

            {outcome === 'saved_money' && (
              <div>
                <label htmlFor="tr-saving" style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 6 }}>HOW MUCH PER MONTH? ($)</label>
                <input id="tr-saving" type="number" min="0" value={saving} onChange={e => setSaving(e.target.value)} placeholder="e.g. 340" style={inputStyle} />
              </div>
            )}
            {outcome === 'saved_time' && (
              <div>
                <label htmlFor="tr-timesaved" style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 6 }}>HOW MUCH TIME?</label>
                <input id="tr-timesaved" type="text" value={timeSaved} onChange={e => setTimeSaved(e.target.value)} placeholder="e.g. 3 hours/week, 1 day per month" style={inputStyle} />
              </div>
            )}
          </div>

          {/* Q4: Stars */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 12 }}>
              4. WOULD YOU RECOMMEND US TO OTHER FOUNDERS?
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onMouseEnter={() => setHoverStar(n)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setStars(n)}
                  style={{
                    fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                    transition: 'transform 0.1s',
                    transform: (hoverStar || stars) >= n ? 'scale(1.15)' : 'scale(1)',
                    filter: (hoverStar || stars) >= n ? 'none' : 'grayscale(1) opacity(0.3)',
                  }}
                >
                  ⭐
                </button>
              ))}
              {stars > 0 && (
                <span style={{ fontSize: 13, color: '#a0a0b0', marginLeft: 8, alignSelf: 'center' }}>
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][stars]}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={submit}
            disabled={!outcome || !stars || !action.trim() || submitting}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: (!outcome || !stars || !action.trim() || submitting) ? 'rgba(99,102,241,0.3)' : '#6366f1',
              border: 'none', color: 'white',
              cursor: (!outcome || !stars || !action.trim() || submitting) ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Results →'}
          </button>
        </div>

      </div>
    </div>
  )
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`
}
