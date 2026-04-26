'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Zap, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useJourney } from '@/lib/journeyContext'

const PROVIDER_COLORS: Record<string, string> = {
  AWS: '#FF9900', Azure: '#0078D4', GCP: '#34A853',
}

const MONTH_LABELS = ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12']

function computeShock(base: number, multiplier: number) {
  return MONTH_LABELS.map((m, i) => ({
    month: m,
    cost: Math.round(base * Math.pow(multiplier, i / 11)),
  }))
}

const JOURNEY_PROVIDER_MAP: Record<string, string> = {
  'Amazon Web Services': 'AWS',
  'Microsoft Azure': 'Azure',
  'Google Cloud Platform': 'GCP',
}

export default function CostShockPage() {
  const { journey } = useJourney()
  const router = useRouter()
  const [base, setBase] = useState(10000)
  const [multiplier, setMultiplier] = useState(3)
  const [provider, setProvider] = useState('AWS')
  const [data, setData] = useState<{ month: string; cost: number }[] | null>(null)

  useEffect(() => {
    if (!journey?.recommendedProvider) return
    const mapped = JOURNEY_PROVIDER_MAP[journey.recommendedProvider]
    if (mapped) setProvider(mapped)
  }, [journey])

  const run = useCallback(() => {
    setData(computeShock(base, multiplier))
  }, [base, multiplier])

  const finalCost = data ? data[data.length - 1].cost : null
  const totalAnnual = data ? data.reduce((s, d) => s + d.cost, 0) : null

  const alertLevel = multiplier >= 10 ? 'critical' : multiplier >= 5 ? 'high' : 'medium'
  const alertColors: Record<string, { bg: string; border: string; text: string }> = {
    critical: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.4)', text: '#f87171' },
    high: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
    medium: { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)', text: '#818cf8' },
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#ef4444' }}>
            Cost Shock Calculator
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            What happens when your bill explodes?
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Model worst-case cloud spend scenarios before they happen to your business.
          </p>
        </div>

        {journey && (
          <div style={{
            background: '#1a1a2e',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            borderLeft: `4px solid ${journey.providerColor}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <div>
              <div style={{ fontSize: 13, color: '#a0a0b0' }}>FROM YOUR CLOUD ADVISOR RESULT</div>
              <div style={{ fontWeight: 700, marginTop: 4, color: 'white' }}>
                {journey.recommendedProvider} recommended · {journey.confidence}% match
              </div>
            </div>
            <div style={{ color: '#a0a0b0', fontSize: 13 }}>
              {journey.teamSize} · {journey.workload}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <label className="block text-xs font-semibold text-white mb-2">Current Monthly Spend ($)</label>
              <input
                type="number"
                value={base}
                min={100}
                onChange={(e) => setBase(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg text-sm text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)' }}
              />
            </div>

            {/* Quick preset buttons */}
            <div>
              <p className="text-xs font-semibold text-white mb-2">Shock Scenario</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[2, 5, 10].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMultiplier(m)}
                    className="py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: multiplier === m ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                      border: multiplier === m ? '1px solid #ef4444' : '1px solid transparent',
                      color: multiplier === m ? '#f87171' : '#a0a0b0',
                    }}
                  >
                    {m}×
                  </button>
                ))}
              </div>
              <input
                type="range" min={1.5} max={20} step={0.5}
                value={multiplier}
                onChange={(e) => setMultiplier(Number(e.target.value))}
                className="w-full accent-red-500"
              />
              <div className="text-center text-sm font-bold mt-1" style={{ color: '#f87171' }}>
                {multiplier}× multiplier
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-white mb-2">Provider</p>
              <div className="grid grid-cols-3 gap-2">
                {['AWS', 'Azure', 'GCP'].map((p) => (
                  <button
                    key={p} onClick={() => setProvider(p)}
                    className="py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: provider === p ? `${PROVIDER_COLORS[p]}22` : 'rgba(255,255,255,0.05)',
                      border: provider === p ? `1px solid ${PROVIDER_COLORS[p]}` : '1px solid transparent',
                      color: provider === p ? PROVIDER_COLORS[p] : '#a0a0b0',
                    }}
                  >{p}</button>
                ))}
              </div>
            </div>

            <button
              onClick={run}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              <Zap size={15} /> Calculate Shock
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {data && finalCost && totalAnnual ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: DollarSign, label: 'Month 1', value: `$${base.toLocaleString()}`, color: PROVIDER_COLORS[provider] },
                    { icon: TrendingUp, label: 'Month 12', value: `$${finalCost.toLocaleString()}`, color: '#6366f1' },
                    { icon: AlertTriangle, label: 'Total Annual', value: `$${totalAnnual.toLocaleString()}`, color: '#f59e0b' },
                    { icon: Zap, label: 'Multiplier', value: `${multiplier}×`, color: '#ef4444' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl p-4 text-center"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <stat.icon size={16} className="mx-auto mb-1.5" style={{ color: stat.color }} />
                      <div className="text-xl font-black text-white">{stat.value}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-xl p-4 text-sm"
                  style={alertColors[alertLevel]}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: alertColors[alertLevel].text }} />
                    <span style={{ color: '#e2e8f0' }}>
                      {alertLevel === 'critical'
                        ? `🚨 Critical: A ${multiplier}× cost shock would bring your ${provider} bill to $${finalCost.toLocaleString()}/month. This is a business continuity risk. Establish budget alerts, reserved capacity, and spending caps immediately.`
                        : alertLevel === 'high'
                        ? `⚠️ High Risk: A ${multiplier}× spike would cost $${finalCost.toLocaleString()}/month. Implement Savings Plans or committed use discounts now.`
                        : `ℹ️ Moderate scenario. Your ${provider} costs would reach $${finalCost.toLocaleString()}/month — manageable with proper budget governance.`}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div
                className="h-40 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Configure your scenario and click Calculate Shock
                </p>
              </div>
            )}
          </div>
        </div>

        {data && (
          <>
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">Monthly Cost Projection</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#a0a0b0', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#a0a0b0', fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={48} />
                <Tooltip
                  contentStyle={{ background: 'rgba(18,18,26,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Monthly Cost']}
                />
                <Bar dataKey="cost" fill={PROVIDER_COLORS[provider]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Next Step banner */}
          <div style={{
            marginTop: 24,
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #ffffff15',
          }}>
            <div style={{ fontSize: 13, color: '#a0a0b0', marginBottom: 8 }}>NEXT STEP</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Planning a migration or starting fresh?
            </h3>
            <p style={{ color: '#a0a0b0', marginBottom: 16, fontSize: 14 }}>
              See how complex your migration would be and get a step by step timeline.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/migration')}
                style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Analyze My Migration →
              </button>
              <button
                onClick={() => router.push('/chat')}
                style={{ background: 'transparent', color: 'white', border: '1px solid #ffffff30', borderRadius: 12, padding: '12px 24px', fontSize: 14, cursor: 'pointer' }}
              >
                Ask AI Consultant
              </button>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  )
}
