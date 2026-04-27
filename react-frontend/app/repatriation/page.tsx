'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/posthog'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface MonthData {
  month: string
  cloudMonthly: number
  hardwareMonthly: number
  cloudCumulative: number
  hardwareCumulative: number
  savings: number
}

function calculateRepatriation(
  monthlyCloudSpend: number,
  annualGrowthRate: number,
  hardwareCost: number,
  hardwareLifeYears: number,
): MonthData[] {
  const monthlyHardwareCost = hardwareCost / (hardwareLifeYears * 12)
  let cumulativeCloud = 0
  let cumulativeHardware = hardwareCost

  return Array.from({ length: 36 }, (_, i) => {
    const month = i + 1
    const monthlyCloud = monthlyCloudSpend * Math.pow(1 + annualGrowthRate / 100 / 12, month)
    cumulativeCloud += monthlyCloud
    const monthlyHardwareMaint = monthlyHardwareCost * 0.15
    cumulativeHardware += monthlyHardwareMaint

    return {
      month: `M${month}`,
      cloudMonthly: Math.round(monthlyCloud),
      hardwareMonthly: Math.round(monthlyHardwareCost + monthlyHardwareMaint),
      cloudCumulative: Math.round(cumulativeCloud),
      hardwareCumulative: Math.round(cumulativeHardware),
      savings: Math.round(cumulativeCloud - cumulativeHardware),
    }
  })
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1a1a2e',
  border: '1px solid #ffffff15',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'white',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
}

