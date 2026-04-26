'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useJourney } from '@/lib/journeyContext'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const PROVIDER_COLORS: Record<string, string> = {
  AWS: '#FF9900',
  Azure: '#0078D4',
  GCP: '#34A853',
  DigitalOcean: '#0080FF',
  Oracle: '#F80000',
  Vultr: '#007BFC',
}

// Journey context stores full provider names; map them to PROVIDER_COLORS keys
const PROVIDER_NAME_TO_KEY: Record<string, string> = {
  'Amazon Web Services': 'AWS',
  'Microsoft Azure': 'Azure',
  'Google Cloud Platform': 'GCP',
}

const MARKET_FORECAST_DATA = [
  { quarter: 'Q1 2024', AWS: 25.0, Azure: 35.1, GCP: 9.4 },
  { quarter: 'Q2 2024', AWS: 26.3, Azure: 36.8, GCP: 10.3 },
  { quarter: 'Q3 2024', AWS: 27.5, Azure: 38.9, GCP: 11.4 },
  { quarter: 'Q4 2024', AWS: 28.8, Azure: 40.9, GCP: 11.4 },
  { quarter: 'Q1 2025', AWS: 29.3, Azure: 42.4, GCP: 12.3 },
  { quarter: 'Q2 2025', AWS: 30.5, Azure: 44.5, GCP: 13.1 },
  { quarter: 'Q3 2025', AWS: 32.0, Azure: 47.3, GCP: 14.1 },
  { quarter: 'Q4 2025', AWS: 33.8, Azure: 49.4, GCP: 14.9 },
  { quarter: 'Q1 2026*', AWS: 35.2, Azure: 52.1, GCP: 15.9 },
  { quarter: 'Q2 2026*', AWS: 36.8, Azure: 55.2, GCP: 17.0 },
  { quarter: 'Q3 2026*', AWS: 38.5, Azure: 58.6, GCP: 18.2 },
  { quarter: 'Q4 2026*', AWS: 40.3, Azure: 62.3, GCP: 19.5 },
]

const FORECAST_INSIGHTS = [
  { name: 'AWS', color: '#FF9900', insight: 'Slowing growth but maintaining massive scale. Still the safe enterprise choice.' },
  { name: 'Azure', color: '#0078D4', insight: 'Fastest growing major provider. AI momentum from OpenAI partnership driving acceleration.' },
  { name: 'GCP', color: '#34A853', insight: 'Strong AI/ML growth. Gemini integration accelerating enterprise adoption.' },
]

interface CostPoint {
  month: string
  cost: number
  provider: string
}

function generateCostData(baseSpend: number, growthMultiplier: number, provider: string): CostPoint[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1
    const scale = 1 + (growthMultiplier - 1) * (m / 12)
    return { month: `Month ${m}`, cost: Math.round(baseSpend * scale), provider }
  })
}

