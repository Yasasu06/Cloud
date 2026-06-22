'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export interface CapexRatioPoint {
  quarter: string
  msft: number
  amzn: number
  googl: number
}

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
      style={{
        background: 'rgba(0,0,0,0.9)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 13,
        color: 'white',
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map((item) => (
        <div
          key={item.name}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 4,
              background: item.color,
            }}
          />
          <span style={{ color: item.color }}>{item.name}</span>
          <span style={{ marginLeft: 'auto', paddingLeft: 16, fontWeight: 600 }}>
            {item.value.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CapexChart({ data }: { data: CapexRatioPoint[] }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 700,
        margin: '0 auto',
        padding: 28,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
      }}
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="quarter"
            tick={{ fill: '#a0a0b0', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            angle={-30}
            textAnchor="end"
            height={50}
            interval={0}
          />
          <YAxis
            domain={[0, 180]}
            tick={{ fill: '#a0a0b0', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
            label={{
              value: 'Capex / Revenue (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#a0a0b0', fontSize: 12, textAnchor: 'middle' },
              offset: 12,
            }}
            width={64}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 12, fontSize: 13, color: '#a0a0b0' }}
          />
          <Line
            type="monotone"
            dataKey="msft"
            name="MSFT"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="amzn"
            name="AMZN"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="googl"
            name="GOOGL"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
