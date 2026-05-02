'use client'

import Link from 'next/link'

interface Role {
  id: number
  title: string
  rate: string
  rateType: 'hourly' | 'annual' | 'partial'
  tools: { label: string; href: string }[]
  savings: string
  bestFor: string
  color: string
  icon: string
}

const ROLES: Role[] = [
  { id: 1,  title: 'Cloud Consultant',           rate: '$200/hr',  rateType: 'hourly', color: '#6366f1', icon: '💼', tools: [{ label: 'AI Strategy Session', href: '/ai-advisor' }, { label: 'Sanity Check', href: '/sanity-check' }],                                                                                                            savings: '$50K/year',          bestFor: 'Startups needing one-off cloud decisions without a retainer' },
  { id: 2,  title: 'FinOps Analyst',             rate: '$150K/year', rateType: 'annual', color: '#22c55e', icon: '📊', tools: [{ label: 'Bill Upload', href: '/bill-upload' }, { label: 'Cost Forecast', href: '/cost-intelligence?tab=forecast' }, { label: 'Reserved Instances', href: '/optimize?tab=reserved' }, { label: 'Waste Report', href: '/optimize?tab=waste' }],   savings: '$120K+/year',        bestFor: 'Engineering teams spending $10K–$200K/month on cloud' },
  { id: 3,  title: 'Solutions Architect',        rate: '$180K/year', rateType: 'annual', color: '#f59e0b', icon: '🏗️', tools: [{ label: 'Architecture Generator', href: '/architecture' }, { label: 'AI Strategy', href: '/ai-advisor' }],                                                                                                       savings: '$150K+/year',        bestFor: 'CTOs designing new systems or evaluating provider selection' },
  { id: 4,  title: 'Migration Engineer',         rate: '$150K/year', rateType: 'annual', color: '#0ea5e9', icon: '🔄', tools: [{ label: 'Migration Planner', href: '/migrate?tab=migration' }, { label: 'Egress Calculator', href: '/migrate?tab=egress' }],                                                                                                    savings: '$130K+/year',        bestFor: 'Companies planning to move between cloud providers' },
  { id: 5,  title: 'Compliance Officer',         rate: '$120K/year', rateType: 'annual', color: '#a855f7', icon: '✅', tools: [{ label: 'Compliance Checker', href: '/compliance' }, { label: 'Report Card', href: '/report-card' }],                                                                                                          savings: '$40K–$80K of time',  bestFor: 'Healthcare, FinTech, and government-adjacent startups' },
  { id: 6,  title: 'Cost Optimization Consultant', rate: '$300/hr', rateType: 'hourly', color: '#ef4444', icon: '💰', tools: [{ label: 'AI Analyze (Quick Wins)', href: '/analyze' }, { label: 'Waste Report', href: '/optimize?tab=waste' }, { label: 'AI Costs Optimizer', href: '/cost-intelligence?tab=ai-costs' }],                                              savings: '$50K–$150K/year',    bestFor: "Founders who suspect they're overpaying but don't know where" },
  { id: 7,  title: 'Cloud Strategist',           rate: '$350/hr',  rateType: 'hourly', color: '#f97316', icon: '🎯', tools: [{ label: 'AI Strategy', href: '/ai-advisor' }, { label: 'Cloud Advisor', href: '/advisor' }, { label: 'Cloud Score', href: '/learn?tab=benchmarks' }],                                                                       savings: '$40K–$100K/year',    bestFor: 'Seed to Series B founders evaluating their cloud strategy' },
  { id: 8,  title: 'Procurement Specialist',     rate: '$90K/year',  rateType: 'annual', color: '#14b8a6', icon: '🔍', tools: [{ label: 'Provider Comparison', href: '/compare' }, { label: 'Alternatives Hub', href: '/alternatives' }],                                                                                                       savings: '$60K–$100K/year',    bestFor: 'Teams evaluating alternatives to AWS, Azure, or GCP' },
  { id: 9,  title: 'Healthcare Cloud Specialist', rate: '$300/hr', rateType: 'hourly', color: '#ec4899', icon: '🏥', tools: [{ label: 'Compliance (HIPAA)', href: '/compliance' }, { label: 'Architecture (HIPAA-aware)', href: '/architecture' }],                                                                                            savings: '$50K–$150K/year',    bestFor: 'Healthcare, biotech, and telehealth startups needing HIPAA guidance' },
  { id: 10, title: 'DevOps Engineer (partial)',  rate: '$140K/year', rateType: 'partial', color: '#818cf8', icon: '⚙️', tools: [{ label: 'Infrastructure Estimator', href: '/terraform-estimator' }, { label: 'Cost Alerts', href: '/cost-alerts' }],                                                                                            savings: '25% of time = $30K–$60K', bestFor: 'Engineering teams looking to reduce DevOps toil on cost tasks' },
]

