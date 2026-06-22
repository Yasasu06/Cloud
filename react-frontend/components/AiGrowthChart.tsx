'use client'

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CLOUD_SEGMENT_REVENUE, type QuarterlyRevenuePoint } from '@/lib/data'

interface TooltipPayloadItem {
  name: string
  value: number | [number, number]
  color: string
  dataKey?: string
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
      {payload.map((item) => {
        const formatted = Array.isArray(item.value)
          ? `$${item.value[0]}B – $${item.value[1]}B`
          : `$${item.value}B`
        return (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: item.color }}
            />
            <span style={{ color: item.color }}>{item.name}</span>
            <span className="text-white font-medium ml-auto pl-4">{formatted}</span>
          </div>
        )
      })}
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
            Cloud Segment Revenue
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Total cloud segment revenue, quarterly
          </h2>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            AWS and Google Cloud are reported segment figures. Azure is rendered as a
            shaded uncertainty range — Microsoft does not disclose an Azure dollar figure,
            so the band reflects the plausible interval around a modeled estimate.
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
            <ComposedChart data={CLOUD_SEGMENT_REVENUE} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
              <Area
                type="monotone"
                dataKey={(d: QuarterlyRevenuePoint) =>
                  d.azureLow != null && d.azureHigh != null
                    ? [d.azureLow, d.azureHigh]
                    : [null, null]
                }
                name="Azure (estimated range)"
                stroke="#0078D4"
                strokeWidth={1.5}
                strokeOpacity={0.7}
                fill="#0078D4"
                fillOpacity={0.22}
                activeDot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="aws"
                name="AWS (reported)"
                stroke="#FF9900"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="gcp"
                name="Google Cloud (reported)"
                stroke="#34A853"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
          USD billions. AWS from Amazon 8-K segment sales; Google Cloud from Alphabet 8-K
          segment-results table. The Azure band visualizes uncertainty in the absence of a
          disclosed dollar figure: width reflects &quot;Azure and other cloud services&quot; bundling
          and Microsoft&apos;s 2025 re-scoping of what counts as Azure (AI-inference inclusion
          plus an accounting-estimate change).
        </p>
      </div>
    </section>
  )
}
