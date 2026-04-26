'use client'

import { useState, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, DollarSign, AlertTriangle } from 'lucide-react'

const PROVIDERS = ['AWS', 'Azure', 'GCP']
const PROVIDER_COLORS: Record<string, string> = {
  AWS: '#FF9900', Azure: '#0078D4', GCP: '#34A853',
}

const QUARTERS = ['Now', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12']

function buildProjection(
  current: number,
  growthPct: number,
  provider: string
): { quarter: string; cost: number }[] {
  const quarterlyRate = Math.pow(1 + growthPct / 100, 1 / 4) - 1
  return QUARTERS.map((q, i) => ({
    quarter: q,
    cost: Math.round(current * Math.pow(1 + quarterlyRate, i)),
  }))
}

export default function SimulatorPage() {
  const [monthly, setMonthly] = useState(10000)
  const [growth, setGrowth] = useState(30)
  const [provider, setProvider] = useState('AWS')
  const [data, setData] = useState<{ quarter: string; cost: number }[] | null>(null)

  const run = useCallback(() => {
    setData(buildProjection(monthly, growth, provider))
  }, [monthly, growth, provider])

  const finalCost = data ? data[data.length - 1].cost : null
  const multiplier = finalCost ? (finalCost / monthly).toFixed(1) : null

  return (
    <div className="min-h-screen pt-24 px-4 pb-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
            Cost Simulator
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Project your cloud spend
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Model 12-quarter cost growth for any provider and growth scenario.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Controls */}
          <div
            className="lg:col-span-1 rounded-2xl p-6 space-y-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <label className="block text-xs font-semibold text-white mb-2">Monthly Spend ($)</label>
              <input
                type="number"
                value={monthly}
                min={100}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg text-sm text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-2">
                Annual Growth Rate: {growth}%
              </label>
              <input
                type="range"
                min={5}
                max={200}
                value={growth}
                onChange={(e) => setGrowth(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                <span>5%</span><span>200%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-2">Provider</label>
              <div className="grid grid-cols-3 gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className="py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: provider === p ? `${PROVIDER_COLORS[p]}22` : 'rgba(255,255,255,0.05)',
                      border: provider === p ? `1px solid ${PROVIDER_COLORS[p]}` : '1px solid transparent',
                      color: provider === p ? PROVIDER_COLORS[p] : '#a0a0b0',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={run}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              Run Projection
            </button>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 space-y-4">
            {data && finalCost ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: DollarSign, label: 'Current Monthly', value: `$${monthly.toLocaleString()}`, color: PROVIDER_COLORS[provider] },
                    { icon: TrendingUp, label: 'Year-3 Monthly', value: `$${finalCost.toLocaleString()}`, color: '#6366f1' },
                    { icon: AlertTriangle, label: 'Cost Multiplier', value: `${multiplier}×`, color: Number(multiplier) >= 5 ? '#ef4444' : '#f59e0b' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl p-4 text-center"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <stat.icon size={18} className="mx-auto mb-2" style={{ color: stat.color }} />
                      <div className="text-xl font-black text-white">{stat.value}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {Number(multiplier) >= 3 && (
                  <div
                    className="rounded-xl px-4 py-3 flex items-start gap-3 text-sm"
                    style={{
                      background: Number(multiplier) >= 5 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      border: `1px solid ${Number(multiplier) >= 5 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                    }}
                  >
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: Number(multiplier) >= 5 ? '#ef4444' : '#f59e0b' }} />
                    <span style={{ color: '#e2e8f0' }}>
                      At {growth}% annual growth, your {provider} costs will reach{' '}
                      <strong>${finalCost.toLocaleString()}/month</strong> in 3 years — a{' '}
                      <strong>{multiplier}× increase</strong>. Consider reserved instances or committed use discounts.
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div
                className="h-32 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Configure inputs and click Run Projection
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        {data && (
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">12-Quarter Cost Projection</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="quarter" tick={{ fill: '#a0a0b0', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#a0a0b0', fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={48} />
                <Tooltip
                  contentStyle={{ background: 'rgba(18,18,26,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Monthly Cost']}
                />
                <Line type="monotone" dataKey="cost" stroke={PROVIDER_COLORS[provider]} strokeWidth={2.5} dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
