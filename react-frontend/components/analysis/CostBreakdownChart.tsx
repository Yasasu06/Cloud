'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { CostBreakdownItem } from './types'

const DEFAULT_COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#06b6d4', '#ec4899']

interface TooltipPayload {
  payload: CostBreakdownItem
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div style={{ background: '#0d0d18', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ color: 'white', fontWeight: 700, marginBottom: 4 }}>{item.service}</div>
      <div style={{ color: '#a0a0b0' }}>Spend: <strong style={{ color: 'white' }}>${item.amount?.toLocaleString()}</strong></div>
      {typeof item.waste_estimate === 'number' && item.waste_estimate > 0 && (
        <div style={{ color: '#fca5a5' }}>Waste: <strong>${item.waste_estimate.toLocaleString()}</strong></div>
      )}
      {typeof item.percent === 'number' && (
        <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>{item.percent}% of total</div>
      )}
    </div>
  )
}

export default function CostBreakdownChart({ data }: { data: CostBreakdownItem[] }) {
  if (!data?.length) return null

  const chartData = data.map((d, i) => ({
    ...d,
    color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    healthy: Math.max(0, (d.amount || 0) - (d.waste_estimate || 0)),
    waste: d.waste_estimate || 0,
  }))

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, padding: '24px 20px 16px', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 8px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: 0 }}>Cost Breakdown by Service</h3>
        <div style={{ display: 'flex', gap: 14, fontSize: 11, color: '#a0a0b0' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, background: '#6366f1', borderRadius: 2 }} /> Spend
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: 2 }} /> Waste
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="service" tick={{ fill: '#666', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
          <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
          <Bar dataKey="healthy" stackId="a" radius={[0, 0, 0, 0]}>
            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
          <Bar dataKey="waste" stackId="a" fill="#ef4444" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
