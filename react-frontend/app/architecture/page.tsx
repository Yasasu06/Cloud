'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import NextActionCards from '@/components/NextActionCards'

interface Service {
  name: string
  tier: 'network' | 'compute' | 'database' | 'storage' | 'security'
  provider: string
  cost?: string
  connects?: string[]
}

interface ArchResult {
  services: Service[]
  summary: string
  monthlyCost: string
}

const TIER_COLORS: Record<Service['tier'], string> = {
  network:      '#0078D4',
  compute:      '#6366f1',
  database:     '#f59e0b',
  storage:      '#22c55e',
  security:     '#ef4444',
}

const TIER_ORDER: Service['tier'][] = ['network', 'security', 'compute', 'database', 'storage']

const BOX_W = 140
const BOX_H = 56
const SVG_W = 800
const H_GAP = 24
const V_GAP = 56

function computeLayout(services: Service[]) {
  const byTier: Partial<Record<Service['tier'], Service[]>> = {}
  for (const s of services) {
    if (!byTier[s.tier]) byTier[s.tier] = []
    byTier[s.tier]!.push(s)
  }
  const positions: Record<string, { x: number; y: number }> = {}
  let y = 40
  for (const tier of TIER_ORDER) {
    const items = byTier[tier] ?? []
    if (!items.length) continue
    const rowW = items.length * BOX_W + (items.length - 1) * H_GAP
    let x = (SVG_W - rowW) / 2
    for (const item of items) {
      positions[item.name] = { x, y }
      x += BOX_W + H_GAP
    }
    y += BOX_H + V_GAP
  }
  return { positions, svgHeight: y }
}

