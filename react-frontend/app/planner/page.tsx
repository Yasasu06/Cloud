'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useJourney } from '@/lib/journeyContext'
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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
  const [spend, setSpend] = useState(5000)
  const [growth, setGrowth] = useState(5)
  const [provider, setProvider] = useState('AWS')
  const [calculated, setCalculated] = useState(false)
  const [costData, setCostData] = useState<CostPoint[]>([])
  const [aiInsight, setAiInsight] = useState('')

  useEffect(() => {
    if (!journey?.recommendedProvider) return
    const key = PROVIDER_NAME_TO_KEY[journey.recommendedProvider] || journey.recommendedProvider
    if (PROVIDER_COLORS[key]) setProvider(key)
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

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>💰 Cost Planner</h1>
          <p style={{ color: '#a0a0b0', fontSize: 16 }}>
            See exactly what your cloud bill looks like as you grow — and where you can optimize right now.
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

                <div style={{ minHeight: 250 }}>
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
                </div>

                <div style={{ marginTop: 24 }}>
                  <button
                    onClick={async () => {
                      setAiInsight('loading')
                      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
                        },
                        body: JSON.stringify({
                          model: 'llama-3.3-70b-versatile',
                          max_tokens: 300,
                          messages: [{
                            role: 'user',
                            content: `A company spends $${spend}/month on ${provider} cloud and is projected to grow ${growth}x over 12 months, reaching $${finalCost}/month. In 3 plain English sentences: 1) Is this growth rate typical or alarming? 2) What is the most important cost optimization they should do right now? 3) At what spend level should they consider reserved instances or committed use discounts?`,
                          }],
                        }),
                      })
                      const data = await res.json()
                      setAiInsight(data.choices?.[0]?.message?.content || '')
                    }}
                    style={{
                      background: '#6366f1',
                      color: 'white',
                      border: 'none',
                      borderRadius: 12,
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginBottom: 16,
                    }}
                  >
                    🤖 Get AI Cost Insight →
                  </button>

                  {aiInsight && aiInsight !== 'loading' && (
                    <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 20, borderLeft: '4px solid #6366f1' }}>
                      <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, marginBottom: 8 }}>AI COST ANALYSIS</div>
                      <p style={{ color: '#e0e0e0', fontSize: 14, lineHeight: 1.7 }}>{aiInsight}</p>
                    </div>
                  )}

                  {aiInsight === 'loading' && (
                    <p style={{ color: '#a0a0b0', fontSize: 14 }}>Analyzing your cost trajectory...</p>
                  )}
                </div>

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
      </div>
    </div>
  )
}
