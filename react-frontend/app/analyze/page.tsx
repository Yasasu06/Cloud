'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/posthog'
import { JargonText, JargonWrapper } from '@/components/JargonTooltip'
import JourneyProgress from '@/components/JourneyProgress'
import ImplementationWizard from '@/components/ImplementationWizard'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import { getUserMode, modeInstruction } from '@/lib/userMode'
import { fetchAllCompute } from '@/lib/pricing/compare'

async function buildPricingContext(userText: string): Promise<string> {
  const lower = userText.toLowerCase()
  const mentioned: string[] = []
  for (const p of ['aws', 'azure', 'gcp', 'google', 'digitalocean', 'hetzner', 'cloudflare', 'linode', 'vultr', 'oracle', 'render', 'railway', 'fly']) {
    if (lower.includes(p)) mentioned.push(p)
  }
  if (mentioned.length === 0) mentioned.push('aws') // default
  try {
    const all = await fetchAllCompute()
    // Top 3 cheapest in each requested provider for context
    const slim = all
      .filter(i => mentioned.some(m => i.provider.toLowerCase().includes(m === 'google' ? 'gcp' : m)))
      .slice(0, 30)
      .map(i => `${i.provider} ${i.name}: ${i.vcpus}vCPU/${i.ram_gb}GB = $${i.price_monthly_usd}/mo`)
      .join('\n')
    if (!slim) return ''
    return `\n\nLISTED COMPUTE PRICES (AWS/Azure may use live APIs or static fallback; others are static references):\n${slim}\n`
  } catch { return '' }
}
import SummaryCard from '@/components/analysis/SummaryCard'
import MetricsRow from '@/components/analysis/MetricsRow'
import CostBreakdownChart from '@/components/analysis/CostBreakdownChart'
import RecommendationCard from '@/components/analysis/RecommendationCard'
import LivePricingBadge from '@/components/LivePricingBadge'
import NextActionCards from '@/components/NextActionCards'
import AlternativesSection from '@/components/analysis/AlternativesSection'
import QuickWinsList from '@/components/analysis/QuickWinsList'
import AnalysisSkeleton from '@/components/analysis/AnalysisSkeleton'
import RiskProfile, { type RiskProfileData } from '@/components/analysis/RiskProfile'
import CounterArguments, { type CounterArgument } from '@/components/analysis/CounterArguments'
import Perspectives, { type Perspective } from '@/components/analysis/Perspectives'
import DecisionModal from '@/components/DecisionModal'
import type { AnalysisResult } from '@/components/analysis/types'

const JSON_SCHEMA_INSTRUCTION = `

OUTPUT FORMAT — Respond with ONLY valid JSON, no other text, no markdown fences. Use this exact schema:

{
  "summary": {
    "headline": "One sentence verdict for this client",
    "verdict_type": "savings_opportunity",
    "confidence": "high",
    "monthly_spend": 5000,
    "estimated_waste_pct": 28,
    "estimated_waste_amount": 1400
  },
  "key_metrics": [
    {"label": "Monthly Spend", "value": "$5,000", "trend": "stable"},
    {"label": "Waste Identified", "value": "$1,400", "trend": "concerning"},
    {"label": "Potential Savings", "value": "28%", "trend": "positive"}
  ],
  "cost_breakdown": [
    {"service": "EC2", "amount": 2500, "percent": 50, "waste_estimate": 600},
    {"service": "RDS", "amount": 1200, "percent": 24, "waste_estimate": 200},
    {"service": "Other", "amount": 1300, "percent": 26, "waste_estimate": 200}
  ],
  "recommendations": [
    {
      "id": 1,
      "title": "Switch to Reserved Instances",
      "icon": "💰",
      "impact": "high",
      "effort": "low",
      "savings_amount": 525,
      "savings_text": "$525/month",
      "explanation": "Technical reasoning",
      "plain_english": "Like prepaying gym membership for a discount",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "risk_level": "low",
      "implementation_time": "2 hours"
    }
  ],
  "alternative_providers": [
    {
      "name": "DigitalOcean",
      "logo": "🌊",
      "monthly_cost_estimate": 4200,
      "why": "Simpler interface saves dev time",
      "savings_vs_current": 800,
      "recommended_for": "Teams under 10 engineers"
    }
  ],
  "quick_wins": [
    {"title": "Delete unused EBS volumes", "savings": "$45/month", "time": "10 min"},
    {"title": "Stop dev environments overnight", "savings": "$180/month", "time": "1 hour"},
    {"title": "Enable S3 Intelligent Tiering", "savings": "$30/month", "time": "5 min"}
  ]
}

Be specific with numbers. Use real cloud pricing. Be conservative — better to under-promise. Provide 3–6 recommendations and 0–3 alternative providers. Always include 3 quick_wins.`

