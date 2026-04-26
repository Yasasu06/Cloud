'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { AI_GROWTH_DATA } from '@/lib/data'

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  return (
    <div
      className="rounded-xl p-4 text-sm"
      style={{
        background: 'rgba(18,18,26,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: item.color }}
          />
          <span style={{ color: item.color }}>{item.name}</span>
          <span className="text-white font-medium ml-auto pl-4">${item.value}B</span>
        </div>
      ))}
    </div>
  )
}

export default function AiGrowthChart() {
  return (
    <section className="py-20 px-4" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--accent)' }}
          >
            AI Revenue Growth
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            The AI cloud race
          </h2>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Quarterly AI/ML revenue by provider — Q1 2023 through Q4 2025
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={AI_GROWTH_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="quarter"
                tick={{ fill: '#a0a0b0', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: '#a0a0b0', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}B`}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '16px', fontSize: '13px', color: '#a0a0b0' }}
              />
              <Line
                type="monotone"
                dataKey="azure"
                name="Azure"
                stroke="#0078D4"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="aws"
                name="AWS"
                stroke="#FF9900"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="gcp"
                name="GCP"
                stroke="#34A853"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
          Revenue figures in USD billions. Source: company earnings releases and investor presentations.
        </p>
      </div>
    </section>
  )
}
