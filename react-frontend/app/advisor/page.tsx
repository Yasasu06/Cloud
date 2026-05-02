'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useJourney } from '@/lib/journeyContext'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/posthog'
import JourneyProgress from '@/components/JourneyProgress'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import NextActionCards from '@/components/NextActionCards'

const INDUSTRIES = [
  { id: 'healthcare', label: '🏥 Healthcare / Medical', compliance: ['HIPAA', 'HITECH'] },
  { id: 'fintech', label: '🏦 Finance / Fintech', compliance: ['PCI DSS', 'SOX'] },
  { id: 'saas', label: '💻 SaaS / Software', compliance: ['SOC 2'] },
  { id: 'ecommerce', label: '🛍️ E-commerce / Retail', compliance: ['PCI DSS'] },
  { id: 'gaming', label: '🎮 Gaming', compliance: [] },
  { id: 'ai_ml', label: '🤖 AI / Machine Learning', compliance: [] },
  { id: 'government', label: '🏛️ Government / Public Sector', compliance: ['FedRAMP'] },
  { id: 'education', label: '🎓 Education', compliance: ['FERPA'] },
  { id: 'startup', label: '🚀 Early Stage Startup', compliance: [] },
  { id: 'enterprise', label: '🏢 Enterprise / Large Business', compliance: [] },
]

const CLOUD_PROVIDERS = ['AWS', 'Azure', 'Google Cloud', 'Not on cloud yet', 'Multiple clouds']

const SPEND_RANGES = [
  { id: 'free', label: '$0 — Using free tiers only' },
  { id: 'under500', label: 'Under $500/month' },
  { id: '500_2k', label: '$500 – $2,000/month' },
  { id: '2k_10k', label: '$2,000 – $10,000/month' },
  { id: '10k_50k', label: '$10,000 – $50,000/month' },
  { id: 'over50k', label: 'Over $50,000/month' },
]

const TEAM_SIZES = [
  { id: 'solo', label: 'Just me' },
  { id: 'small', label: '2–10 people' },
  { id: 'medium', label: '11–50 people' },
  { id: 'large', label: '51–200 people' },
  { id: 'enterprise', label: '200+ people' },
]

const MAIN_PROBLEMS = [
  { id: 'bill_shock', label: "😱 Unexpected bill spikes I can't explain" },
  { id: 'waste', label: "🗑️ Pretty sure I'm wasting money but don't know where" },
  { id: 'choosing', label: '🤔 Not sure which cloud to use for my project' },
  { id: 'migration', label: '🔄 Want to switch or add a cloud provider' },
  { id: 'compliance', label: '🛡️ Need to meet compliance requirements' },
  { id: 'scaling', label: '📈 Costs growing faster than my revenue' },
  { id: 'starting', label: '🌱 Just getting started with cloud' },
  { id: 'optimization', label: '⚡ Want to optimize what I already have' },
]

interface Answers {
  industry: string
  currentCloud: string
  monthlySpend: string
  teamSize: string
  mainProblem: string
}

interface Alternative {
  provider: string
  score: number
  reason: string
}

interface RecommendationResult {
  provider: string
  confidence: number
  headline: string
  reasons: string[]
  services: string[]
  monthlyEstimate: string
  compliance: string[]
  warning: string
  nextStep: string
  alternatives?: Alternative[]
}

function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    AWS: '#FF9900',
    Azure: '#0078D4',
    GCP: '#34A853',
    'Google Cloud': '#34A853',
    DigitalOcean: '#0080FF',
    'Oracle Cloud': '#F80000',
  }
  return colors[provider] || '#6366f1'
}

const EMPTY_ANSWERS: Answers = {
  industry: '',
  currentCloud: '',
  monthlySpend: '',
  teamSize: '',
  mainProblem: '',
}