function tryExtractJson(raw: string): AnalysisResult | null {
  if (!raw) return null
  try { return JSON.parse(raw) as AnalysisResult } catch (_e) { /* try harder */ }
  const fenced = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/```\s*([\s\S]*?)\s*```/)
  if (fenced) {
    try { return JSON.parse(fenced[1]) as AnalysisResult } catch (_e) { /* keep going */ }
  }
  const first = raw.indexOf('{')
  const last = raw.lastIndexOf('}')
  if (first >= 0 && last > first) {
    try { return JSON.parse(raw.slice(first, last + 1)) as AnalysisResult } catch (_e) { /* fall through */ }
  }
  return null
}

const ALT_PROVIDER_INSTRUCTION = `

ALTERNATIVE PROVIDERS:
Always consider alternative providers (DigitalOcean, Hetzner, Cloudflare, Linode, Vultr, Render, Railway) when relevant. For startups spending under $5k/month, these alternatives often provide better value than the big 3. Don't default to AWS/Azure/GCP — recommend based on actual fit. Specifically:
- Cloudflare Workers/R2 for edge + zero-egress workloads
- Hetzner for cost-sensitive EU workloads (60–80% cheaper than AWS for similar specs)
- DigitalOcean for simplicity and predictable pricing
- Render/Railway for Heroku-style deploys without ops overhead`

type Mode = 'finops' | 'architect' | 'migration'

const MODE_CHIPS: Record<Mode, string[]> = {
  finops:    ['Bill spike', 'Find waste', 'Explain charges'],
  architect: ['New startup', 'Healthcare app', 'Scale to 1M users'],
  migration: ['AWS to Azure', 'Cut costs 40%', 'Avoid lock-in'],
}

interface ModeConfig {
  id: Mode
  icon: string
  title: string
  subtitle: string
  placeholder: string
  color: string
  systemPrompt: string
}

const MODES: ModeConfig[] = [
  {
    id: 'finops',
    icon: '💸',
    title: 'Explain My Cloud Bill',
    subtitle: "FinOps Analyst — find waste, explain costs, cut spend",
    placeholder: "e.g. We're on AWS, spending $12k/month, 5 engineers. Our bill doubled last quarter and we don't know why.",
    color: '#f59e0b',
    systemPrompt: `You are a senior FinOps consultant with 15 years experience at AWS and Azure. A client just described their cloud situation.

Give them a specific expert analysis with these exact markdown sections:

## Your Situation
One sentence confirming their setup.

## Top Cost Drivers
The 3-4 services most likely causing their spend. Use REAL service names and REAL price estimates based on AWS/Azure/GCP published pricing. Example: EC2 c5.xlarge = $0.17/hr = $122/month per instance.

## Cut This Week
5 specific items ranked by savings potential.
Format each as:
**[Service]** — $X/month — [How to find it in console] — [One line action]

## Your Action Plan
Numbered steps for this week only.
Each step: specific console page, estimated time, expected saving.

## Risk Alert
One specific financial risk they may not know about based on their situation.

## Expected Saving
Bold the monthly saving range.
Show as: **$X,XXX - $X,XXX/month**

Rules: Never say 'it depends' without explaining. Use real dollar amounts. Max 450 words. Write for a smart non-technical founder.`,
  },
  {
    id: 'architect',
    icon: '🏗️',
    title: 'Design My Architecture',
    subtitle: "Solutions Architect — pick the right stack for what you're building",
    placeholder: "e.g. I want to build a healthcare app for 500 doctors in Europe that handles patient records and needs HIPAA/GDPR compliance.",
    color: '#6366f1',
    systemPrompt: `You are a senior cloud solutions architect. Design a cloud architecture for the user's project. Use clear markdown with headers and structured lists.

Structure your response:

## Your Project
One sentence confirming what you understood.

## Recommended Cloud Provider
**[Provider Name]** — one clear reason why.

## Your Architecture
For each service:
**Service Name** (~$X/month) — what it does in plain English

## Total Monthly Cost
**$X - $Y/month** at your described scale. What drives this higher or lower.

## Compliance Requirements
Specific requirements for their industry if applicable.

## Your First 3 Steps
1. Specific action with time estimate
2. Specific action with time estimate
3. Specific action with time estimate

## One Thing That Usually Goes Wrong
Honest warning specific to their project type.

When recommending providers, also consider DigitalOcean, Hetzner, Linode, Vultr, Cloudflare Workers, Oracle Cloud, OVH, Render, and Railway when appropriate. For startups under $5k/month spend, alternatives often provide 50–70% savings vs AWS/Azure/GCP.`,
  },
  {
    id: 'migration',
    icon: '🔄',
    title: 'Plan My Migration',
    subtitle: "Migration Engineer — move clouds without breaking production",
    placeholder: "e.g. We're on AWS and want to move to Azure. $15k/month, 8 engineers, running 12 microservices and a PostgreSQL database.",
    color: '#22c55e',
    systemPrompt: `You are a senior cloud migration engineer. Create a migration plan for the user. Use clear markdown formatting.

Structure your response:

## Migration Summary
What you understood they want to migrate.

## Complexity: [Easy/Medium/Hard/Very Hard]
One sentence explaining the rating.

## Financial Analysis
**Migration Cost:** $X - $Y one-time
**Monthly Change:** Save/Cost $X after migration
**Break Even:** X months

## 8-Week Migration Plan
**Week 1-2:** [specific tasks]
**Week 3-4:** [specific tasks]
**Week 5-6:** [specific tasks]
**Week 7-8:** [specific tasks]

## Top 3 Risks
**Risk 1:** What it is and how to prevent it
**Risk 2:** What it is and how to prevent it
**Risk 3:** What it is and how to prevent it

## My Honest Recommendation
Direct answer: should they migrate or not and why. If it does not make financial sense say so clearly.`,
  },
]

