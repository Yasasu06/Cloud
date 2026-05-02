'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'planner' | 'egress'

// ─── Egress Calculator (tab 2) ────────────────────────────────────────────────

type EgressProvider = 'AWS' | 'Azure' | 'GCP' | 'DigitalOcean'
const EGRESS_PROVIDERS: EgressProvider[] = ['AWS', 'Azure', 'GCP', 'DigitalOcean']
const EGRESS_TIERS: Record<EgressProvider, { limit: number; rate: number }[]> = {
  AWS:          [{ limit: 10_000, rate: 0.09 }, { limit: 50_000, rate: 0.085 }, { limit: Infinity, rate: 0.07 }],
  Azure:        [{ limit: 10_000, rate: 0.087 }, { limit: 50_000, rate: 0.083 }, { limit: Infinity, rate: 0.07 }],
  GCP:          [{ limit: 10_000, rate: 0.08 }, { limit: 150_000, rate: 0.06 }, { limit: Infinity, rate: 0.05 }],
  DigitalOcean: [{ limit: Infinity, rate: 0.01 }],
}
const EGRESS_PROVIDER_COLOR: Record<EgressProvider, string> = {
  AWS: '#f59e0b', Azure: '#3b82f6', GCP: '#22c55e', DigitalOcean: '#0080ff',
}
const MONTHLY_SAVINGS: Record<EgressProvider, Record<EgressProvider, number>> = {
  AWS:          { AWS: 0, Azure: 0.003, GCP: 0.004, DigitalOcean: 0.015 },
  Azure:        { AWS: 0.002, Azure: 0, GCP: 0.003, DigitalOcean: 0.014 },
  GCP:          { AWS: 0.001, Azure: 0.002, GCP: 0, DigitalOcean: 0.013 },
  DigitalOcean: { AWS: -0.01, Azure: -0.009, GCP: -0.008, DigitalOcean: 0 },
}

function calcEgress(provider: EgressProvider, gb: number): number {
  const tiers = EGRESS_TIERS[provider]
  let cost = 0, remaining = gb, prevLimit = 0
  for (const tier of tiers) {
    const tierGB = Math.min(remaining, tier.limit - prevLimit)
    if (tierGB <= 0) break
    cost += tierGB * tier.rate
    remaining -= tierGB
    prevLimit = tier.limit
    if (remaining <= 0) break
  }
  return cost
}

function useAnimVal(target: number, duration = 500): number {
  const [v, setV] = useState(target)
  const raf = useRef<number | null>(null)
  const prev = useRef(target)
  useEffect(() => {
    const from = prev.current, to = target
    if (from === to) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - t, 3)
      setV(from + (to - from) * e)
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else { prev.current = to; setV(to) }
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])
  return v
}