export default function AdvisorPage() {
  const router = useRouter()
  const { setJourney } = useJourney()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS)
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const totalSteps = 5
  const progress = Math.round(((step + 1) / totalSteps) * 100)

  function selectAnswer(field: keyof Answers, value: string) {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  function reset() {
    setResult(null)
    setStep(0)
    setAnswers(EMPTY_ANSWERS)
  }

  async function generateRecommendation(finalAnswers: Answers) {
    setLoading(true)

    const industry = INDUSTRIES.find(i => i.id === finalAnswers.industry)
    const compliance = industry?.compliance || []

    const prompt = `Based on these answers, give a specific cloud recommendation:

Industry: ${industry?.label || finalAnswers.industry}
Current cloud: ${finalAnswers.currentCloud}
Monthly spend: ${finalAnswers.monthlySpend}
Team size: ${finalAnswers.teamSize}
Main problem: ${finalAnswers.mainProblem}
Compliance needs: ${compliance.join(', ') || 'None identified'}

Respond with ONLY a JSON object in this exact format, no other text:
{
  "provider": "AWS" or "Azure" or "GCP" or "DigitalOcean" or "Oracle Cloud",
  "confidence": number between 60-95,
  "headline": "one sentence explaining the recommendation",
  "reasons": ["specific reason 1", "specific reason 2", "specific reason 3"],
  "services": ["specific service 1 with cost estimate", "specific service 2", "specific service 3"],
  "monthlyEstimate": "realistic monthly cost range like $400-$800/month",
  "compliance": ["compliance item 1 if applicable"],
  "warning": "one honest warning about this choice",
  "nextStep": "the single most important thing to do first",
  "alternatives": [
    {"provider": "second best provider name", "score": 75, "reason": "one short phrase why it's second"},
    {"provider": "third best provider name", "score": 65, "reason": "one short phrase why it's third"}
  ]
}`

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 800,
          messages: [
            {
              role: 'system',
              content: `You are a cloud architect. Always respond with valid JSON only. No markdown, no explanation, just the JSON object.

ALTERNATIVE PROVIDERS: Consider alternatives equally — DigitalOcean, Hetzner, Cloudflare, Linode, Vultr, Render, Railway. For startups spending under $2k/month, DigitalOcean or Render is often a better fit than AWS/Azure/GCP. For EU + cost-sensitive workloads, recommend Hetzner. For edge + zero-egress, recommend Cloudflare. Don't default to AWS just because it's the default — score by actual fit.`,
            },
            { role: 'user', content: prompt },
          ],
        }),
      })
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || '{}'
      const parsed: RecommendationResult = JSON.parse(text.replace(/```json|```/g, '').trim())
      setResult(parsed)

      setJourney({
        recommendedProvider: parsed.provider,
        providerColor: getProviderColor(parsed.provider),
        monthlyBudget: finalAnswers.monthlySpend,
        teamSize: finalAnswers.teamSize,
        workload: finalAnswers.industry,
        confidence: parsed.confidence,
      })

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.from('saved_recommendations').insert({
          user_id: session.user.id,
          provider: parsed.provider,
          confidence: parsed.confidence,
          workload: finalAnswers.industry,
          team_size: finalAnswers.teamSize,
          budget: finalAnswers.monthlySpend,
        })
      }

      trackEvent('recommendation_completed', {
        provider: parsed.provider,
        confidence: parsed.confidence,
        industry: finalAnswers.industry,
      })
    } catch {
      setResult({
        provider: 'AWS',
        confidence: 75,
        headline: 'AWS is the safe default choice for most use cases',
        reasons: ['Largest ecosystem', 'Most documentation', 'Best free tier'],
        services: ['EC2 for compute', 'S3 for storage', 'RDS for database'],
        monthlyEstimate: '$200–$500/month to start',
        compliance: [],
        warning: 'Costs can grow quickly — set up billing alerts immediately',
        nextStep: 'Create an AWS account and enable Cost Explorer',
      })
    } finally {
      setLoading(false)
    }
  }

  const cardStyle = (selected: boolean): React.CSSProperties => ({
    background: selected ? '#1e3a5f' : '#1a1a2e',
    border: `2px solid ${selected ? '#6366f1' : '#ffffff10'}`,
    borderRadius: 12,
    padding: '16px 20px',
    cursor: 'pointer',
    color: selected ? 'white' : '#a0a0b0',
    textAlign: 'left',
    fontSize: 14,
    fontWeight: selected ? 600 : 400,
    transition: 'all 0.15s',
    width: '100%',
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
        <JourneyProgress currentStep={0} />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 60px' }}>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4 } 50% { opacity: 1 } }`}</style>
          <div className="ai-loading" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 12, marginBottom: 16 }}>
            <div className="pulse-ring" style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
            <span style={{ color: '#a0a0b0', fontSize: 14 }}>AI is analyzing your situation...</span>
            <span style={{ color: '#555', fontSize: 12, marginLeft: 'auto', whiteSpace: 'nowrap' }}>Usually takes 15–30 seconds</span>
          </div>
          <div style={{ background: '#111118', borderRadius: 16, padding: 28, border: '1px solid rgba(255,255,255,0.06)' }}>
            {[90, 75, 85, 60, 70, 50].map((w, i) => (
              <div key={i} className="ai-shimmer" style={{ height: 16, marginBottom: 12, width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
        <JourneyProgress currentStep={0} />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 60px' }}>
          <DisclaimerBanner />

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>YOUR CLOUD RECOMMENDATION</div>
            <div style={{
              background: '#1a1a2e',
              borderRadius: 20,
              padding: 32,
              borderLeft: `6px solid ${getProviderColor(result.provider)}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: getProviderColor(result.provider), marginBottom: 8 }}>
                    {result.provider}
                  </div>
                  <div style={{ color: '#22c55e', fontSize: 14, fontWeight: 600 }}>
                    {result.confidence}% match for your situation
                  </div>
                </div>
                <div style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 12,
                  padding: '8px 16px',
                  textAlign: 'center',
                }}>
                  <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 16 }}>{result.monthlyEstimate}</div>
                  <div style={{ color: '#666', fontSize: 11 }}>estimated start</div>
                </div>
              </div>
              <p style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 1.6, marginBottom: 0 }}>{result.headline}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 600, marginBottom: 12 }}>WHY THIS FITS YOU</div>
              {result.reasons?.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 14, color: '#e0e0e0' }}>
                  <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
                  {r}
                </div>
              ))}
            </div>
            <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 600, marginBottom: 12 }}>SERVICES YOU WILL USE</div>
              {result.services?.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 14, color: '#e0e0e0' }}>
                  <span style={{ color: '#FF9900', flexShrink: 0 }}>→</span>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {result.compliance?.length > 0 && (
            <div style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 600, marginBottom: 8 }}>
                COMPLIANCE REQUIREMENTS FOR YOUR INDUSTRY
              </div>
              {result.compliance.map((c, i) => (
                <div key={i} style={{ color: '#e0e0e0', fontSize: 14, marginBottom: 4 }}>✓ {c}</div>
              ))}
            </div>
          )}

          <div style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600, marginBottom: 8 }}>⚠️ HONEST WARNING</div>
            <p style={{ color: '#e0e0e0', fontSize: 14, lineHeight: 1.6 }}>{result.warning}</p>
          </div>

          <div style={{
            background: '#1a1a2e',
            borderRadius: 16,
            padding: 24,
            marginBottom: 32,
            borderLeft: '4px solid #22c55e',
          }}>
            <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, marginBottom: 8 }}>YOUR FIRST STEP</div>
            <p style={{ color: '#e0e0e0', fontSize: 15, lineHeight: 1.6 }}>{result.nextStep}</p>
          </div>

          {/* 30-Day Action Plan */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
              YOUR 30-DAY ACTION PLAN
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {[
                { week: 'Week 1', desc: 'Account setup and basic configuration', icon: '🏗️' },
                { week: 'Week 2', desc: 'Deploy first service and set billing alerts', icon: '🚀' },
                { week: 'Week 3', desc: 'Security baseline and access controls', icon: '🛡️' },
                { week: 'Week 4', desc: 'Performance review and cost optimization', icon: '📊' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: '#1a1a2e',
                  borderRadius: 12,
                  padding: '16px 18px',
                  borderTop: `3px solid ${getProviderColor(result.provider)}`,
                }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>
                    {item.week.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Compare Alternatives */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
                COMPARE ALTERNATIVES
              </div>
              <div style={{ background: '#1a1a2e', borderRadius: 16, overflow: 'hidden', border: '1px solid #ffffff08' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr', background: '#0d0d18' }}>
                  <div style={{ padding: '12px 16px' }} />
                  {[
                    { provider: result.provider, score: result.confidence, note: result.reasons?.[0] || '' },
                    ...result.alternatives.slice(0, 2),
                  ].map((col, i) => (
                    <div key={i} style={{
                      padding: '12px 14px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: i === 0 ? getProviderColor(result.provider) : '#a0a0b0',
                      borderLeft: '1px solid #ffffff08',
                    }}>
                      {i === 0 ? `★ ${col.provider}` : col.provider}
                    </div>
                  ))}
                </div>
                {/* Score row */}
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr', borderTop: '1px solid #ffffff08' }}>
                  <div style={{ padding: '12px 16px', fontSize: 12, color: '#a0a0b0' }}>Match</div>
                  {[
                    { provider: result.provider, score: result.confidence, note: result.reasons?.[0] || '' },
                    ...result.alternatives.slice(0, 2),
                  ].map((col, i) => (
                    <div key={i} style={{
                      padding: '12px 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: i === 0 ? '#22c55e' : '#a0a0b0',
                      borderLeft: '1px solid #ffffff08',
                    }}>
                      {col.score}%
                    </div>
                  ))}
                </div>
                {/* Strength row */}
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr', borderTop: '1px solid #ffffff08' }}>
                  <div style={{ padding: '12px 16px', fontSize: 12, color: '#a0a0b0' }}>Strength</div>
                  {[
                    { provider: result.provider, score: result.confidence, note: result.reasons?.[0] || '' },
                    ...result.alternatives.slice(0, 2).map(a => ({ ...a, note: a.reason })),
                  ].map((col, i) => (
                    <div key={i} style={{
                      padding: '12px 14px',
                      fontSize: 12,
                      color: '#e0e0e0',
                      lineHeight: 1.4,
                      borderLeft: '1px solid #ffffff08',
                    }}>
                      {col.note}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 24, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #333' }}>
            <p style={{ color: '#555', fontSize: 11, margin: 0 }}>
              ℹ️ Recommendations are based on published cloud provider pricing and industry benchmarks. Actual savings may vary. Always verify recommendations with your cloud provider before making changes to production infrastructure.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/planner')}
              style={{
                background: getProviderColor(result.provider),
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Estimate My Costs →
            </button>
            <button
              onClick={() => router.push('/roadmap')}
              style={{ background: 'transparent', color: 'white', border: '1px solid #ffffff30', borderRadius: 12, padding: '14px 28px', fontSize: 15, cursor: 'pointer' }}
            >
              Get My 8-Week Plan
            </button>
            <button
              onClick={() => router.push('/chat')}
              style={{ background: 'transparent', color: 'white', border: '1px solid #ffffff30', borderRadius: 12, padding: '14px 28px', fontSize: 15, cursor: 'pointer' }}
            >
              Ask AI Questions
            </button>
            <button
              onClick={reset}
              style={{ background: 'transparent', color: '#666', border: '1px solid #ffffff15', borderRadius: 12, padding: '14px 28px', fontSize: 15, cursor: 'pointer' }}
            >
              Start Over
            </button>
          </div>

          <div style={{ marginTop: 32 }}>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>WHAT&apos;S NEXT</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => router.push('/planner')}>💰 Estimate My Costs</button>
              <button className="btn-secondary" onClick={() => router.push('/chat')}>💬 Ask AI Questions</button>
              <button className="btn-secondary" onClick={() => router.push('/report-card')}>📊 Grade My Setup</button>
            </div>
          </div>

          <NextActionCards actions={[
            { icon: '🛠️', title: 'Implementation Plan', desc: '12-week visual journey',  href: '/outcome-simulator' },
            { icon: '💰', title: 'Estimate Costs',      desc: 'Live pricing for stack',    href: '/cost-intelligence' },
            { icon: '✓',  title: 'Validate Choice',     desc: 'Pre-decision sanity check', href: '/sanity-check' },
          ]} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <JourneyProgress currentStep={0} />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '100px 24px 60px' }}>

        {/* Trust bar */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
          {['🔒 Vendor Neutral', '📊 Real pricing data', '⚡ Powered by Llama 3.3 70B', '🌍 Covers 12+ providers'].map(item => (
            <span key={item} style={{ color: '#666', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>{item}</span>
          ))}
        </div>

        <div style={{ position: 'relative', marginBottom: 8 }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                background: 'transparent',
                border: '1px solid #ffffff20',
                borderRadius: 8,
                padding: '8px 16px',
                color: '#a0a0b0',
                cursor: 'pointer',
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={reset}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: 13,
              textDecoration: 'underline',
            }}
          >
            Start Over
          </button>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#a0a0b0', fontSize: 13 }}>Question {step + 1} of {totalSteps}</span>
            <span style={{ color: '#6366f1', fontSize: 13, fontWeight: 600 }}>{progress}% complete</span>
          </div>
          <div style={{ background: '#1a1a2e', borderRadius: 4, height: 6 }}>
            <div style={{
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              height: '100%',
              borderRadius: 4,
              width: `${progress}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>What industry are you in?</h2>
            <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 28 }}>
              This determines compliance requirements and the best architecture for your use case.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {INDUSTRIES.map(ind => (
                <button
                  key={ind.id}
                  onClick={() => { selectAnswer('industry', ind.id); setStep(1) }}
                  style={cardStyle(answers.industry === ind.id)}
                >
                  {ind.label}
                  {ind.compliance.length > 0 && (
                    <div style={{ fontSize: 11, color: '#6366f1', marginTop: 4 }}>
                      Requires: {ind.compliance.join(', ')}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Which cloud are you on right now?</h2>
            <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 28 }}>
              If you&apos;re already on cloud, this helps us give you specific optimization advice. If not, we&apos;ll help you choose.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CLOUD_PROVIDERS.map(provider => (
                <button
                  key={provider}
                  onClick={() => { selectAnswer('currentCloud', provider); setStep(2) }}
                  style={cardStyle(answers.currentCloud === provider)}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>What&apos;s your monthly cloud spend?</h2>
            <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 28 }}>
              Be honest — there&apos;s no wrong answer. This helps us give you realistic cost optimization targets.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SPEND_RANGES.map(range => (
                <button
                  key={range.id}
                  onClick={() => { selectAnswer('monthlySpend', range.label); setStep(3) }}
                  style={cardStyle(answers.monthlySpend === range.label)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>How big is your team?</h2>
            <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 28 }}>
              Team size affects which managed services make sense versus building your own infrastructure.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TEAM_SIZES.map(size => (
                <button
                  key={size.id}
                  onClick={() => { selectAnswer('teamSize', size.label); setStep(4) }}
                  style={cardStyle(answers.teamSize === size.label)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>What&apos;s your biggest cloud problem right now?</h2>
            <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 28 }}>
              Be specific — this is what your recommendation will be focused on solving.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MAIN_PROBLEMS.map(problem => (
                <button
                  key={problem.id}
                  onClick={() => {
                    const finalAnswers = { ...answers, mainProblem: problem.label }
                    setAnswers(finalAnswers)
                    generateRecommendation(finalAnswers)
                  }}
                  style={cardStyle(answers.mainProblem === problem.label)}
                >
                  {problem.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