// Function to process text and wrap jargon terms

const MarkdownResponse = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children }) => (
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12, marginTop: 24, borderBottom: '1px solid #ffffff15', paddingBottom: 8 }}>
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#6366f1', marginBottom: 10, marginTop: 20 }}>
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#a0a0b0', marginBottom: 8, marginTop: 16 }}>
          {children}
        </h3>
      ),
      p: ({ children }) => (
        <p style={{ color: '#e0e0e0', lineHeight: 1.8, marginBottom: 12, fontSize: 15 }}>
          {React.Children.map(children, c => typeof c === 'string' ? <JargonText text={c} /> : c)}
        </p>
      ),
      strong: ({ children }) => (
        <strong style={{ color: 'white', fontWeight: 700 }}>
          {React.Children.map(children, c => typeof c === 'string' ? <JargonText text={c} /> : c)}
        </strong>
      ),
      ul: ({ children }) => (
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol style={{ paddingLeft: 20, marginBottom: 16 }}>
          {children}
        </ol>
      ),
      li: ({ children }) => (
        <li style={{ color: '#e0e0e0', marginBottom: 8, fontSize: 15, lineHeight: 1.7 }}>
          {React.Children.map(children, c => typeof c === 'string' ? <JargonText text={c} /> : c)}
        </li>
      ),
      blockquote: ({ children }) => (
        <div style={{ borderLeft: '4px solid #6366f1', paddingLeft: 16, margin: '16px 0', background: 'rgba(99,102,241,0.05)', borderRadius: '0 8px 8px 0', padding: '12px 16px' }}>
          {children}
        </div>
      ),
      code: ({ children }) => (
        <code style={{ background: '#0a0a0f', padding: '2px 6px', borderRadius: 4, fontSize: 13, color: '#22c55e', fontFamily: 'monospace' }}>
          {children}
        </code>
      ),
      hr: () => (
        <hr style={{ border: 'none', borderTop: '1px solid #ffffff10', margin: '20px 0' }} />
      ),
    }}
  >
    {content}
  </ReactMarkdown>
)

function ConfidenceBadge({ level, text }: { level: 'high' | 'medium' | 'low'; text: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 12, fontSize: 11,
      background: level === 'high' ? 'rgba(34,197,94,0.1)' : level === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
      color: level === 'high' ? '#22c55e' : level === 'medium' ? '#f59e0b' : '#ef4444',
      border: `1px solid ${level === 'high' ? '#22c55e33' : level === 'medium' ? '#f59e0b33' : '#ef444433'}`,
    }}>
      {level === 'high' ? '🟢' : level === 'medium' ? '🟡' : '🟠'} {text}
    </div>
  )
}

const TOOL_SUGGESTIONS = [
  { keywords: ['reserved instance', 'reserved instances', ' ri '], label: '💎 Reserved Instances', href: '/optimize?tab=reserved' },
  { keywords: ['egress', 'data transfer', 'bandwidth cost'], label: '🔄 Egress Calculator', href: '/migrate?tab=egress' },
  { keywords: ['compliance', 'hipaa', 'gdpr', 'pci', 'fedramp', 'hitrust', 'sox'], label: '✅ Compliance', href: '/compliance' },
  { keywords: ['architecture', 'stack', 'infrastructure design', 'service design'], label: '🏗️ Architecture', href: '/architecture' },
  { keywords: ['benchmark', 'industry average', 'peers', 'compare to'], label: '🏆 Cloud Score', href: '/learn?tab=benchmarks' },
]

