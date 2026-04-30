'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/posthog'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { motion } from 'framer-motion'

type Mode = 'finops' | 'architect' | 'migration'

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
    systemPrompt: `You are a senior FinOps consultant. Analyze the user's cloud situation and give them a specific, actionable report. Use clear markdown formatting with headers, bullet points, and bold key numbers.

Structure your response like this:

## Your Situation
Brief summary of what you understood.

## Where Your Money Is Going
The 3-4 most likely cost drivers at their spend level. Name real services with real dollar estimates.

## What You Can Cut Right Now
5 specific items they can eliminate or reduce. For each: **Service Name** - what it costs, how to find it, what to do.

## Your Action Plan This Week
Numbered steps with specific console navigation.

## Your Biggest Risk
One specific warning.

## Expected Monthly Saving
**$X - $Y/month** if they follow your recommendations.

Be specific. Use real AWS/Azure/GCP service names. Give real dollar amounts. Write for a smart non-technical founder. No filler words.`,
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
Honest warning specific to their project type.`,
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
          {children}
        </p>
      ),
      strong: ({ children }) => (
        <strong style={{ color: 'white', fontWeight: 700 }}>
          {children}
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
          {children}
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

export default function AnalyzePage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null)
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [saved, setSaved] = useState(false)
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q && q.trim()) {
      setInput(q)
      setSelectedMode('finops')
      setTimeout(() => analyze('finops', q), 300)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activeMode = MODES.find(m => m.id === selectedMode)

  async function fetchChartData(userInput: string, modeId: Mode) {
    const chartPrompt = modeId === 'finops'
      ? `Based on this cloud situation: "${userInput}"
Return ONLY a JSON object, no other text:
{"costBreakdown":[{"service":"EC2","cost":3200},{"service":"RDS","cost":1800},{"service":"Data Transfer","cost":1200},{"service":"S3","cost":400},{"service":"Other","cost":400}],"wasteAmount":1840,"savingsPercent":23,"riskScore":7,"actionItems":[{"action":"Delete idle instances","saving":340},{"action":"Enable S3 Intelligent Tiering","saving":180},{"action":"Convert to Reserved Instances","saving":890}]}
Replace the example numbers with realistic estimates based on their actual situation. Return only JSON.`
      : modeId === 'architect'
      ? `Based on this project: "${userInput}"
Return ONLY a JSON object, no other text:
{"provider":"AWS","providerScore":87,"alternativeScores":[{"name":"AWS","score":87},{"name":"Azure","score":72},{"name":"GCP","score":65}],"services":[{"name":"EC2","monthlyLow":200,"monthlyHigh":400},{"name":"RDS","monthlyLow":150,"monthlyHigh":300},{"name":"S3","monthlyLow":50,"monthlyHigh":100}],"totalMonthlyLow":430,"totalMonthlyHigh":880,"timeToLaunchWeeks":8}
Replace with realistic numbers. Return only JSON.`
      : `Based on this migration: "${userInput}"
