'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  'AWS→Azure':              { complexity: 'Hard',      costRange: '$15,000 – $45,000',  monthlySaving: 'Save $300 – $800/month',                  risks: ['IAM → Entra ID mapping requires full identity rewrite','Lambda → Azure Functions rewrites often take 2–3x longer than expected','Data egress charges during transition can add $2,000–$8,000 one-time'] },
  'AWS→GCP':                { complexity: 'Medium',    costRange: '$10,000 – $30,000',  monthlySaving: 'Save $800 – $2,500/month (ML workloads)', risks: ['BigQuery learning curve — team retraining typically takes 4–6 weeks','GKE vs EKS networking model differences cause unexpected downtime','CloudFront → Cloud CDN config gaps can expose origin servers'] },
  'AWS→DigitalOcean':       { complexity: 'Medium',    costRange: '$5,000 – $20,000',   monthlySaving: 'Save $2,000 – $5,000/month',              risks: ['No equivalent to Lambda, SQS, or SNS — significant refactoring required','No enterprise SLA — 99.99% uptime guarantee not available','Managed Kubernetes (DOKS) lacks EKS auto-scaling features'] },
  'AWS→Hetzner':            { complexity: 'Hard',      costRange: '$8,000 – $25,000',   monthlySaving: 'Save $3,000 – $7,000/month',              risks: ['EU-only regions — not viable for US or APAC latency requirements','No managed databases or cache — you own all patching and backups','Compliance certifications (SOC 2, HIPAA) are your responsibility'] },
  'Azure→AWS':              { complexity: 'Hard',      costRange: '$15,000 – $40,000',  monthlySaving: 'Save $200 – $1,000/month',                risks: ['Entra ID → IAM restructure is the most complex identity migration path','Azure DevOps pipelines need full rebuild in CodePipeline or GitHub Actions','Microsoft licensing costs may actually increase on AWS (no EA discounts)'] },
  'Azure→GCP':              { complexity: 'Medium',    costRange: '$12,000 – $35,000',  monthlySaving: 'Save $1,000 – $3,000/month',              risks: ['Entra ID has no direct GCP equivalent — need third-party IdP','Azure PaaS services (Service Bus, Logic Apps) have no GCP drop-in','Azure Monitor → Cloud Operations Suite gap causes blind spots'] },
  'Azure→DigitalOcean':     { complexity: 'Medium',    costRange: '$6,000 – $18,000',   monthlySaving: 'Save $1,500 – $4,000/month',              risks: ['No Azure Active Directory equivalent — SSO and RBAC must be rebuilt','Enterprise compliance (FedRAMP, HIPAA BAA) not available on DigitalOcean','AKS managed upgrades and auto-scaling not available in DOKS'] },
  'Azure→Hetzner':          { complexity: 'Hard',      costRange: '$8,000 – $22,000',   monthlySaving: 'Save $2,500 – $6,000/month',              risks: ['EU-only — rules out global deployments for non-European traffic','No hybrid cloud model — Azure Arc integrations break completely','Full infrastructure management shift requires dedicated DevOps hire'] },
  'GCP→AWS':                { complexity: 'Hard',      costRange: '$20,000 – $55,000',  monthlySaving: 'Cost increase $500 – $2,000/month',       risks: ['BigQuery → Redshift/Athena is lossy — query performance often degrades','Cloud Spanner has no AWS equivalent — Aurora Global is an imperfect substitute','Vertex AI ML pipelines are significantly harder to replicate on SageMaker'] },
  'GCP→Azure':              { complexity: 'Medium',    costRange: '$14,000 – $38,000',  monthlySaving: 'Save $500 – $1,500/month',                risks: ['BigQuery → Synapse Analytics migration often loses 20–30% query performance','GCP ML tooling (Vertex AI, AutoML) is harder to replace on Azure','Pub/Sub → Event Hubs requires rewrite of all consumer and producer code'] },
  'GCP→DigitalOcean':       { complexity: 'Medium',    costRange: '$8,000 – $22,000',   monthlySaving: 'Save $1,500 – $4,500/month',              risks: ['No BigQuery equivalent — analytics workloads need full stack replacement','GKE Autopilot features not available in DOKS — manual node management','Vertex AI and ML pipelines are completely stranded with no migration path'] },
  'GCP→Hetzner':            { complexity: 'Hard',      costRange: '$6,000 – $18,000',   monthlySaving: 'Save $2,500 – $6,500/month',              risks: ['BigQuery has no self-hosted equivalent — complete analytics rewrite required','EU-only regions eliminate global multi-region architectures','Every GCP managed service (Spanner, Pub/Sub, Vertex) must be self-hosted'] },
  'On-premise→AWS':         { complexity: 'Very Hard', costRange: '$50,000 – $200,000', monthlySaving: 'Cost increase $500 – $5,000/month (OpEx shift)', risks: ['CapEx → OpEx model shock — monthly bills replace 3-year hardware amortization','Data transfer and egress costs add $1,000–$4,000/month not seen on-prem','Skills gap — average on-prem team needs 6–12 months to reach cloud proficiency'] },
  'On-premise→Azure':       { complexity: 'Very Hard', costRange: '$50,000 – $190,000', monthlySaving: 'Cost increase $300 – $4,000/month (OpEx shift)', risks: ['Microsoft EA licensing complexity — cloud pricing may override existing deals','Hybrid setup requires Azure Arc — adds $200–$800/month per connected site','Security perimeter must be redesigned — on-prem firewall rules do not translate'] },
  'On-premise→GCP':         { complexity: 'Very Hard', costRange: '$45,000 – $175,000', monthlySaving: 'Cost increase $400 – $4,500/month (OpEx shift)', risks: ['Cultural shift to Google tooling is steep — expect 6+ months of productivity loss','Anthos required for any hybrid model adds $15,000+ per year',"Data sovereignty concerns — Google's data processing terms differ from on-prem"] },
  'On-premise→DigitalOcean':{ complexity: 'Hard',      costRange: '$20,000 – $75,000',  monthlySaving: 'Save $2,000 – $6,000/month vs on-prem',  risks: ['No enterprise SLAs or compliance certifications (HIPAA, FedRAMP unavailable)','Limited to 15 regions — may not meet data residency requirements','All infrastructure self-managed — requires dedicated DevOps investment'] },
  'On-premise→Hetzner':     { complexity: 'Hard',      costRange: '$15,000 – $60,000',  monthlySaving: 'Save $3,000 – $8,000/month vs on-prem',  risks: ['EU-only regions — eliminates option for US or APAC deployments','No managed services — databases, cache, queues all self-hosted','Full DevOps team required — Hetzner provides servers, not a managed platform'] },
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

