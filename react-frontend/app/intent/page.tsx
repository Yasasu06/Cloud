'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useJourney } from '@/lib/journeyContext'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/posthog'

const EXAMPLES = [
  "We're on AWS, spending $12k/month, 5 engineers. Our bill doubled last quarter and we don't know why.",
  "Azure bill is $5,000/month. We have a staging environment nobody uses. How do we find the waste?",
  "Running on GCP for our ML pipeline. Spending $8k/month on compute but our models only train twice a week.",
  "Small startup on AWS free tier but it expired. Getting our first real bill soon — what should I expect?",
  "We use AWS for everything. Someone said we should look at reserved instances but I don't understand them.",
  "Healthcare app on Azure, $3k/month. Need HIPAA compliance but not sure if we're configured correctly.",
]

const INTENT_SYSTEM_PROMPT = `You are a senior cloud architect and FinOps consultant with 15 years of experience. When someone describes their cloud situation, you give them the specific, actionable analysis a $300/hour consultant would give — but in plain English.

ALWAYS structure your response with these exact sections:

**📊 YOUR SITUATION SUMMARY**
Restate what you understand about their setup in 2 sentences. Show you understood their specific details.

**💸 WHERE YOUR MONEY IS GOING**
Based on their cloud provider and spend level, identify the 3-4 most likely cost drivers. Be specific — name actual services (EC2, RDS, Data Transfer, NAT Gateway, etc.) with estimated costs. If they mentioned a specific bill issue, address it directly.

**🗑️ WHAT YOU CAN PROBABLY ELIMINATE**
List 3-5 specific resources or configurations that are commonly wasted at their spend level and usage pattern. For each one:
- What it is in plain English
- How to find it
- Estimated monthly savings

**⚡ YOUR TOP 3 ACTIONS THIS WEEK**
Specific, ordered steps they can take immediately. Include:
- The exact action
- Which AWS/Azure/GCP console page to find it
- Expected time to complete
- Expected monthly saving

**⚠️ YOUR BIGGEST RISK**
One specific technical or financial risk based on what they told you. Be honest about what could go wrong.

**💰 COST AT SCALE**
If they mentioned user counts or growth — show what their bill looks like at 10x their current scale. Use real multipliers.

**🏆 HONEST RECOMMENDATION**
Should they stay on their current provider or consider switching? Be direct. If switching makes sense, say so and explain the migration cost vs savings tradeoff.

Rules:
- Use real AWS/Azure/GCP service names
- Give real dollar estimates where possible
- Never say "it depends" without explaining what it depends on
- If you don't know something specific, say so — don't guess
- Maximum 500 words total
- Write for a non-technical founder who is smart but not an engineer`

export default function IntentPage() {
  const router = useRouter()
  useJourney()
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function analyzeIntent() {
    if (!input.trim() || loading) return
    setLoading(true)
    setResponse('')
    setDone(false)
    trackEvent('intent_analyzed', { input_length: input.length })

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          stream: true,
          messages: [
            { role: 'system', content: INTENT_SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Analyze this project and give me a complete cloud recommendation: ${input}`,
            },
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
              const text = parsed.choices?.[0]?.delta?.content || ''
              fullText += text
              setResponse(fullText)
            } catch {
              // partial chunk — skip
            }
          }
        }
      }
      setDone(true)
    } catch {
      setResponse('Sorry, analysis failed. Please try again.')
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '100px 24px 60px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 13,
            color: '#6366f1',
            fontWeight: 600,
            marginBottom: 16,
            letterSpacing: 1,
          }}>
            AI-POWERED ANALYSIS
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            Describe your project.<br />
            <span style={{ color: '#6366f1' }}>Get your cloud blueprint.</span>
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 18, maxWidth: 500, margin: '0 auto' }}>
            Tell us what you&apos;re building in plain English.
            No forms, no jargon. Just describe your idea.
          </p>
        </div>

        <div style={{
          background: '#1a1a2e',
          borderRadius: 20,
          padding: 32,
          border: '1px solid #ffffff08',
          marginBottom: 32,
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. I want to build a secure healthcare app for 500 doctors in Europe that handles patient records and needs HIPAA compliance..."
            rows={4}
            style={{
              width: '100%',
              background: '#0a0a0f',
              border: '1px solid #ffffff15',
              borderRadius: 12,
              padding: '16px',
              color: 'white',
              fontSize: 16,
              lineHeight: 1.6,
              resize: 'none',
              outline: 'none',
              marginBottom: 16,
              boxSizing: 'border-box',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.metaKey) analyzeIntent()
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666', fontSize: 13 }}>Press ⌘+Enter to analyze</span>
            <Button
              onClick={analyzeIntent}
              disabled={loading || !input.trim()}
              className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold px-8"
            >
              {loading ? 'Analyzing...' : 'Get My Cloud Blueprint →'}
            </Button>
          </div>
        </div>

        {!input && !response && (
          <div>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
              TRY AN EXAMPLE
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => setInput(ex)}
                  style={{
                    background: '#1a1a2e',
                    border: '1px solid #ffffff10',
                    borderRadius: 10,
                    padding: '12px 16px',
                    color: '#a0a0b0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 13,
                    lineHeight: 1.5,
                    transition: 'all 0.15s',
                  }}
                >
                  &ldquo;{ex}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {(response || loading) && (
          <div style={{
            background: '#1a1a2e',
            borderRadius: 20,
            padding: 32,
            border: '1px solid #ffffff08',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: loading ? '#6366f1' : '#22c55e',
              }} />
              <span style={{ color: '#a0a0b0', fontSize: 14 }}>
                {loading ? 'Analyzing your project...' : 'Analysis complete'}
              </span>
            </div>

            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 15, color: '#e0e0e0' }}>
              {response}
              {loading && (
                <span style={{
                  display: 'inline-block',
                  width: 2,
                  height: 16,
                  background: '#6366f1',
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                }} />
              )}
            </div>

            {done && (
              <div style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: '1px solid #ffffff08',
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}>
                <Button
                  onClick={() => router.push('/advisor')}
                  className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold"
                >
                  Get Full Recommendation →
                </Button>
                <Button
                  onClick={() => router.push('/planner')}
                  variant="outline"
                  className="border-[#ffffff30] text-white hover:bg-[#ffffff10]"
                >
                  Estimate Costs
                </Button>
                <Button
                  onClick={() => { setInput(''); setResponse(''); setDone(false) }}
                  variant="outline"
                  className="border-[#ffffff20] text-[#a0a0b0] hover:bg-[#ffffff10]"
                >
                  Try Another Project
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