const TOTAL_SAVINGS = '$400,000'
const PLAN_PRICE    = '$49'
const ROI_PCT       = '6,580%'

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`
}

interface Props { embedded?: boolean }

export default function ReplacesTool({ embedded = false }: Props) {
  // Hub-aware Expert Marketplace link
  const expertsHref = embedded ? '/for-consultants?tab=experts' : '/for-consultants?tab=experts'

  const inner = (
    <>
      {!embedded && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, letterSpacing: 1 }}>
              ROI CALCULATOR
            </div>
          </div>
        </>
      )}

      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 24, padding: '40px 40px 36px', textAlign: 'center', marginBottom: 56,
      }}>
        <h1 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 900, marginBottom: 14, lineHeight: 1.15 }}>
          Replace{' '}
          <span style={{ color: '#ef4444', textDecoration: 'line-through', opacity: 0.7 }}>{TOTAL_SAVINGS}/year</span>
          {' '}in cloud expertise<br />for{' '}
          <span style={{ color: '#22c55e' }}>{PLAN_PRICE}/month</span>.
        </h1>
        <p style={{ fontSize: 'clamp(15px,2vw,20px)', color: '#a0a0b0', marginBottom: 28 }}>
          That&apos;s a <strong style={{ color: '#f59e0b', fontSize: '1.1em' }}>{ROI_PCT} ROI</strong> — the cost of one consultant meeting per month.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/pricing" style={{ background: '#6366f1', borderRadius: 12, padding: '13px 28px', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            See Pricing →
          </Link>
          <Link href="/analyze" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '13px 28px', color: '#a0a0b0', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
            Try Free First
          </Link>
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: '#444', letterSpacing: 2, marginBottom: 24, textAlign: 'center' }}>
        10 ROLES REPLACED OR AUGMENTED
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: 56 }}>
        {ROLES.map(role => (
          <div key={role.id} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 0, borderTop: `3px solid ${role.color}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 26 }}>{role.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{role.title}</div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{role.rate}</div>
                </div>
              </div>
              <div style={{
                background: `rgba(${hexToRgb(role.color)},0.1)`,
                border: `1px solid rgba(${hexToRgb(role.color)},0.25)`,
                borderRadius: 8, padding: '4px 10px',
                fontSize: 10, fontWeight: 700,
                color: role.color, letterSpacing: 0.5, whiteSpace: 'nowrap',
              }}>
                {role.rateType === 'partial' ? 'PARTIAL' : role.rateType === 'hourly' ? 'CONSULTING' : 'FULL-TIME'}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: 1, marginBottom: 8 }}>REPLACED BY</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {role.tools.map(t => (
                  <Link key={t.href} href={t.href}
                    style={{
                      fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 7,
                      background: `rgba(${hexToRgb(role.color)},0.08)`,
                      border: `1px solid rgba(${hexToRgb(role.color)},0.2)`,
                      color: role.color, textDecoration: 'none', transition: 'all 0.1s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${hexToRgb(role.color)},0.18)` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${hexToRgb(role.color)},0.08)` }}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: 1, marginBottom: 4 }}>ANNUAL SAVINGS</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#22c55e' }}>{role.savings}</div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: 1, marginBottom: 4 }}>BEST FOR</div>
              <div style={{ fontSize: 12, color: '#a0a0b0', lineHeight: 1.5 }}>{role.bestFor}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))',
        border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20,
        padding: '36px 40px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: 2, marginBottom: 16 }}>
          FOR THE COMPLEX 20%
        </div>
        <h2 style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, marginBottom: 14 }}>
          AI handles the 80% that&apos;s routine.
          <br />
          <span style={{ color: '#22c55e' }}>Experts handle the rest.</span>
        </h2>
        <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.6 }}>
          For complex decisions — multi-million dollar migrations, enterprise compliance audits, custom architecture reviews — our Expert Marketplace gives you on-demand access to vetted cloud specialists, at a fraction of the cost of a retainer.
        </p>
        <Link href={expertsHref} style={{ display: 'inline-block', background: '#22c55e', border: 'none', borderRadius: 12, padding: '13px 32px', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'background 0.15s' }}>
          See How It Works →
        </Link>
      </div>
    </>
  )

  if (embedded) return <div>{inner}</div>
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px' }}>{inner}</div>
    </div>
  )
}
