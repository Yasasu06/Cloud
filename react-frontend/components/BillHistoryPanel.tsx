'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { AnalysisRecord } from '@/lib/billHistory'

const PROVIDER_COLOR: Record<string, string> = {
  AWS: '#D97706', Azure: '#0078D4', GCP: '#4285f4',
  DigitalOcean: '#0080ff', 'Oracle Cloud': '#c0392b', Oracle: '#c0392b', Cloud: '#2563EB',
}
const colorFor = (p: string) => PROVIDER_COLOR[p] ?? '#2563EB'

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
      <h2 className="serif" style={{ fontSize: 22, marginBottom: 4, letterSpacing: '-0.01em', color: 'var(--text)' }}>Previous Analyses</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 18 }}>
        Your bill analyzer remembers every upload — {history.length} saved.
      </p>

      {/* Comparison message (2+) or first-run nudge (1) */}
      {comparison ? (
        <div style={{
          padding: '16px 20px', borderRadius: 14, marginBottom: 18,
          background: comparison.up ? 'rgba(220,38,38,0.05)' : 'rgba(22,163,74,0.05)',
          border: `1px solid ${comparison.up ? 'rgba(220,38,38,0.25)' : 'rgba(22,163,74,0.25)'}`,
        }}>
          <p style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--text)', lineHeight: 1.55 }}>
            Your bill went <strong style={{ color: comparison.up ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
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
          background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.2)',
          fontSize: 14, color: 'var(--text-muted)',
        }}>
          📈 Upload next month&apos;s bill to see your trend.
        </div>
      )}

      {/* Trend line (2+) */}
      {hasTrend && (
        <div className="edi-card" style={{ padding: '18px 18px 8px', marginBottom: 18 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            TOTAL BILL OVER TIME
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 6, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="rgba(10,10,10,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#9A9A95', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9A9A95', fontSize: 11 }} axisLine={false} tickLine={false}
                width={56} tickFormatter={(v: number) => money(v)} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: 10, fontSize: 12, color: '#0A0A0A' }}
                labelStyle={{ color: '#6B6B6B' }}
                formatter={(v: number, _n: string, p: { payload?: { provider?: string } }) => [money(v), p?.payload?.provider ?? 'Total']}
              />
              <Line type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2.5}
                dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 6 }} />
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
            <div key={r.id} className="edi-card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: colorFor(r.provider) }}>{r.provider}</span>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{monthDay(r.analyzed_at)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{money(r.total_amount)}</span>
                {up !== null && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: up ? 'var(--red)' : 'var(--green)' }}>
                    {up ? '▲' : '▼'}
                  </span>
                )}
                {i === 0 && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--blue)', background: 'rgba(37,99,235,0.1)', padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5 }}>LATEST</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                Top: <span style={{ color: 'var(--text)' }}>{r.top_service}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
                {money(r.savings_estimate)}/mo savings found
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