interface Props { embedded?: boolean }

export default function MigrationPlannerTool({ embedded = false }: Props) {
  const router = useRouter()
  const [from, setFrom] = useState<FromProvider>('AWS')
  const [to, setTo] = useState<ToProvider>('Azure')

  const key = `${from}→${to}`
  const info = from === to ? null : DATA[key] ?? null

  const inner = (
    <>
      {!embedded && (
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
      )}

      {/* Dropdowns */}
      <div style={{
        background: '#1a1a2e', borderRadius: 16, padding: '28px',
        border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32,
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'end',
      }}>
        <div>
          <label htmlFor="mp-from" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1, marginBottom: 8 }}>
            MIGRATING FROM
          </label>
          <select id="mp-from" value={from} onChange={e => setFrom(e.target.value as FromProvider)} style={selectStyle}>
            {FROM_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 20, color: '#6366f1', paddingBottom: 14, textAlign: 'center' }}>→</div>
        <div>
          <label htmlFor="mp-to" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1, marginBottom: 8 }}>
            MIGRATING TO
          </label>
          <select id="mp-to" value={to} onChange={e => setTo(e.target.value as ToProvider)} style={selectStyle}>
            {TO_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {from === to && (
        <div style={{ background: '#1a1a2e', borderRadius: 14, padding: 24, textAlign: 'center', color: '#a0a0b0', border: '1px solid rgba(255,255,255,0.06)' }}>
          Select different source and destination providers.
        </div>
      )}

      {info && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: '#fbbf24', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Illustrative scenario only. Cost ranges, monthly impact, complexity, and risks are static examples; they are not calculated from your infrastructure or verified quotes.
          </p>
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
              <div style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>SAMPLE MONTHLY IMPACT</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: info.monthlySaving.startsWith('Save') ? '#22c55e' : '#f97316' }}>
                {info.monthlySaving}
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '22px 24px' }}>
            <div style={{ fontSize: 12, color: '#f87171', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
              TOP 3 RISKS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {info.risks.map((risk, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', fontWeight: 800, fontSize: 12, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 14, color: '#fca5a5', lineHeight: 1.5 }}>{risk}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #1a1a2e)', borderRadius: 16, padding: '24px 28px', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: '#a0a0b0', marginBottom: 6 }}>NEXT STEP</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                Get a detailed migration plan for {from} → {to}
              </h3>
              <p style={{ color: '#a0a0b0', fontSize: 13 }}>
                AI analysis with week-by-week timeline, team requirements, and risk mitigation.
              </p>
            </div>
            <button onClick={() => router.push('/analyze?mode=migration')} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Get Full Plan →
            </button>
          </div>
        </div>
      )}
    </>
  )

  if (embedded) return <div>{inner}</div>
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '100px 24px 80px' }}>{inner}</div>
    </div>
  )
}