export default function RepatriationPage() {
  const router = useRouter()
  const [monthlySpend, setMonthlySpend] = useState(5000)
  const [growthRate, setGrowthRate] = useState(20)
  const [hardwareCost, setHardwareCost] = useState(50000)
  const [hardwareLife, setHardwareLife] = useState(5)
  const [analyzed, setAnalyzed] = useState(false)
  const [data, setData] = useState<MonthData[]>([])

  function analyze() {
    const result = calculateRepatriation(monthlySpend, growthRate, hardwareCost, hardwareLife)
    setData(result)
    setAnalyzed(true)
    trackEvent('repatriation_analyzed', { monthlySpend, growthRate })
  }

  const crossoverMonth = data.findIndex(d => d.savings > 0)
  const crossoverData = crossoverMonth >= 0 ? data[crossoverMonth] : null
  const finalSavings = data[data.length - 1]?.savings || 0

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 13,
            color: '#ef4444',
            fontWeight: 600,
            marginBottom: 16,
          }}>
            CLOUD EXIT ANALYZER
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Should you own your servers?
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 600 }}>
            At some point, cloud becomes more expensive than owning hardware.
            This tool tells you exactly when that happens for your business —
            and what to do about it.
          </p>
        </div>

        <div style={{
          background: '#1a1a2e',
          borderRadius: 16,
          padding: 28,
          border: '1px solid #ffffff08',
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Your Current Situation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div>
              <label style={{ color: '#a0a0b0', fontSize: 12, display: 'block', marginBottom: 8 }}>
                CURRENT MONTHLY CLOUD SPEND ($)
              </label>
              <input
                type="number"
                value={monthlySpend}
                onChange={e => setMonthlySpend(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ color: '#a0a0b0', fontSize: 12, display: 'block', marginBottom: 8 }}>
                EXPECTED ANNUAL GROWTH (%)
              </label>
              <input
                type="number"
                value={growthRate}
                onChange={e => setGrowthRate(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ color: '#a0a0b0', fontSize: 12, display: 'block', marginBottom: 8 }}>
                EQUIVALENT HARDWARE COST ($)
              </label>
              <input
                type="number"
                value={hardwareCost}
                onChange={e => setHardwareCost(Number(e.target.value))}
                style={inputStyle}
              />
              <p style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
                Cost to buy servers equivalent to your current cloud setup
              </p>
            </div>
            <div>
              <label style={{ color: '#a0a0b0', fontSize: 12, display: 'block', marginBottom: 8 }}>
                HARDWARE LIFESPAN (YEARS)
              </label>
              <input
                type="number"
                value={hardwareLife}
                onChange={e => setHardwareLife(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>

          <Button
            onClick={analyze}
            className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-3"
          >
            Analyze My Cloud Exit Point →
          </Button>
        </div>

        {analyzed && data.length > 0 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
              <div style={{
                background: '#1a1a2e',
                borderRadius: 12,
                padding: 24,
                borderTop: `3px solid ${crossoverMonth >= 0 ? '#ef4444' : '#22c55e'}`,
              }}>
                <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>CROSSOVER POINT</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: crossoverMonth >= 0 ? '#ef4444' : '#22c55e' }}>
                  {crossoverMonth >= 0 ? `Month ${crossoverMonth + 1}` : 'Never'}
                </div>
                <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                  {crossoverMonth >= 0 ? 'When hardware becomes cheaper' : 'Cloud stays cheaper for 3 years'}
                </div>
              </div>

              <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 24, borderTop: '3px solid #f59e0b' }}>
                <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>3-YEAR CLOUD SPEND</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>
                  ${(data[35]?.cloudCumulative || 0).toLocaleString()}
                </div>
                <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Total cumulative cost</div>
              </div>

              <div style={{
                background: '#1a1a2e',
                borderRadius: 12,
                padding: 24,
                borderTop: `3px solid ${finalSavings > 0 ? '#ef4444' : '#22c55e'}`,
              }}>
                <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>
                  {finalSavings > 0 ? 'HARDWARE SAVINGS' : 'CLOUD SAVINGS'}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: finalSavings > 0 ? '#ef4444' : '#22c55e' }}>
                  ${Math.abs(finalSavings).toLocaleString()}
                </div>
                <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Over 3 years</div>
              </div>
            </div>

            {crossoverMonth >= 0 && crossoverData && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
              }}>
                <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>
                  Repatriation Alert
                </div>
                <p style={{ color: '#e0e0e0', fontSize: 15 }}>
                  Based on your {growthRate}% annual growth rate, owning hardware becomes{' '}
                  <strong>cheaper than cloud at Month {crossoverMonth + 1}</strong>.
                  At that point your monthly cloud bill will be{' '}
                  <strong>${crossoverData.cloudMonthly.toLocaleString()}</strong>{' '}
                  vs <strong>${crossoverData.hardwareMonthly.toLocaleString()}</strong>{' '}
                  for equivalent owned hardware.
                </p>
              </div>
            )}

            <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Cumulative Cost Comparison — 36 Months</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="month" stroke="#a0a0b0" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#a0a0b0"
                    tick={{ fontSize: 11 }}
                    tickFormatter={v => `$${(Number(v) / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8 }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Legend />
                  {crossoverMonth >= 0 && (
                    <ReferenceLine
                      x={`M${crossoverMonth + 1}`}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{ value: 'Crossover', fill: '#ef4444', fontSize: 12 }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="cloudCumulative"
                    name="Cloud (Cumulative)"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="hardwareCumulative"
                    name="Hardware (Cumulative)"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #ffffff15',
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                {crossoverMonth >= 0 ? 'Ready to plan your cloud exit?' : 'Cloud is the right choice for now.'}
              </h3>
              <p style={{ color: '#a0a0b0', marginBottom: 16, fontSize: 14 }}>
                {crossoverMonth >= 0
                  ? 'Talk to our AI consultant about planning a hybrid or on-premise migration.'
                  : 'Your current spend level favors cloud. Revisit this analysis when your monthly bill exceeds $15,000.'}
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  onClick={() => router.push('/chat')}
                  className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold"
                >
                  Discuss With AI Consultant →
                </Button>
                <Button
                  onClick={() => router.push('/migration')}
                  variant="outline"
                  className="border-[#ffffff30] text-white hover:bg-[#ffffff10]"
                >
                  Plan Migration
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