function connPath(x1: number, y1: number, x2: number, y2: number) {
  const midY = (y1 + y2) / 2
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`
}

export default function ArchitecturePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [description, setDescription] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ArchResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialQuery && !result && !loading) {
      generate(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generate(overrideText?: string) {
    const text = (overrideText ?? description).trim()
    if (!text) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 800,
          messages: [
            {
              role: 'system',
              content: `You are a cloud architect. Given a project description, return ONLY valid JSON (no markdown) with this exact structure:
{
  "services": [
    { "name": "string", "tier": "network|compute|database|storage|security", "provider": "AWS|Azure|GCP|Cloudflare|Hetzner|Render|Railway|DigitalOcean|Generic", "cost": "$X/mo", "connects": ["OtherServiceName"] }
  ],
  "summary": "one sentence describing the architecture",
  "monthlyCost": "$X–Y/month estimated"
}
Include 5–9 services. Use realistic cloud service names. Tier must be one of: network, compute, database, storage, security.

ALTERNATIVE PROVIDERS: Recommend alternatives where appropriate — Cloudflare for CDN/edge/zero-egress, Hetzner for cost-sensitive servers (60–80% cheaper than AWS), Render for PaaS, Railway for indie/startup deploys, DigitalOcean for simplicity. Don't default to AWS/Azure/GCP for everything.`,
            },
            { role: 'user', content: text },
          ],
        }),
      })

      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content ?? ''
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')
      const parsed: ArchResult = JSON.parse(jsonMatch[0])
      setResult(parsed)
    } catch {
      setError('Could not generate architecture. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const layout = result ? computeLayout(result.services) : null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            ARCHITECTURE GENERATOR
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 12 }}>
            Visualize your cloud architecture
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            Describe your project and get an instant architecture diagram with cost estimates.
          </p>
        </div>

        {/* Trust bar */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
          {['🔒 Vendor Neutral', '📊 Real pricing data', '⚡ Powered by Llama 3.3 70B', '🌍 Covers 12+ providers'].map(item => (
            <span key={item} style={{ color: '#666', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>{item}</span>
          ))}
        </div>

        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 12, color: '#a0a0b0' }}>
          💡 <strong style={{ color: 'white', fontWeight: 600 }}>Not sure of your stack?</strong> Try the{' '}
          <a href="/advisor" style={{ color: '#818cf8' }}>/advisor</a> quiz to discover what you need.
        </div>

        <div style={{ background: '#1a1a2e', borderRadius: 20, padding: '28px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 12 }}>
            DESCRIBE YOUR PROJECT
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. A SaaS app with user auth, PostgreSQL database, REST API, file uploads, and a React frontend. We expect 10k users/month on AWS."
            rows={4}
            style={{ width: '100%', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 16px', color: 'white', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
          />
          <button
            onClick={() => generate()}
            disabled={loading || !description.trim()}
            style={{ marginTop: 16, background: loading ? '#333' : '#6366f1', border: 'none', borderRadius: 12, padding: '14px 32px', color: 'white', fontWeight: 700, fontSize: 15, cursor: loading || !description.trim() ? 'not-allowed' : 'pointer', opacity: !description.trim() ? 0.5 : 1, transition: 'background 0.15s' }}
          >
            {loading ? 'Generating…' : 'Generate Architecture →'}
          </button>
        </div>

        {loading && <DisclaimerBanner />}
        {loading && (
          <>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4 } 50% { opacity: 1 } }`}</style>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(99,102,241,0.08)', borderRadius: 12, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', animation: 'pulse 1s infinite', flexShrink: 0 }} />
              <span style={{ color: '#a0a0b0', fontSize: 14 }}>AI is analyzing your situation...</span>
              <span style={{ color: '#555', fontSize: 12, marginLeft: 'auto', whiteSpace: 'nowrap' }}>Usually takes 15–30 seconds</span>
            </div>
            <div style={{ background: '#111118', borderRadius: 16, padding: 28, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
              {[85, 70, 90, 60, 75, 55].map((w, i) => (
                <div key={i} style={{ height: 16, background: 'rgba(255,255,255,0.07)', borderRadius: 8, marginBottom: 12, width: `${w}%`, animation: 'pulse 1.5s infinite', animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, color: '#f87171', fontSize: 14 }}>
            {error}
          </div>
        )}

        {result && layout && (
          <div>
            {/* Tier legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {TIER_ORDER.map(tier => (
                <span key={tier} style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: `rgba(${hexRgb(TIER_COLORS[tier])},0.12)`, color: TIER_COLORS[tier], border: `1px solid rgba(${hexRgb(TIER_COLORS[tier])},0.3)`, letterSpacing: 0.5 }}>
                  {tier.toUpperCase()}
                </span>
              ))}
            </div>

            {/* SVG diagram */}
            <div style={{ background: '#111118', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', padding: '20px', marginBottom: 24, overflowX: 'auto' }}>
              <svg width={SVG_W} height={layout.svgHeight} viewBox={`0 0 ${SVG_W} ${layout.svgHeight}`} style={{ display: 'block', maxWidth: '100%' }}>
                {/* Connection lines */}
                {result.services.map(svc =>
                  (svc.connects ?? []).map(target => {
                    const from = layout.positions[svc.name]
                    const to = layout.positions[target]
                    if (!from || !to) return null
                    return (
                      <path
                        key={`${svc.name}-${target}`}
                        d={connPath(from.x + BOX_W / 2, from.y + BOX_H, to.x + BOX_W / 2, to.y)}
                        fill="none"
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                      />
                    )
                  })
                )}
                {/* Service boxes */}
                {result.services.map(svc => {
                  const pos = layout.positions[svc.name]
                  if (!pos) return null
                  const color = TIER_COLORS[svc.tier]
                  return (
                    <g key={svc.name}>
                      <rect x={pos.x} y={pos.y} width={BOX_W} height={BOX_H} rx={10} ry={10} fill={`rgba(${hexRgb(color)},0.1)`} stroke={color} strokeWidth={1.5} />
                      <text x={pos.x + BOX_W / 2} y={pos.y + 20} textAnchor="middle" fill="white" fontSize={11} fontWeight="700" fontFamily="system-ui, sans-serif">{svc.name}</text>
                      <text x={pos.x + BOX_W / 2} y={pos.y + 35} textAnchor="middle" fill={color} fontSize={9} fontFamily="system-ui, sans-serif">{svc.provider}</text>
                      {svc.cost && <text x={pos.x + BOX_W / 2} y={pos.y + 47} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8} fontFamily="system-ui, sans-serif">{svc.cost}</text>}
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Summary + cost */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
              <div className="glass-card" style={{ padding: '20px 24px' }}>
                <p style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>ARCHITECTURE SUMMARY</p>
                <p style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.6 }}>{result.summary}</p>
              </div>
              <div className="glass-card" style={{ padding: '20px 24px', textAlign: 'center', minWidth: 160 }}>
                <p style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>EST. MONTHLY COST</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>{result.monthlyCost}</p>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #1a1a2e)', borderRadius: 16, padding: '24px 28px', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 6, letterSpacing: 1 }}>NEXT STEP</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Get a detailed cost breakdown</h3>
                <p style={{ color: '#a0a0b0', fontSize: 13 }}>AI analysis of your specific architecture with optimization recommendations.</p>
              </div>
              <button onClick={() => router.push('/analyze?mode=architect')} style={{ background: '#6366f1', border: 'none', borderRadius: 12, padding: '13px 28px', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Analyze This Architecture →
              </button>
            </div>
            <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #333' }}>
              <p style={{ color: '#555', fontSize: 11, margin: 0 }}>
                ℹ️ Recommendations are based on published cloud provider pricing and industry benchmarks. Actual savings may vary. Always verify recommendations with your cloud provider before making changes to production infrastructure.
              </p>
            </div>

            <NextActionCards actions={[
              { icon: '💸', title: 'Estimate Costs',  desc: 'Live pricing for stack',     href: '/cost-intelligence' },
              { icon: '🔄', title: 'Plan Migration',  desc: 'Provider switch planner',     href: '/migrate' },
              { icon: '✓',  title: 'Validate Decision', desc: 'Pre-decision sanity check',  href: '/sanity-check' },
            ]} />
          </div>
        )}
      </div>
    </div>
  )
}

function hexRgb(hex: string): string {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`
}