export default function PlannerPage() {
  const { journey } = useJourney()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'forecast' | 'costs'>('forecast')

  const [spend, setSpend] = useState(5000)
  const [growth, setGrowth] = useState(5)
  const [provider, setProvider] = useState('AWS')
  const [calculated, setCalculated] = useState(false)
  const [costData, setCostData] = useState<CostPoint[]>([])

  useEffect(() => {
    if (!journey?.recommendedProvider) return
    const key = PROVIDER_NAME_TO_KEY[journey.recommendedProvider] || journey.recommendedProvider
    if (PROVIDER_COLORS[key]) setProvider(key)
    setActiveTab('costs')
  }, [journey])

  function calculate() {
    setCostData(generateCostData(spend, growth, provider))
    setCalculated(true)
  }

  const finalCost = costData[costData.length - 1]?.cost ?? 0
  const providerColor = PROVIDER_COLORS[provider] || '#6366f1'

  const journeyKey = journey
    ? (PROVIDER_NAME_TO_KEY[journey.recommendedProvider] || journey.recommendedProvider)
    : null
  const journeyColor = journeyKey ? (PROVIDER_COLORS[journeyKey] || '#6366f1') : '#6366f1'

  function tabStyle(tab: string): React.CSSProperties {
    return {
      padding: '12px 32px',
      border: 'none',
      borderRadius: 10,
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: 15,
      background: activeTab === tab ? '#6366f1' : 'transparent',
      color: activeTab === tab ? 'white' : '#a0a0b0',
      transition: 'all 0.2s',
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>📊 Cloud Planner</h1>
          <p style={{ color: '#a0a0b0', fontSize: 16 }}>
            Market forecasts and personal cost projections — in one place.
          </p>
        </div>

        {/* Journey context banner */}
        {journey && (
          <div style={{
            background: '#1a1a2e',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            borderLeft: `4px solid ${journeyColor}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <div>
              <div style={{ fontSize: 12, color: '#a0a0b0' }}>FROM YOUR CLOUD ADVISOR</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>
                {journey.recommendedProvider} recommended · {journey.confidence}% match
              </div>
            </div>
            <div style={{ color: '#a0a0b0', fontSize: 13 }}>
              {journey.teamSize} · {journey.workload}
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: '#12121a',
          borderRadius: 12,
          padding: 4,
          marginBottom: 40,
          width: 'fit-content',
        }}>
          <button style={tabStyle('forecast')} onClick={() => setActiveTab('forecast')}>
            🌍 Market Forecast
          </button>
          <button style={tabStyle('costs')} onClick={() => setActiveTab('costs')}>
            💰 My Cost Planner
          </button>
        </div>

        {/* ── FORECAST TAB ── */}
        {activeTab === 'forecast' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Cloud Revenue Forecast — 2024 to 2026
            </h2>
            <p style={{ color: '#a0a0b0', marginBottom: 8 }}>
              Quarterly revenue ($B) based on historical data and growth projections. * = projected.
            </p>
            <div style={{ background: '#12121a', borderRadius: 8, padding: '8px 0', marginBottom: 24, display: 'inline-block' }}>
              <span style={{ color: '#f59e0b', fontSize: 13, padding: '4px 12px' }}>
                ⚡ Azure is projected to maintain its lead over AWS through 2026
              </span>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={MARKET_FORECAST_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="quarter" stroke="#a0a0b0" tick={{ fontSize: 11 }} />
                <YAxis stroke="#a0a0b0" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8 }}
                  formatter={(value: number) => [`$${value}B`, '']}
                />
                <Legend />
                <Line type="monotone" dataKey="AWS" stroke="#FF9900" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Azure" stroke="#0078D4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="GCP" stroke="#34A853" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 32 }}>
              {FORECAST_INSIGHTS.map((p) => (
                <div key={p.name} style={{ background: '#1a1a2e', borderRadius: 12, padding: 20, borderTop: `3px solid ${p.color}` }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: p.color }}>{p.name}</div>
                  <p style={{ color: '#a0a0b0', fontSize: 13, lineHeight: 1.6 }}>{p.insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COSTS TAB ── */}
        {activeTab === 'costs' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
              What happens to your bill as you grow?
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
              <div>
                <label style={{ color: '#a0a0b0', fontSize: 13, display: 'block', marginBottom: 8 }}>
                  CURRENT MONTHLY SPEND
                </label>
                <input
                  type="number"
                  value={spend}
                  onChange={(e) => setSpend(Number(e.target.value))}
                  style={{ width: '100%', background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8, padding: '12px 16px', color: 'white', fontSize: 16 }}
                />
              </div>
              <div>
                <label style={{ color: '#a0a0b0', fontSize: 13, display: 'block', marginBottom: 8 }}>
                  GROWTH SCENARIO
                </label>
                <select
                  value={growth}
                  onChange={(e) => setGrowth(Number(e.target.value))}
                  style={{ width: '100%', background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8, padding: '12px 16px', color: 'white', fontSize: 16 }}
                >
                  <option value={2}>2x growth</option>
                  <option value={5}>5x growth</option>
                  <option value={10}>10x growth</option>
                  <option value={20}>20x growth</option>
                  <option value={50}>50x growth</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#a0a0b0', fontSize: 13, display: 'block', marginBottom: 8 }}>
                  CLOUD PROVIDER
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  style={{ width: '100%', background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8, padding: '12px 16px', color: 'white', fontSize: 16 }}
                >
                  {Object.keys(PROVIDER_COLORS).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={calculate}
              style={{ background: providerColor, color: 'white', border: 'none', borderRadius: 12, padding: '14px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 32 }}
            >
              Calculate Cost Projection →
            </button>

            {calculated && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
                  <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                    <div style={{ color: '#a0a0b0', fontSize: 12, marginBottom: 8 }}>CURRENT MONTHLY</div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>${spend.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 20, textAlign: 'center', borderTop: `3px solid ${providerColor}` }}>
                    <div style={{ color: '#a0a0b0', fontSize: 12, marginBottom: 8 }}>PROJECTED MONTHLY</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: providerColor }}>${finalCost.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                    <div style={{ color: '#a0a0b0', fontSize: 12, marginBottom: 8 }}>ANNUAL INCREASE</div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>${((finalCost - spend) * 12).toLocaleString()}</div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="month" stroke="#a0a0b0" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#a0a0b0" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8 }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monthly Cost']}
                    />
                    <Bar dataKey="cost" fill={providerColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div style={{ marginTop: 24, background: '#1a1a2e', borderRadius: 12, padding: 20, borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>💡 Cost Planning Insight</div>
                  <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.6 }}>
                    At {growth}x growth, your annual {provider} spend goes from{' '}
                    <strong style={{ color: 'white' }}>${(spend * 12).toLocaleString()}/year</strong> to{' '}
                    <strong style={{ color: providerColor }}>${(finalCost * 12).toLocaleString()}/year</strong>.
                    Make sure your pricing model accounts for this before you scale.
                  </p>
                </div>

                <div style={{ marginTop: 24, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 16, padding: 24, border: '1px solid #ffffff15' }}>
                  <div style={{ fontSize: 13, color: '#a0a0b0', marginBottom: 8 }}>NEXT STEP</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                    Planning a migration or starting fresh?
                  </h3>
                  <p style={{ color: '#a0a0b0', marginBottom: 16, fontSize: 14 }}>
                    See how complex your migration would be and get a step-by-step timeline.
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
