'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import { getUserMode, modeInstruction } from '@/lib/userMode'

type Speed = 'aggressive' | 'moderate' | 'conservative'
type Risk = 'low' | 'medium' | 'high'
type Effort = 'quick_wins' | 'full'
type Goal = 'reduce_cost' | 'improve_perf' | 'migrate' | 'modernize'

interface Milestone {
  week: number
  action: string
  expected_spend: number
  savings: number
  confidence: number
  effort: string
  risk_level: 'low' | 'medium' | 'high'
  steps?: string[]
}
interface AlternativePath {
  name: string
  description: string
  savings_diff: number
  risk_diff: string
}
interface Plan {
  current_state: { spend: number; provider: string; summary: string }
  milestones: Milestone[]
  total_savings: { monthly: number; annual: number; roi_pct: number }
  alternative_paths?: AlternativePath[]
}

const RISK_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }

export default function OutcomeSimulatorPage() {
  const [spend, setSpend]       = useState(5000)
  const [provider, setProvider] = useState('AWS')
  const [goal, setGoal]         = useState<Goal>('reduce_cost')
  const [speed, setSpeed]       = useState<Speed>('moderate')
  const [risk, setRisk]         = useState<Risk>('medium')
  const [effort, setEffort]     = useState<Effort>('full')
  const [plan, setPlan]         = useState<Plan | null>(null)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState<Record<number, boolean>>({})
  const [showAlts, setShowAlts] = useState(false)

  // What-if multipliers — adjust the rendered savings without re-fetching
  const speedMul = { aggressive: 1.25, moderate: 1.0, conservative: 0.7 }[speed]
  const riskMul  = { low: 0.85, medium: 1.0, high: 1.2 }[risk]
  const effortMul = { quick_wins: 0.6, full: 1.0 }[effort]
  const adjMul = speedMul * riskMul * effortMul

  async function generate() {
    setLoading(true); setPlan(null); setDone({})
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1800,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: `You are a senior cloud optimization consultant. Return ONLY valid JSON matching this schema (no markdown, no extra text):
{
  "current_state": { "spend": number, "provider": "string", "summary": "1-sentence current situation" },
  "milestones": [
    { "week": 1, "action": "Action title", "expected_spend": 4800, "savings": 200, "confidence": 85, "effort": "2 hours", "risk_level": "low", "steps": ["step1","step2"] }
  ],
  "total_savings": { "monthly": 1200, "annual": 14400, "roi_pct": 24 },
  "alternative_paths": [
    { "name": "Conservative", "description": "Lower savings, lowest risk", "savings_diff": -300, "risk_diff": "lower" },
    { "name": "Aggressive", "description": "Higher savings, higher complexity", "savings_diff": 400, "risk_diff": "higher" }
  ]
}

Generate 4-6 milestones spanning 12 weeks. Be specific with action titles (e.g., "Right-size 3 over-provisioned EC2 instances"). Provide realistic numbers based on the user's spend.${modeInstruction(getUserMode())}` },
            { role: 'user', content: `Goal: ${goal}. Current monthly spend: $${spend} on ${provider}. Speed: ${speed}, risk tolerance: ${risk}, effort budget: ${effort}.` },
          ],
        }),
      })
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || '{}'
      try {
        const parsed = JSON.parse(text) as Plan
        if (parsed.milestones && Array.isArray(parsed.milestones)) setPlan(parsed)
      } catch (_e) {
        const m = text.match(/\{[\s\S]*\}/)
        if (m) {
          try { setPlan(JSON.parse(m[0]) as Plan) } catch (_e2) { /* fallthrough */ }
        }
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // Auto-run on mount with default values for instant gratification
  useEffect(() => { void generate() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const adjustedMilestones = plan ? plan.milestones.map(m => ({ ...m, savings: Math.round(m.savings * adjMul), expected_spend: Math.round(spend - (spend - m.expected_spend) * adjMul) })) : []
  const adjustedTotal = plan ? { monthly: Math.round(plan.total_savings.monthly * adjMul), annual: Math.round(plan.total_savings.annual * adjMul), roi_pct: Math.round(plan.total_savings.roi_pct * adjMul) } : null

  const chartData = [
    { week: 0, spend, label: 'Today' },
    ...adjustedMilestones.map(m => ({ week: m.week, spend: m.expected_spend, label: `W${m.week}` })),
  ]

  function toggleDone(week: number) { setDone(d => ({ ...d, [week]: !d[week] })) }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>OUTCOME SIMULATOR</p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Visualize the path from today to optimized
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 640 }}>
            See exactly how your cloud spend evolves week by week. Adjust the sliders to explore different paths.
          </p>
        </div>

        <DisclaimerBanner />

        {/* Inputs */}
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <label htmlFor="os-spend" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1, marginBottom: 6 }}>MONTHLY SPEND ($)</label>
              <input id="os-spend" type="number" value={spend} onChange={e => setSpend(parseInt(e.target.value) || 0)} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="os-provider" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1, marginBottom: 6 }}>PROVIDER</label>
              <select id="os-provider" value={provider} onChange={e => setProvider(e.target.value)} style={inputStyle}>
                {['AWS', 'Azure', 'GCP', 'DigitalOcean', 'Hetzner', 'Multiple'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="os-goal" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1, marginBottom: 6 }}>GOAL</label>
              <select id="os-goal" value={goal} onChange={e => setGoal(e.target.value as Goal)} style={inputStyle}>
                <option value="reduce_cost">Reduce cost</option>
                <option value="improve_perf">Improve performance</option>
                <option value="migrate">Migrate provider</option>
                <option value="modernize">Modernize stack</option>
              </select>
            </div>
          </div>

          {/* What-if sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
            <SegmentedControl label="SPEED" value={speed} onChange={setSpeed} options={[{ v: 'conservative', l: 'Conservative' }, { v: 'moderate', l: 'Moderate' }, { v: 'aggressive', l: 'Aggressive' }]} />
            <SegmentedControl label="RISK TOLERANCE" value={risk} onChange={setRisk} options={[{ v: 'low', l: 'Low' }, { v: 'medium', l: 'Medium' }, { v: 'high', l: 'High' }]} />
            <SegmentedControl label="EFFORT" value={effort} onChange={setEffort} options={[{ v: 'quick_wins', l: 'Quick wins' }, { v: 'full', l: 'Full optimization' }]} />
          </div>

          <button onClick={generate} disabled={loading} style={{ background: '#6366f1', border: 'none', borderRadius: 10, padding: '11px 24px', color: 'white', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Generating plan...' : '🔮 Generate plan'}
          </button>
        </div>

        {loading && <div className="ai-shimmer" style={{ height: 280, borderRadius: 14, marginBottom: 16 }} />}

        {plan && adjustedTotal && (
          <>
            {/* Total savings hero card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
              <StatCard label="MONTHLY SAVINGS" value={`$${adjustedTotal.monthly.toLocaleString()}`} color="#22c55e" />
              <StatCard label="ANNUAL SAVINGS" value={`$${adjustedTotal.annual.toLocaleString()}`} color="#22c55e" />
              <StatCard label="ROI" value={`${adjustedTotal.roi_pct}%`} color="#818cf8" />
              <StatCard label="MILESTONES" value={`${adjustedMilestones.length}`} color="#a0a0b0" />
            </div>

            {/* Trajectory chart */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: '0 0 14px' }}>Spend trajectory over 12 weeks</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip contentStyle={{ background: '#0d0d18', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 8, fontSize: 13 }} />
                  <Line type="monotone" dataKey="spend" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Timeline of milestones */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: '0 0 14px' }}>Milestones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {adjustedMilestones.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 16, padding: '16px 18px', borderRadius: 12,
                    background: done[m.week] ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${done[m.week] ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.05)'}`,
                    borderLeft: `3px solid ${RISK_COLOR[m.risk_level] ?? '#888'}`,
                    opacity: done[m.week] ? 0.7 : 1,
                  }}>
                    <button
                      onClick={() => toggleDone(m.week)}
                      aria-label={`Mark week ${m.week} complete`}
                      style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginTop: 2,
                        background: done[m.week] ? '#22c55e' : 'transparent',
                        border: `2px solid ${done[m.week] ? '#22c55e' : 'rgba(255,255,255,0.2)'}`,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                    >{done[m.week] && '✓'}</button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: 'rgba(99,102,241,0.12)', color: '#818cf8', letterSpacing: 1 }}>WEEK {m.week}</span>
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: `${RISK_COLOR[m.risk_level]}15`, color: RISK_COLOR[m.risk_level], fontWeight: 700 }}>{m.risk_level.toUpperCase()} RISK</span>
                        <span style={{ fontSize: 11, color: '#666' }}>⏱ {m.effort}</span>
                        <span style={{ fontSize: 11, color: '#666' }}>{m.confidence}% confidence</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4, textDecoration: done[m.week] ? 'line-through' : 'none' }}>{m.action}</div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#a0a0b0', flexWrap: 'wrap' }}>
                        <span>New spend: <strong style={{ color: 'white' }}>${m.expected_spend.toLocaleString()}/mo</strong></span>
                        <span>Saved: <strong style={{ color: '#22c55e' }}>${m.savings.toLocaleString()}/mo</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Multiple paths */}
            {plan.alternative_paths && plan.alternative_paths.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <button onClick={() => setShowAlts(s => !s)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px', color: '#a0a0b0', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 14 }}>
                  {showAlts ? 'Hide' : 'Show'} alternative paths ({plan.alternative_paths.length})
                </button>
                {showAlts && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {plan.alternative_paths.map((p, i) => (
                      <div key={i} style={{ padding: '16px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 6 }}>{p.name}</div>
                        <p style={{ fontSize: 12, color: '#a0a0b0', lineHeight: 1.6, marginBottom: 10 }}>{p.description}</p>
                        <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                          <span style={{ color: p.savings_diff >= 0 ? '#22c55e' : '#ef4444' }}>{p.savings_diff >= 0 ? '+' : ''}${p.savings_diff}/mo</span>
                          <span style={{ color: '#666' }}>Risk: {p.risk_diff}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Next action cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 32 }}>
              <NextActionCard href="/optimize" icon="💰" title="Run Optimization Tools" desc="Calculate exact savings now" />
              <NextActionCard href="/sanity-check" icon="🛟" title="Validate First Step" desc="Get a DO IT / WAIT verdict" />
              <NextActionCard href="/track-results" icon="📈" title="Track Implementation" desc="Log outcomes as you go" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}

function SegmentedControl<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: Array<{ v: T; l: string }> }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1, marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 2 }}>
        {options.map(o => (
          <button key={o.v} onClick={() => onChange(o.v)}
            style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
              background: value === o.v ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: value === o.v ? '#818cf8' : '#888' }}
          >{o.l}</button>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '16px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function NextActionCard({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <a href={href} style={{ textDecoration: 'none', display: 'block', padding: '16px 18px', borderRadius: 12, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', transition: 'all 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.15)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
    >
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 11, color: '#a0a0b0' }}>{desc}</div>
    </a>
  )
}
