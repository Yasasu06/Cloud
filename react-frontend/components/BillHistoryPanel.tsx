'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { AnalysisRecord } from '@/lib/billHistory'

const PROVIDER_COLOR: Record<string, string> = {
  AWS: '#f59e0b', Azure: '#0078D4', GCP: '#4285f4',
  DigitalOcean: '#0080ff', 'Oracle Cloud': '#c0392b', Oracle: '#c0392b', Cloud: '#818cf8',
}
const colorFor = (p: string) => PROVIDER_COLOR[p] ?? '#818cf8'

const money = (n: number) => '$' + Math.round(n).toLocaleString()
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const monthDay = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function BillHistoryPanel({ history }: { history: AnalysisRecord[] }) {
  if (history.length === 0) return null

  const recent = history.slice(0, 3)
  const hasTrend = history.length >= 2
  const latest = history[0]
  const prev = history[1]

  // Trend chart data: oldest → newest (recharts reads left-to-right)
  const chartData = [...history].slice(0, 8).reverse().map(r => ({
    date: shortDate(r.analyzed_at),
    total: r.total_amount,
    provider: r.provider,
  }))

  // Month-over-month comparison
  let comparison: { diff: number; pct: number; up: boolean; sameTop: boolean; top: string } | null = null
  if (hasTrend) {
    const diff = latest.total_amount - prev.total_amount
    const pct = prev.total_amount > 0 ? (diff / prev.total_amount) * 100 : 0
    comparison = {
      diff,
      pct,
      up: diff >= 0,
      sameTop: latest.top_service === prev.top_service,
      top: latest.top_service,
    }
  }

  return (
    <div style={{ marginTop: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.01em' }}>Previous Analyses</h2>
      <p style={{ color: '#777', fontSize: 13, marginBottom: 18 }}>
        Your bill analyzer remembers every upload — {history.length} saved.
      </p>

      {/* Comparison message (2+) or first-run nudge (1) */}
      {comparison ? (
        <div style={{
          padding: '16px 20px', borderRadius: 14, marginBottom: 18,
          background: comparison.up ? 'rgba(239,68,68,0.07)' : 'rgba(34,197,94,0.07)',
          border: `1px solid ${comparison.up ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        }}>
          <p style={{ fontSize: 14.5, fontWeight: 600, color: 'white', lineHeight: 1.55 }}>
            Your bill went <strong style={{ color: comparison.up ? '#ef4444' : '#22c55e' }}>
              {comparison.up ? 'up' : 'down'} {money(Math.abs(comparison.diff))} ({comparison.up ? '+' : '−'}{Math.abs(comparison.pct).toFixed(0)}%)
            </strong> vs last month.{' '}
            {comparison.sameTop
              ? <>{comparison.top} is still your top cost.</>
              : <>{comparison.top} is now your top cost.</>}
          </p>
        </div>
      ) : (
        <div style={{
          padding: '16px 20px', borderRadius: 14, marginBottom: 18,
          background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.22)',
          fontSize: 14, color: '#b4b4c4',
        }}>
          📈 Upload next month&apos;s bill to see your trend.
        </div>
      )}

      {/* Trend line (2+) */}
      {hasTrend && (
        <div className="glass-premium" style={{ padding: '18px 18px 8px', marginBottom: 18 }}>
          <p style={{ fontSize: 11, color: '#8a8a9c', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            TOTAL BILL OVER TIME
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 6, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#8a8a9c', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8a8a9c', fontSize: 11 }} axisLine={false} tickLine={false}
                width={56} tickFormatter={(v: number) => money(v)} />
              <Tooltip
                contentStyle={{ background: '#0d0d18', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#a0a0b0' }}
                formatter={(v: number, _n: string, p: { payload?: { provider?: string } }) => [money(v), p?.payload?.provider ?? 'Total']}
              />
              <Line type="monotone" dataKey="total" stroke="#818cf8" strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Last 3 analyses as compact cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {recent.map((r, i) => {
          const older = history[history.indexOf(r) + 1]
          const up = older ? r.total_amount >= older.total_amount : null
          return (
            <div key={r.id} className="glass-premium" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: colorFor(r.provider) }}>{r.provider}</span>
                <span style={{ fontSize: 11, color: '#777' }}>{monthDay(r.analyzed_at)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{money(r.total_amount)}</span>
                {up !== null && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: up ? '#ef4444' : '#22c55e' }}>
                    {up ? '▲' : '▼'}
                  </span>
                )}
                {i === 0 && <span style={{ fontSize: 9, fontWeight: 700, color: '#818cf8', background: 'rgba(99,102,241,0.15)', padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5 }}>LATEST</span>}
              </div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                Top: <span style={{ color: '#c0c0d0' }}>{r.top_service}</span>
              </div>
              <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>
                {money(r.savings_estimate)}/mo savings found
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