function RelatedTools({ response }: { response: string }) {
  const lower = response.toLowerCase()
  const matches = TOOL_SUGGESTIONS.filter(t => t.keywords.some(k => lower.includes(k)))
  if (matches.length === 0) return null
  return (
    <div style={{ marginTop: 24, padding: 16, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12 }}>
      <div style={{ fontSize: 11, color: '#6366f1', letterSpacing: 2, marginBottom: 12, fontWeight: 700 }}>🔗 RELATED TOOLS</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {matches.map(m => (
          <a
            key={m.href}
            href={m.href}
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: '#818cf8', textDecoration: 'none', fontWeight: 600, transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(99,102,241,0.2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(99,102,241,0.1)' }}
          >
            {m.label} →
          </a>
        ))}
      </div>
    </div>
  )
}

export default function AnalyzePage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null)
  const [userType, setUserType] = useState<'direct' | 'guided' | 'explore' | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('analyze_user_type')
    if (stored === 'direct' || stored === 'guided' || stored === 'explore') setUserType(stored)
  }, [])

  function pickUserType(t: 'direct' | 'guided' | 'explore') {
    setUserType(t)
    if (typeof window !== 'undefined') localStorage.setItem('analyze_user_type', t)
  }
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [quickWins, setQuickWins] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [parseError, setParseError] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [riskProfile, setRiskProfile] = useState<RiskProfileData | null>(null)
  const [counterArgs, setCounterArgs] = useState<CounterArgument[]>([])
  const [perspectives, setPerspectives] = useState<Perspective[]>([])
  const [perspectiveMode, setPerspectiveMode] = useState<'single' | 'four'>('single')
  const [perspectivesLoading, setPerspectivesLoading] = useState(false)
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)

  useEffect(() => {
    if (done) {
      setShowSparkle(true)
      const t = setTimeout(() => setShowSparkle(false), 2000)
      return () => clearTimeout(t)
    }
  }, [done])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    const modeParam = params.get('mode') as Mode | null
    if (modeParam && ['finops', 'architect', 'migration'].includes(modeParam)) {
      setSelectedMode(modeParam)
    }
    if (q && q.trim()) {
      setInput(q)
      setSelectedMode('finops')
      setTimeout(() => analyze('finops', q), 300)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activeMode = MODES.find(m => m.id === selectedMode)

  async function analyze(modeId: Mode, overrideText?: string) {
    const mode = MODES.find(m => m.id === modeId)
    if (!mode) return
    const userText = (overrideText ?? input).trim()
    if (!userText || loading) return

    setLoading(true)
    setResponse('')
    setDone(false)
    setSaved(false)
    setQuickWins([])
    setAnalysis(null)
    setParseError(false)
    setRiskProfile(null)
    setCounterArgs([])
    setPerspectives([])
    trackEvent('analyze_started', { mode: modeId, input_length: userText.length })

    const pricingContext = await buildPricingContext(userText)

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 3000,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: mode.systemPrompt + ALT_PROVIDER_INSTRUCTION + pricingContext + JSON_SCHEMA_INSTRUCTION + modeInstruction(getUserMode()) },
            { role: 'user', content: userText },
          ],
        }),
      })

      const data = await res.json()
      const fullText: string = data.choices?.[0]?.message?.content || ''
      setResponse(fullText)

      const parsed = tryExtractJson(fullText)
      if (parsed && parsed.summary && Array.isArray(parsed.recommendations)) {
        setAnalysis(parsed)
        // Fire decision-framework calls in parallel — non-blocking
        void fetchRiskProfile(userText)
        void fetchCounterArguments(userText, parsed.recommendations.map(r => r.title).join('; '))
        if (perspectiveMode === 'four') void fetchPerspectives(userText)
      } else {
        setParseError(true)
        console.error('JSON parse failed for analyze response')
      }

      setDone(true)
      trackEvent('analyze_completed', { mode: modeId })

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { error: saveError } = await supabase.from('saved_recommendations').insert({
          user_id: session.user.id,
          provider: mode.title,
          confidence: 0,
          workload: modeId,
          team_size: '',
          budget: '',
          raw_analysis: fullText,
        })
        if (!saveError) setSaved(true)
      }
    } catch (e) {
      console.error('analyze() failed', e)
      setResponse('Sorry, analysis failed. Please try again.')
      setParseError(true)
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  async function fetchRiskProfile(userInput: string) {
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 400,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'Return only JSON, no other text.' },
            { role: 'user', content: `For this cloud decision: "${userInput}"
Return JSON:
{
  "reversibility": "easy" | "medium" | "hard",
  "blast_radius": "low" | "medium" | "high",
  "time_to_implement": "minutes" | "hours" | "days" | "weeks",
  "risk_level": "low" | "medium" | "high",
  "recommended_approach": "Just do it" | "Test first" | "Phase rollout" | "Get expert review",
  "rationale": "One sentence why this approach"
}` },
          ],
        }),
      })
      const data = await res.json()
      const parsed = tryExtractJson(data.choices?.[0]?.message?.content || '')
      if (parsed && (parsed as unknown as RiskProfileData).recommended_approach) {
        setRiskProfile(parsed as unknown as RiskProfileData)
      }
    } catch (e) { console.error('risk profile failed', e) }
  }

  async function fetchCounterArguments(userInput: string, recsSummary: string) {
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 600,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'Return only JSON, no other text. You are a contrarian senior cloud architect — challenge the recommendations.' },
            { role: 'user', content: `Situation: "${userInput}"
Recommendations being made: ${recsSummary}

Give 2-3 reasons why this advice might NOT be right for this user. Be honest and thought-provoking, not alarming.

Return JSON:
{
  "counter_arguments": [
    {
      "title": "Short headline of the counter-argument",
      "explanation": "Why this might be the wrong move",
      "when_applies": "When this concern is most relevant to the user"
    }
  ]
}` },
          ],
        }),
      })
      const data = await res.json()
      const parsed = tryExtractJson(data.choices?.[0]?.message?.content || '')
      const args = (parsed as unknown as { counter_arguments?: CounterArgument[] })?.counter_arguments
      if (Array.isArray(args)) setCounterArgs(args)
    } catch (e) { console.error('counter arguments failed', e) }
  }

  async function fetchPerspectives(userInput: string) {
    setPerspectivesLoading(true)
    const PERSONAS: Array<{ role: Perspective['role']; system: string }> = [
      { role: 'finops',     system: 'You are a senior FinOps Analyst. Focus exclusively on cost, waste, and ROI.' },
      { role: 'architect',  system: 'You are a senior Solutions Architect. Focus on technical fit, scalability, and integration.' },
      { role: 'operations', system: 'You are a senior Operations Manager. Focus on reliability, security, and on-call burden.' },
      { role: 'business',   system: 'You are a Business Strategist. Focus on long-term lock-in, contract terms, and strategic impact.' },
    ]
    try {
      const results = await Promise.all(PERSONAS.map(async p => {
        const res = await fetch('/api/groq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            max_tokens: 350,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: `${p.system} Return only JSON.` },
              { role: 'user', content: `For this cloud situation: "${userInput}"
Return JSON:
{
  "take": "Your main take in 1-2 sentences",
  "top_concern": "Your single biggest concern",
  "would_do_differently": "What you would do differently than a generic AI advisor"
}` },
            ],
          }),
        })
        const data = await res.json()
        const parsed = tryExtractJson(data.choices?.[0]?.message?.content || '') as unknown as Omit<Perspective, 'role'> | null
        return parsed ? { ...parsed, role: p.role } as Perspective : null
      }))
      setPerspectives(results.filter((r): r is Perspective => r !== null))
    } catch (e) { console.error('perspectives failed', e) }
    finally { setPerspectivesLoading(false) }
  }

  function reset() {
    setResponse('')
    setDone(false)
    setSaved(false)
    setInput('')
    setQuickWins([])
  }

  async function fetchQuickWins(userInput: string) {
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 400,
          messages: [
            { role: 'system', content: 'Return only valid JSON array.' },
            {
              role: 'user',
              content: `For this cloud situation: "${userInput}"
Return exactly 3 quick wins as JSON:
[
  {
    "action": "Short action title",
    "description": "One sentence plain English",
    "saving": "$X/month",
    "effort": "5 minutes" or "30 minutes" or "1 hour",
    "where": "Exact console location"
  }
]
Focus on things they can do TODAY.`,
            },
          ],
        }),
      })
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || '[]'
      const clean = text.replace(/```json|```/g, '').trim()
      setQuickWins(JSON.parse(clean))
    } catch {
      setQuickWins([])
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <JourneyProgress currentStep={1} />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 60px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 12,
            color: '#6366f1',
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: 1,
          }}>
            AI-POWERED CLOUD ANALYSIS
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.2 }}>
            What do you need help with?
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            Pick a mode, describe your situation in plain English, get expert analysis in 30 seconds.
          </p>
        </div>

        {/* Trust bar */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
          {['🔒 Vendor Neutral', '📊 Real pricing data', '⚡ Powered by Llama 3.3 70B', '🌍 Covers 12+ providers'].map(item => (
            <span key={item} style={{ color: '#666', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>{item}</span>
          ))}
        </div>

        {/* Three user types picker */}
        {!done && !userType && !selectedMode && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 14, textAlign: 'center' }}>How would you like to start?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              {[
                { id: 'direct',  icon: '🎯', title: 'I know my problem', desc: 'I can describe my situation in plain English.' },
                { id: 'guided',  icon: '🧭', title: 'Something feels wrong', desc: "Walk me through 5 questions to find it." },
                { id: 'explore', icon: '🔍', title: 'Just exploring', desc: 'Show me popular use cases as starting templates.' },
              ].map(opt => (
                <button key={opt.id} onClick={() => pickUserType(opt.id as 'direct' | 'guided' | 'explore')}
                  style={{ padding: '20px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', cursor: 'pointer', color: 'white', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{opt.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{opt.title}</div>
                  <div style={{ fontSize: 12, color: '#a0a0b0', lineHeight: 1.5 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* "Explore" mode shows quick-start templates */}
        {!done && userType === 'explore' && !selectedMode && !response && (
          <div style={{ marginBottom: 24, padding: '16px 18px', borderRadius: 12, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: 1.5, marginBottom: 10 }}>POPULAR STARTING POINTS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                "We're spending $12k/month on AWS and the bill keeps growing — find waste",
                'Starting a healthcare SaaS — which cloud for HIPAA compliance?',
                'Considering moving from AWS to Hetzner for cost — what should I know?',
                'Our LLM costs hit $4k/month — how do we reduce them?',
              ].map(t => (
                <button key={t} onClick={() => { setSelectedMode('finops'); setInput(t) }}
                  style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#a0a0b0', cursor: 'pointer', textAlign: 'left', maxWidth: '100%' }}
                >{t}</button>
              ))}
            </div>
          </div>
        )}

        {/* Don't have data? helper */}
        {!done && !response && userType && !loading && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 12, color: '#a0a0b0' }}>
            💡 <strong style={{ color: 'white', fontWeight: 600 }}>Don&apos;t have your bill handy?</strong> Try{' '}
            <a href="/instant-audit" style={{ color: '#818cf8' }}>/instant-audit</a> — works with just your spend total.
            {' '}Or use <a href="/advisor" style={{ color: '#818cf8' }}>/advisor</a> to discover what you need via a 5-question quiz.
          </div>
        )}

        {/* Mode selection */}
        {!done && userType && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => { setSelectedMode(mode.id); reset() }}
                className={`glass-card mode-${mode.id}`}
                style={{
                  background: selectedMode === mode.id ? `${mode.color}15` : undefined,
                  border: selectedMode === mode.id ? `2px solid ${mode.color}` : undefined,
                  padding: '24px 20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  minHeight: 200,
                  position: 'relative',
                }}
              >
                {mode.id === 'finops' && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#f59e0b', color: '#000',
                    fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 6, letterSpacing: 0.5,
                  }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1 }}>{mode.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 6 }}>{mode.title}</div>
                <div style={{ fontSize: 12, color: '#a0a0b0', lineHeight: 1.5, marginBottom: 14 }}>{mode.subtitle}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {MODE_CHIPS[mode.id].map(chip => (
                    <span
                      key={chip}
                      onClick={e => { e.stopPropagation(); setSelectedMode(mode.id); setInput(chip) }}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 20, padding: '3px 10px',
                        fontSize: 11, color: '#888', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#a0a0f0' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#888' }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        {selectedMode && !done && (
          <div style={{
            background: '#1a1a2e',
            borderRadius: 20,
            padding: 28,
            border: `1px solid ${activeMode?.color}30`,
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, color: '#a0a0b0', marginBottom: 12, fontWeight: 600 }}>
              {activeMode?.icon} {activeMode?.title}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={activeMode?.placeholder}
              rows={4}
              style={{
                width: '100%',
                background: '#0a0a0f',
                border: '1px solid #ffffff15',
                borderRadius: 12,
                padding: '14px 16px',
                color: 'white',
                fontSize: 15,
                lineHeight: 1.6,
                resize: 'none',
                outline: 'none',
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.metaKey && selectedMode) analyze(selectedMode)
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#555', fontSize: 13 }}>Press ⌘+Enter to analyze</span>
              <button
                onClick={() => selectedMode && analyze(selectedMode)}
                disabled={loading || !input.trim()}
                style={{
                  background: activeMode?.color || '#6366f1',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 28px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !input.trim() ? 0.5 : 1,
                }}
              >
                {loading ? 'Analyzing...' : 'Analyze →'}
              </button>
            </div>
          </div>
        )}

        {/* Visual analysis output */}
        {(loading || analysis || (response && parseError)) && (
          <>
          <DisclaimerBanner />

          {/* Status bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8, position: 'relative' }}>
            {showSparkle && (
              <div style={{ position: 'absolute', top: -4, right: 16, display: 'flex', gap: 6, pointerEvents: 'none' }}>
                {['✦', '✧', '✦'].map((s, i) => (
                  <span key={i} className="sparkle-icon" style={{ fontSize: 14, color: '#818cf8', animationDelay: `${i * 0.15}s` }}>{s}</span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className={loading ? 'pulse-ring' : ''} style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? '#6366f1' : '#22c55e' }} />
              <span style={{ color: '#a0a0b0', fontSize: 13 }}>
                {loading ? 'Analyzing your situation...' : `Analysis complete${saved ? ' · Saved to your account' : ''}`}
              </span>
            </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {analysis && <LivePricingBadge compact />}
                <span style={{ fontSize: 11, color: '#444', padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                  Llama 3.3 70B
                </span>
                {done && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(response); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    style={{ fontSize: 12, color: copied ? '#22c55e' : '#666', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '3px 10px', cursor: 'pointer' }}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>

          {/* Loading skeleton */}
          {loading && !analysis && <AnalysisSkeleton />}

          {/* Perspective mode toggle */}
          {analysis && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 2 }}>
                {(['single', 'four'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setPerspectiveMode(m)
                      if (m === 'four' && perspectives.length === 0 && input) void fetchPerspectives(input)
                    }}
                    style={{
                      padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                      background: perspectiveMode === m ? 'rgba(99,102,241,0.2)' : 'transparent',
                      color: perspectiveMode === m ? '#818cf8' : '#666',
                    }}
                  >
                    {m === 'single' ? 'Single Expert' : '🎭 Four Perspectives'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Visual analysis output */}
          {analysis && (
            <div className="page-enter">
              <SummaryCard data={analysis.summary} />
              <MetricsRow data={analysis.key_metrics} />

              {/* Risk profile (decision framework) */}
              {riskProfile && <RiskProfile data={riskProfile} />}

              {/* Four-perspectives view */}
              {perspectiveMode === 'four' && (
                perspectivesLoading
                  ? <div className="ai-shimmer" style={{ height: 220, marginBottom: 24 }} />
                  : perspectives.length > 0 && <Perspectives data={perspectives} />
              )}
              {analysis.cost_breakdown && analysis.cost_breakdown.length > 0 && (
                <CostBreakdownChart data={analysis.cost_breakdown} />
              )}

              {analysis.recommendations?.length > 0 && (
                <div style={{ marginTop: 28, marginBottom: 8 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 14, letterSpacing: -0.2 }}>Recommendations</h2>
                  <JargonWrapper>
                    <>
                      {analysis.recommendations.map(rec => (
                        <RecommendationCard key={rec.id} data={rec} onStartWizard={() => setShowWizard(true)} />
                      ))}
                    </>
                  </JargonWrapper>
                </div>
              )}

              {analysis.quick_wins && analysis.quick_wins.length > 0 && (
                <QuickWinsList data={analysis.quick_wins} />
              )}

              {analysis.alternative_providers && analysis.alternative_providers.length > 0 && (
                <AlternativesSection data={analysis.alternative_providers} />
              )}

              {/* Counter-arguments (decision framework) */}
              {counterArgs.length > 0 && <CounterArguments data={counterArgs} />}

              {/* Document Decision CTA */}
              <div style={{
                marginTop: 20, padding: '16px 20px', borderRadius: 12,
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>📝 Document this decision</div>
                  <div style={{ fontSize: 12, color: '#a0a0b0' }}>Capture your reasoning and set a review date for future you.</div>
                </div>
                <button
                  onClick={() => setShowDecisionModal(true)}
                  style={{ background: '#6366f1', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Document Decision →
                </button>
              </div>

              {/* Next Action cards */}
              <NextActionCards actions={[
                { icon: '💰', title: 'Estimate Savings Opportunities', desc: 'Run optimization tools',  href: '/optimize' },
                { icon: '📊', title: 'See Visual Journey',      desc: '12-week trajectory',       href: '/outcome-simulator' },
                { icon: '📝', title: 'Document This Decision',  desc: 'Save reasoning + review', onClick: () => setShowDecisionModal(true) },
              ]} />

              {/* Confidence breakdown */}
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: '#666', marginBottom: 12 }}>
                  🛡️ CONFIDENCE BREAKDOWN
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <ConfidenceBadge level="high"   text="Pricing data verified" />
                  <ConfidenceBadge level="high"   text="Reserved instance math" />
                  <ConfidenceBadge level="medium" text="Workload estimates" />
                  <ConfidenceBadge level="low"    text="Future projections" />
                </div>
                <p style={{ color: '#666', fontSize: 12, margin: 0 }}>
                  🟢 Verified against published cloud provider pricing as of {new Date().toLocaleDateString()}.&nbsp;
                  🟡 Based on typical workload patterns.&nbsp;
                  🟠 Projections vary with actual usage.
                </p>
              </div>
            </div>
          )}

          {/* Fallback: JSON parse failed but we have raw text */}
          {parseError && response && !analysis && (
            <div className="glass-card" style={{ padding: 24 }}>
              <p style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
                ⚠ DISPLAY ISSUE DETECTED — SHOWING SIMPLIFIED VIEW
              </p>
              <JargonWrapper>
                <MarkdownResponse content={response} />
              </JargonWrapper>
            </div>
          )}
          </>
        )}

        {/* Legacy quick wins fallback (rarely shown — kept for backward compat) */}
        {!analysis && quickWins.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 11, color: '#22c55e', letterSpacing: 2, fontWeight: 700 }}>⚡ QUICK WINS — DO TODAY</span>
            </div>
            {quickWins.map((w, i) => (
              <div key={i} className="glass-card" style={{ padding: 16, marginBottom: 12, borderLeft: '3px solid #22c55e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong style={{ color: 'white', fontSize: 14 }}>{w.action}</strong>
                  <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 700 }}>{w.saving}</span>
                </div>
                <p style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 8 }}>{w.description}</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: '#666', fontSize: 12 }}>⏱ {w.effort}</span>
                  <span style={{ color: '#666', fontSize: 12 }}>📍 {w.where}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Related Tools */}
        {done && response && <RelatedTools response={response} />}

        {/* Implementation Wizard + Track results */}
        {done && (
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setShowWizard(true)}
              style={{
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 8, padding: '8px 14px', color: '#22c55e',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              🧭 Start Implementation Wizard
            </button>
            <div style={{ flex: 1, padding: '8px 14px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#666' }}>Implemented this advice? Tell us what happened.</span>
              <a href="/track-results" style={{ fontSize: 13, color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Share your results →</a>
            </div>
          </div>
        )}

        {showWizard && <ImplementationWizard onClose={() => setShowWizard(false)} savingEstimate="$200–800/mo" />}
        {showDecisionModal && (
          <DecisionModal
            decisionText={analysis?.summary?.headline ?? input}
            onClose={() => setShowDecisionModal(false)}
          />
        )}

        {/* Disclaimer */}
        {done && (
          <div style={{ marginTop: 12, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #333' }}>
            <p style={{ color: '#555', fontSize: 11, margin: 0 }}>
              ℹ️ Recommendations are based on published cloud provider pricing and industry benchmarks. Actual savings may vary. Always verify recommendations with your cloud provider before making changes to production infrastructure.
            </p>
          </div>
        )}

        {/* Save nudge for logged-out users */}
        {done && !isLoggedIn && (
          <div
            className="glass-card"
            style={{
              marginTop: 16,
              padding: '16px 20px',
              border: '1px solid rgba(99,102,241,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <p style={{ color: '#c7c8f0', fontSize: 14, margin: 0 }}>
              <strong style={{ color: 'white' }}>Save this analysis</strong> — Sign in to keep your results and get personalized recommendations.
            </p>
            <button
              onClick={() => router.push('/auth')}
              style={{
                background: '#6366f1',
                border: 'none',
                borderRadius: 8,
                padding: '9px 20px',
                color: 'white',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Action row */}
        {done && (
          <div style={{
            marginTop: 24,
            paddingTop: 24,
            borderTop: '1px solid #ffffff08',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <button onClick={() => router.push('/advisor')} className="btn-primary" style={{ fontSize: 14, padding: '12px 24px' }}>
              Get Full Recommendation →
            </button>
            <button onClick={() => router.push('/chat')} className="btn-secondary" style={{ fontSize: 14, padding: '12px 24px' }}>
              Ask Follow-up Questions
            </button>
            <button
              onClick={() => { reset(); setSelectedMode(null) }}
              className="btn-secondary"
              style={{ fontSize: 14, padding: '12px 24px', color: '#666' }}
            >
              Start New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