function fmtE(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function EgressCalculator() {
  const [from, setFrom] = useState<EgressProvider>('AWS')
  const [to, setTo] = useState<EgressProvider>('GCP')
  const [gb, setGb] = useState(5000)

  const egress = calcEgress(from, gb)
  const monthlySaving = Math.max(0, MONTHLY_SAVINGS[from][to] * gb)
  const breakEven = monthlySaving > 0 ? egress / monthlySaving : Infinity
  const animEgress = useAnimVal(egress)
  const animSaving = useAnimVal(monthlySaving)

  const selStyle: React.CSSProperties = {
    background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 14px', color: 'white',
    fontSize: 15, fontWeight: 600, outline: 'none', cursor: 'pointer', flex: 1,
  }

  const verdictColor = breakEven <= 6 ? '#22c55e' : breakEven <= 12 ? '#f59e0b' : '#ef4444'
  const verdictLabel = monthlySaving <= 0 ? 'No savings — destination costs more'
    : breakEven <= 6 ? 'Worth it — migrate now'
    : breakEven <= 12 ? 'Consider carefully'
    : 'Probably not worth it'

  return (
    <div>
      <div style={{ background: '#1a1a2e', borderRadius: 16, padding: '24px 24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>CURRENT PROVIDER</label>
            <select value={from} onChange={e => { const v = e.target.value as EgressProvider; setFrom(v); if (v === to) setTo(EGRESS_PROVIDERS.find(p => p !== v) ?? 'GCP') }} style={selStyle}>
              {EGRESS_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>DESTINATION</label>
            <select value={to} onChange={e => setTo(e.target.value as EgressProvider)} style={selStyle}>
              {EGRESS_PROVIDERS.filter(p => p !== from).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1 }}>DATA VOLUME</label>
            <span style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>{gb >= 1000 ? `${(gb / 1000).toFixed(1)} TB` : `${gb} GB`}</span>
          </div>
          <input type="range" min={0} max={100000} step={100} value={gb} onChange={e => setGb(Number(e.target.value))} style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer', height: 6 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#333', marginTop: 4 }}>
            <span>0</span><span>25 TB</span><span>50 TB</span><span>75 TB</span><span>100 TB</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>EGRESS FROM {from}</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: EGRESS_PROVIDER_COLOR[from] }}>{fmtE(animEgress)}</div>
          <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>one-time migration fee</div>
        </div>
        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>MONTHLY SAVINGS</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: monthlySaving > 0 ? '#22c55e' : '#ef4444' }}>
            {monthlySaving > 0 ? '+' : ''}{fmtE(animSaving)}
          </div>
          <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>at {to} vs {from}</div>
        </div>
        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>BREAK-EVEN</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'white' }}>
            {monthlySaving > 0 ? (breakEven < 999 ? `${breakEven.toFixed(1)}mo` : '∞') : '—'}
          </div>
          <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>months to recover cost</div>
        </div>
      </div>

      <div style={{ background: `rgba(${verdictColor === '#22c55e' ? '34,197,94' : verdictColor === '#f59e0b' ? '245,158,11' : '239,68,68'},0.08)`, border: `1px solid ${verdictColor}30`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>{verdictColor === '#22c55e' ? '✓' : verdictColor === '#f59e0b' ? '⚠' : '✗'}</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: verdictColor }}>{verdictLabel}</div>
          {monthlySaving > 0 && breakEven < 999 && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              {fmtE(egress)} upfront · recover in {breakEven.toFixed(1)} months of {fmtE(monthlySaving)}/mo savings
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Migration Planner types ───────────────────────────────────────────────────

const FROM_PROVIDERS = ['AWS', 'Azure', 'GCP', 'On-premise'] as const
const TO_PROVIDERS = ['AWS', 'Azure', 'GCP', 'DigitalOcean', 'Hetzner'] as const

type FromProvider = typeof FROM_PROVIDERS[number]
type ToProvider = typeof TO_PROVIDERS[number]
type Complexity = 'Easy' | 'Medium' | 'Hard' | 'Very Hard'

interface MigrationInfo {
  complexity: Complexity
  costRange: string
  monthlySaving: string
  risks: [string, string, string]
}

const COMPLEXITY_COLOR: Record<Complexity, string> = {
  'Easy': '#22c55e',
  'Medium': '#f59e0b',
  'Hard': '#f97316',
  'Very Hard': '#ef4444',
}

const DATA: Partial<Record<string, MigrationInfo>> = {
  'AWS→Azure': {
    complexity: 'Hard',
    costRange: '$15,000 – $45,000',
    monthlySaving: 'Save $300 – $800/month',
    risks: [
      'IAM → Entra ID mapping requires full identity rewrite',
      'Lambda → Azure Functions rewrites often take 2–3x longer than expected',
      'Data egress charges during transition can add $2,000–$8,000 one-time',
    ],
  },
  'AWS→GCP': {
    complexity: 'Medium',
    costRange: '$10,000 – $30,000',
    monthlySaving: 'Save $800 – $2,500/month (ML workloads)',
    risks: [
      'BigQuery learning curve — team retraining typically takes 4–6 weeks',
      'GKE vs EKS networking model differences cause unexpected downtime',
      'CloudFront → Cloud CDN config gaps can expose origin servers',
    ],
  },
  'AWS→DigitalOcean': {
    complexity: 'Medium',
    costRange: '$5,000 – $20,000',
    monthlySaving: 'Save $2,000 – $5,000/month',
    risks: [
      'No equivalent to Lambda, SQS, or SNS — significant refactoring required',
      'No enterprise SLA — 99.99% uptime guarantee not available',
      'Managed Kubernetes (DOKS) lacks EKS auto-scaling features',
    ],
  },
  'AWS→Hetzner': {
    complexity: 'Hard',
    costRange: '$8,000 – $25,000',
    monthlySaving: 'Save $3,000 – $7,000/month',
    risks: [
      'EU-only regions — not viable for US or APAC latency requirements',
      'No managed databases or cache — you own all patching and backups',
      'Compliance certifications (SOC 2, HIPAA) are your responsibility',
    ],
  },
  'Azure→AWS': {
    complexity: 'Hard',
    costRange: '$15,000 – $40,000',
    monthlySaving: 'Save $200 – $1,000/month',
    risks: [
      'Entra ID → IAM restructure is the most complex identity migration path',
      'Azure DevOps pipelines need full rebuild in CodePipeline or GitHub Actions',
      'Microsoft licensing costs may actually increase on AWS (no EA discounts)',
    ],
  },
  'Azure→GCP': {
    complexity: 'Medium',
    costRange: '$12,000 – $35,000',
    monthlySaving: 'Save $1,000 – $3,000/month',
    risks: [
      'Entra ID has no direct GCP equivalent — need third-party IdP',
      'Azure PaaS services (Service Bus, Logic Apps) have no GCP drop-in',
      'Azure Monitor → Cloud Operations Suite gap causes blind spots',
    ],
  },
  'Azure→DigitalOcean': {
    complexity: 'Medium',
    costRange: '$6,000 – $18,000',
    monthlySaving: 'Save $1,500 – $4,000/month',
    risks: [
      'No Azure Active Directory equivalent — SSO and RBAC must be rebuilt',
      'Enterprise compliance (FedRAMP, HIPAA BAA) not available on DigitalOcean',
      'AKS managed upgrades and auto-scaling not available in DOKS',
    ],
  },
  'Azure→Hetzner': {
    complexity: 'Hard',
    costRange: '$8,000 – $22,000',
    monthlySaving: 'Save $2,500 – $6,000/month',
    risks: [
      'EU-only — rules out global deployments for non-European traffic',
      'No hybrid cloud model — Azure Arc integrations break completely',
      'Full infrastructure management shift requires dedicated DevOps hire',
    ],
  },
  'GCP→AWS': {
    complexity: 'Hard',
    costRange: '$20,000 – $55,000',
    monthlySaving: 'Cost increase $500 – $2,000/month',
    risks: [
      'BigQuery → Redshift/Athena is lossy — query performance often degrades',
      'Cloud Spanner has no AWS equivalent — Aurora Global is an imperfect substitute',
      'Vertex AI ML pipelines are significantly harder to replicate on SageMaker',
    ],
  },
  'GCP→Azure': {
    complexity: 'Medium',
    costRange: '$14,000 – $38,000',
    monthlySaving: 'Save $500 – $1,500/month',
    risks: [
      'BigQuery → Synapse Analytics migration often loses 20–30% query performance',
      'GCP ML tooling (Vertex AI, AutoML) is harder to replace on Azure',
      'Pub/Sub → Event Hubs requires rewrite of all consumer and producer code',
    ],
  },
  'GCP→DigitalOcean': {
    complexity: 'Medium',
    costRange: '$8,000 – $22,000',
    monthlySaving: 'Save $1,500 – $4,500/month',
    risks: [
      'No BigQuery equivalent — analytics workloads need full stack replacement',
      'GKE Autopilot features not available in DOKS — manual node management',
      'Vertex AI and ML pipelines are completely stranded with no migration path',
    ],
  },
  'GCP→Hetzner': {
    complexity: 'Hard',
    costRange: '$6,000 – $18,000',
    monthlySaving: 'Save $2,500 – $6,500/month',
    risks: [
      'BigQuery has no self-hosted equivalent — complete analytics rewrite required',
      'EU-only regions eliminate global multi-region architectures',
      'Every GCP managed service (Spanner, Pub/Sub, Vertex) must be self-hosted',
    ],
  },
  'On-premise→AWS': {
    complexity: 'Very Hard',
    costRange: '$50,000 – $200,000',
    monthlySaving: 'Cost increase $500 – $5,000/month (OpEx shift)',
    risks: [
      'CapEx → OpEx model shock — monthly bills replace 3-year hardware amortization',
      'Data transfer and egress costs add $1,000–$4,000/month not seen on-prem',
      'Skills gap — average on-prem team needs 6–12 months to reach cloud proficiency',
    ],
  },
  'On-premise→Azure': {
    complexity: 'Very Hard',
    costRange: '$50,000 – $190,000',
    monthlySaving: 'Cost increase $300 – $4,000/month (OpEx shift)',
    risks: [
      'Microsoft EA licensing complexity — cloud pricing may override existing deals',
      'Hybrid setup requires Azure Arc — adds $200–$800/month per connected site',
      'Security perimeter must be redesigned — on-prem firewall rules do not translate',
    ],
  },
  'On-premise→GCP': {
    complexity: 'Very Hard',
    costRange: '$45,000 – $175,000',
    monthlySaving: 'Cost increase $400 – $4,500/month (OpEx shift)',
    risks: [
      'Cultural shift to Google tooling is steep — expect 6+ months of productivity loss',
      'Anthos required for any hybrid model adds $15,000+ per year',
      'Data sovereignty concerns — Google\'s data processing terms differ from on-prem',
    ],
  },
  'On-premise→DigitalOcean': {
    complexity: 'Hard',
    costRange: '$20,000 – $75,000',
    monthlySaving: 'Save $2,000 – $6,000/month vs on-prem',
    risks: [
      'No enterprise SLAs or compliance certifications (HIPAA, FedRAMP unavailable)',
      'Limited to 15 regions — may not meet data residency requirements',
      'All infrastructure self-managed — requires dedicated DevOps investment',
    ],
  },
  'On-premise→Hetzner': {
    complexity: 'Hard',
    costRange: '$15,000 – $60,000',
    monthlySaving: 'Save $3,000 – $8,000/month vs on-prem',
    risks: [
      'EU-only regions — eliminates option for US or APAC deployments',
      'No managed services — databases, cache, queues all self-hosted',
      'Full DevOps team required — Hetzner provides servers, not a managed platform',
    ],
  },
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#1a1a2e',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  padding: '12px 16px',
  color: 'white',
  fontSize: 15,
  outline: 'none',
  cursor: 'pointer',
}

export default function MigrationPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('planner')
  const [from, setFrom] = useState<FromProvider>('AWS')
  const [to, setTo] = useState<ToProvider>('Azure')

  const key = `${from}→${to}`
  const info = from === to ? null : DATA[key] ?? null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ color: '#6366f1', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
            MIGRATION PLANNER
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 12 }}>
            Plan your cloud migration
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16 }}>
            Complexity, costs, savings, and risks for every migration path.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: '#111118', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid rgba(255,255,255,0.06)' }}>
          {([['planner', 'Migration Planner'], ['egress', 'Egress Calculator']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: tab === id ? '#6366f1' : 'transparent',
              color: tab === id ? 'white' : '#555',
              transition: 'all 0.15s',
            }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'egress' && <EgressCalculator />}

        {tab === 'planner' && (<>

        {/* Dropdowns */}
        <div style={{
          background: '#1a1a2e',
          borderRadius: 16,
          padding: '28px 28px',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 32,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 16,
          alignItems: 'end',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1, marginBottom: 8 }}>
              MIGRATING FROM
            </label>
            <select value={from} onChange={e => setFrom(e.target.value as FromProvider)} style={selectStyle}>
              {FROM_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 20, color: '#6366f1', paddingBottom: 14, textAlign: 'center' }}>→</div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1, marginBottom: 8 }}>
              MIGRATING TO
            </label>
            <select value={to} onChange={e => setTo(e.target.value as ToProvider)} style={selectStyle}>
              {TO_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Same provider warning */}
        {from === to && (
          <div style={{
            background: '#1a1a2e',
            borderRadius: 14,
            padding: '24px',
            textAlign: 'center',
            color: '#a0a0b0',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            Select different source and destination providers.
          </div>
        )}

        {/* Results */}
        {info && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Top stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="glass-card" style={{ padding: '22px 24px' }}>
                <div style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>COMPLEXITY</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: COMPLEXITY_COLOR[info.complexity] }}>
                  {info.complexity}
                </div>
              </div>
              <div className="glass-card" style={{ padding: '22px 24px' }}>
                <div style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>MIGRATION COST</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{info.costRange}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>one-time estimate</div>
              </div>
              <div className="glass-card" style={{ padding: '22px 24px' }}>
                <div style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>MONTHLY IMPACT</div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: info.monthlySaving.startsWith('Save') ? '#22c55e' : '#f97316',
                }}>
                  {info.monthlySaving}
                </div>
              </div>
            </div>

            {/* Top 3 risks */}
            <div style={{
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 14,
              padding: '22px 24px',
            }}>
              <div style={{ fontSize: 12, color: '#f87171', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
                TOP 3 RISKS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {info.risks.map((risk, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{
                      background: 'rgba(239,68,68,0.15)',
                      color: '#f87171',
                      fontWeight: 800,
                      fontSize: 12,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 14, color: '#fca5a5', lineHeight: 1.5 }}>{risk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Get Full Plan CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #1a1a2e)',
              borderRadius: 16,
              padding: '24px 28px',
              border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 13, color: '#a0a0b0', marginBottom: 6 }}>NEXT STEP</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  Get a detailed migration plan for {from} → {to}
                </h3>
                <p style={{ color: '#a0a0b0', fontSize: 13 }}>
                  AI analysis with week-by-week timeline, team requirements, and risk mitigation.
                </p>
              </div>
              <button
                onClick={() => router.push('/analyze?mode=migration')}
                style={{
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  padding: '13px 28px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Get Full Plan →
              </button>
            </div>
          </div>
        )}
        </>)}
      </div>
    </div>
  )
}