Return ONLY a JSON object, no other text:
{"complexity":"Medium","complexityScore":6,"migrationCostLow":12000,"migrationCostHigh":28000,"monthlyDelta":-800,"breakEvenMonths":18,"weeklyPlan":[{"week":"1-2","completion":25},{"week":"3-4","completion":50},{"week":"5-6","completion":75},{"week":"7-8","completion":100}],"risks":[{"name":"Data loss","severity":8},{"name":"Downtime","severity":6},{"name":"Cost overrun","severity":5}]}
Replace with realistic numbers. Return only JSON.`

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 500,
          messages: [
            { role: 'system', content: 'You are a data API. Return only valid JSON, no markdown, no explanation.' },
            { role: 'user', content: chartPrompt },
          ],
        }),
      })
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || '{}'
      const clean = text.replace(/```json|```/g, '').trim()
      setChartData(JSON.parse(clean))
    } catch (e) {
      console.error('Chart data fetch failed:', e)
    }
  }

  async function analyze(modeId: Mode, overrideText?: string) {
    const mode = MODES.find(m => m.id === modeId)
    if (!mode) return
    const userText = (overrideText ?? input).trim()
    if (!userText || loading) return

    setLoading(true)
    setResponse('')
    setDone(false)
    setSaved(false)
    setChartData(null)
    trackEvent('analyze_started', { mode: modeId, input_length: userText.length })

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 2500,
          stream: true,
          messages: [
            { role: 'system', content: mode.systemPrompt },
            { role: 'user', content: userText },
          ],
        }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        while (true) {
          const { done: streamDone, value } = await reader.read()
          if (streamDone) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

          for (const line of lines) {
            const data = line.replace('data: ', '')
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const token = parsed.choices?.[0]?.delta?.content || ''
              fullText += token
              setResponse(fullText)
            } catch {
              // partial chunk
            }
          }
        }
      }

      setDone(true)
      trackEvent('analyze_completed', { mode: modeId })
      fetchChartData(userText, modeId)

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.from('saved_recommendations').insert({
          user_id: session.user.id,
          provider: mode.title,
          confidence: 0,
          workload: modeId,
          team_size: '',
          budget: '',
          raw_analysis: fullText,
        })
        setSaved(true)
      }
    } catch {
      setResponse('Sorry, analysis failed. Please try again.')
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResponse('')
    setDone(false)
    setSaved(false)
    setInput('')
    setChartData(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
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

        {/* Mode selection */}
        {!done && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedMode(mode.id)
                  reset()
                }}
                style={{
                  background: selectedMode === mode.id ? `${mode.color}15` : '#1a1a2e',
                  border: `2px solid ${selectedMode === mode.id ? mode.color : '#ffffff10'}`,
                  borderRadius: 16,
                  padding: '20px 20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{mode.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 4 }}>{mode.title}</div>
                <div style={{ fontSize: 12, color: '#a0a0b0', lineHeight: 1.5 }}>{mode.subtitle}</div>
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

        {/* Response (streaming + done) */}
        {(response || loading) && (
          <div style={{
            background: '#1a1a2e',
            borderRadius: 16,
            padding: 32,
            border: '1px solid #ffffff08',
            marginBottom: done ? 0 : 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: loading ? '#6366f1' : '#22c55e',
              }} />
              <span style={{ color: '#a0a0b0', fontSize: 13 }}>
                {loading ? 'Analyzing your situation...' : `Analysis complete${saved ? ' · Saved to your account' : ''}`}
              </span>
            </div>

            <MarkdownResponse content={response} />

            {loading && (
              <span style={{
                display: 'inline-block',
                width: 2,
                height: 14,
                background: '#6366f1',
                marginLeft: 2,
                verticalAlign: 'text-bottom',
              }} />
            )}
          </div>
        )}

        {/* Chart Dashboard */}
        {chartData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ marginTop: 32 }}
          >
            {/* FINOPS DASHBOARD */}
            {chartData.costBreakdown && (
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: 'white' }}>
                  📊 Your Cost Dashboard
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, borderTop: '3px solid #ef4444', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>IDENTIFIED WASTE</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#ef4444' }}>
                      ${chartData.wasteAmount?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>per month</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, borderTop: '3px solid #22c55e', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>POTENTIAL SAVING</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#22c55e' }}>
                      {chartData.savingsPercent}%
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>of your monthly bill</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, borderTop: '3px solid #f59e0b', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>RISK SCORE</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b' }}>
                      {chartData.riskScore}/10
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>financial risk level</div>
                  </motion.div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                  <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#a0a0b0' }}>
                      COST BY SERVICE
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={chartData.costBreakdown}
                          dataKey="cost"
                          nameKey="service"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ service, percent }: { service: string; percent: number }) =>
                            `${service} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {chartData.costBreakdown.map((_: any, i: number) => (
                            <Cell key={i} fill={['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#0078D4'][i % 5]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: any) => [`$${v.toLocaleString()}`, 'Cost']}
                          contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#a0a0b0' }}>
                      QUICK WIN SAVINGS
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData.actionItems} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis type="number" stroke="#a0a0b0" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                        <YAxis type="category" dataKey="action" stroke="#a0a0b0" tick={{ fontSize: 10 }} width={140} />
                        <Tooltip
                          formatter={(v: any) => [`$${v}/month`, 'Saving']}
                          contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8 }}
                        />
                        <Bar dataKey="saving" fill="#22c55e" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* ARCHITECTURE DASHBOARD */}
            {chartData.providerScore && (
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: 'white' }}>
                  🏗️ Architecture Dashboard
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, borderTop: '3px solid #6366f1', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>RECOMMENDED</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#6366f1' }}>{chartData.provider}</div>
                    <div style={{ fontSize: 20, color: '#22c55e', fontWeight: 700 }}>{chartData.providerScore}% match</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, borderTop: '3px solid #22c55e', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>MONTHLY COST</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e' }}>
                      ${chartData.totalMonthlyLow?.toLocaleString()} – ${chartData.totalMonthlyHigh?.toLocaleString()}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, borderTop: '3px solid #f59e0b', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>TIME TO LAUNCH</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b' }}>
                      {chartData.timeToLaunchWeeks}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>weeks</div>
                  </motion.div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#a0a0b0' }}>
                      PROVIDER COMPARISON
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData.alternativeScores}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#a0a0b0" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#a0a0b0" domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(v: any) => [`${v}% match`, '']}
                          contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8 }}
                        />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {chartData.alternativeScores?.map((_: any, i: number) => (
                            <Cell key={i} fill={i === 0 ? '#6366f1' : '#ffffff20'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#a0a0b0' }}>
                      MONTHLY COST BY SERVICE
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData.services}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#a0a0b0" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#a0a0b0" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                        <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8 }} />
                        <Bar dataKey="monthlyLow" name="Low estimate" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="monthlyHigh" name="High estimate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* MIGRATION DASHBOARD */}
            {chartData.migrationCostLow && (
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: 'white' }}>
                  🔄 Migration Dashboard
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
                  {[
                    { label: 'COMPLEXITY', value: chartData.complexity, color: chartData.complexityScore > 7 ? '#ef4444' : chartData.complexityScore > 4 ? '#f59e0b' : '#22c55e' },
                    { label: 'MIGRATION COST', value: `$${(chartData.migrationCostLow / 1000).toFixed(0)}k–$${(chartData.migrationCostHigh / 1000).toFixed(0)}k`, color: '#f59e0b' },
                    { label: 'MONTHLY SAVING', value: `$${Math.abs(chartData.monthlyDelta)}/mo`, color: chartData.monthlyDelta < 0 ? '#22c55e' : '#ef4444' },
                    { label: 'BREAK EVEN', value: `${chartData.breakEvenMonths} months`, color: '#6366f1' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      style={{ background: '#1a1a2e', borderRadius: 16, padding: 20, borderTop: `3px solid ${stat.color}`, textAlign: 'center' }}
                    >
                      <div style={{ fontSize: 11, color: '#a0a0b0', marginBottom: 8 }}>{stat.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    </motion.div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#a0a0b0' }}>
                      MIGRATION PROGRESS TIMELINE
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData.weeklyPlan}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="week" stroke="#a0a0b0" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#a0a0b0" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(v: any) => [`${v}% complete`, '']}
                          contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8 }}
                        />
                        <Bar dataKey="completion" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#a0a0b0' }}>
                      RISK ASSESSMENT
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData.risks} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis type="number" domain={[0, 10]} stroke="#a0a0b0" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" stroke="#a0a0b0" tick={{ fontSize: 11 }} width={100} />
                        <Tooltip
                          formatter={(v: any) => [`${v}/10 severity`, '']}
                          contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8 }}
                        />
                        <Bar dataKey="severity" radius={[0, 4, 4, 0]}>
                          {chartData.risks?.map((_: any, i: number) => (
                            <Cell key={i} fill={['#ef4444', '#f59e0b', '#22c55e'][i]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
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
            <button
              onClick={() => router.push('/advisor')}
              style={{
                background: '#6366f1',
                border: 'none',
                borderRadius: 10,
                padding: '12px 24px',
                color: 'white',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Get Full Recommendation →
            </button>
            <button
              onClick={() => router.push('/chat')}
              style={{
                background: 'transparent',
                border: '1px solid #ffffff30',
                borderRadius: 10,
                padding: '12px 24px',
                color: 'white',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Ask Follow-up Questions
            </button>
            <button
              onClick={() => {
                reset()
                setSelectedMode(null)
              }}
              style={{
                background: 'transparent',
                border: '1px solid #ffffff15',
                borderRadius: 10,
                padding: '12px 24px',
                color: '#a0a0b0',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Start New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
