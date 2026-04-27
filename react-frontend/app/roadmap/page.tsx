'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useJourney } from '@/lib/journeyContext'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/posthog'

const ROADMAP_SYSTEM_PROMPT = `You are a senior cloud architect creating a deployment roadmap. Generate a precise 8-week action plan.

For each week provide:
- Week number and title
- 3-4 specific tasks with exact service names
- One potential risk to watch for
- Success metric for that week

Be specific. Use real service names. Give real commands where helpful.
Format each week clearly with WEEK X: Title on its own line.
Keep total response under 600 words.`

const PROVIDERS = ['AWS', 'Azure', 'GCP', 'DigitalOcean', 'Oracle Cloud']
const WORKLOADS = [
  'Web Application', 'AI/ML Project', 'E-commerce Platform',
  'Mobile Backend', 'Data Analytics', 'Gaming Server',
  'Healthcare App', 'Enterprise SaaS',
]
const TEAM_SIZES = ['Solo developer', 'Small team (2-5)', 'Medium team (6-20)', 'Large team (20+)']

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#1a1a2e',
  border: '1px solid #ffffff15',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'white',
  fontSize: 14,
  outline: 'none',
}

export default function RoadmapPage() {
  const router = useRouter()
  const { journey } = useJourney()
  const [provider, setProvider] = useState(journey?.recommendedProvider || 'AWS')
  const [workload, setWorkload] = useState(journey?.workload || 'Web Application')
  const [teamSize, setTeamSize] = useState(journey?.teamSize || 'Small team (2-5)')
  const [budget, setBudget] = useState('$500-$2000/month')
  const [roadmap, setRoadmap] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function generateRoadmap() {
    if (loading) return
    setLoading(true)
    setRoadmap('')
    setDone(false)
    trackEvent('roadmap_generated', { provider, workload, teamSize })

    const prompt = `Generate an 8-week deployment roadmap for:
- Cloud Provider: ${provider}
- Workload Type: ${workload}
- Team Size: ${teamSize}
- Monthly Budget: ${budget}

Create a specific, actionable week-by-week plan.`

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1200,
          stream: true,
          messages: [
            { role: 'system', content: ROADMAP_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
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
              setRoadmap(fullText)
            } catch {
              // partial chunk — skip
            }
          }
        }
      }
      setDone(true)
    } catch {
      setRoadmap('Failed to generate roadmap. Please try again.')
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '100px 24px 60px' }}>

        <div style={{ marginBottom: 40 }}>
          <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>
            DEPLOYMENT ROADMAP
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Your 8-Week Cloud Launch Plan
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16 }}>
            Get a specific, week-by-week action plan tailored to your provider, workload, and team size.
          </p>
        </div>

        {journey && (
          <div style={{
            background: '#1a1a2e',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            borderLeft: '4px solid #6366f1',
          }}>
            <div style={{ fontSize: 12, color: '#a0a0b0' }}>FROM YOUR CLOUD ADVISOR</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>
              {journey.recommendedProvider} recommended · Pre-filled below
            </div>
          </div>
        )}

        <div style={{
          background: '#1a1a2e',
          borderRadius: 16,
          padding: 28,
          border: '1px solid #ffffff08',
          marginBottom: 24,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ color: '#a0a0b0', fontSize: 12, display: 'block', marginBottom: 8 }}>
                CLOUD PROVIDER
              </label>
              <select value={provider} onChange={e => setProvider(e.target.value)} style={selectStyle}>
                {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#a0a0b0', fontSize: 12, display: 'block', marginBottom: 8 }}>
                WORKLOAD TYPE
              </label>
              <select value={workload} onChange={e => setWorkload(e.target.value)} style={selectStyle}>
                {WORKLOADS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#a0a0b0', fontSize: 12, display: 'block', marginBottom: 8 }}>
                TEAM SIZE
              </label>
              <select value={teamSize} onChange={e => setTeamSize(e.target.value)} style={selectStyle}>
                {TEAM_SIZES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#a0a0b0', fontSize: 12, display: 'block', marginBottom: 8 }}>
                MONTHLY BUDGET
              </label>
              <select value={budget} onChange={e => setBudget(e.target.value)} style={selectStyle}>
                {['Under $100/month', '$100-$500/month', '$500-$2000/month', '$2000-$10000/month', '$10000+/month'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={generateRoadmap}
            disabled={loading}
            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-3"
          >
            {loading ? 'Generating your roadmap...' : 'Generate My 8-Week Roadmap →'}
          </Button>
        </div>

        {(roadmap || loading) && (
          <div style={{
            background: '#1a1a2e',
            borderRadius: 16,
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
                {loading ? 'Generating your personalized roadmap...' : `8-week roadmap for ${provider} — ${workload}`}
              </span>
            </div>

            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.9, fontSize: 14, color: '#e0e0e0', fontFamily: 'monospace' }}>
              {roadmap}
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
                  onClick={() => router.push('/planner')}
                  className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold"
                >
                  Estimate Costs →
                </Button>
                <Button
                  onClick={() => router.push('/chat')}
                  variant="outline"
                  className="border-[#ffffff30] text-white hover:bg-[#ffffff10]"
                >
                  Ask AI Questions
                </Button>
                <Button
                  onClick={() => { setRoadmap(''); setDone(false) }}
                  variant="outline"
                  className="border-[#ffffff20] text-[#a0a0b0] hover:bg-[#ffffff10]"
                >
                  Regenerate
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
