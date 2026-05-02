'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NextActionCards from '@/components/NextActionCards'

interface Question {
  id: string
  text: string
  options: { label: string; value: number }[]
}

interface Dimension {
  id: string
  title: string
  icon: string
  color: string
  questions: Question[]
}

const DIMENSIONS: Dimension[] = [
  {
    id: 'cost',
    title: 'Cost Optimization',
    icon: '💰',
    color: '#22c55e',
    questions: [
      { id: 'c1', text: 'How do you handle reserved/committed-use instances?', options: [{ label: 'No reserved instances', value: 0 }, { label: 'Some, bought ad hoc', value: 1 }, { label: 'Strategic coverage >50%', value: 2 }, { label: 'Full FinOps practice, >80%', value: 3 }] },
      { id: 'c2', text: 'How often do you review and right-size resources?', options: [{ label: 'Never', value: 0 }, { label: 'Annually', value: 1 }, { label: 'Quarterly', value: 2 }, { label: 'Monthly or automated', value: 3 }] },
      { id: 'c3', text: 'Do you have cloud budget alerts set up?', options: [{ label: 'No alerts', value: 0 }, { label: 'Basic billing alerts', value: 1 }, { label: 'Per-service budgets', value: 2 }, { label: 'Granular anomaly detection', value: 3 }] },
    ],
  },
  {
    id: 'reliability',
    title: 'Reliability',
    icon: '🛡️',
    color: '#6366f1',
    questions: [
      { id: 'r1', text: 'What is your deployment strategy?', options: [{ label: 'Single region, manual', value: 0 }, { label: 'Single region, automated CI/CD', value: 1 }, { label: 'Multi-AZ deployments', value: 2 }, { label: 'Multi-region with failover', value: 3 }] },
      { id: 'r2', text: 'How do you handle database backups?', options: [{ label: 'Manual or no backups', value: 0 }, { label: 'Daily snapshots', value: 1 }, { label: 'Point-in-time recovery enabled', value: 2 }, { label: 'Cross-region backups + tested restore', value: 3 }] },
      { id: 'r3', text: 'Do you have defined RTO/RPO targets?', options: [{ label: 'No targets defined', value: 0 }, { label: 'Informal targets', value: 1 }, { label: 'Documented targets', value: 2 }, { label: 'Regularly tested against targets', value: 3 }] },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: '🔒',
    color: '#f59e0b',
    questions: [
      { id: 's1', text: 'How is IAM/access managed?', options: [{ label: 'Root account for everything', value: 0 }, { label: 'IAM users, limited separation', value: 1 }, { label: 'Role-based, least privilege', value: 2 }, { label: 'SSO + automated rotation + auditing', value: 3 }] },
      { id: 's2', text: 'Is data encrypted at rest and in transit?', options: [{ label: 'No encryption', value: 0 }, { label: 'Transit only (HTTPS)', value: 1 }, { label: 'Both, default keys', value: 2 }, { label: 'Both, customer-managed keys', value: 3 }] },
      { id: 's3', text: 'Do you perform security audits or use cloud security tools?', options: [{ label: 'No audits', value: 0 }, { label: 'Manual periodic reviews', value: 1 }, { label: 'Automated scanning (Trusted Advisor, etc.)', value: 2 }, { label: 'Continuous compliance + third-party audits', value: 3 }] },
    ],
  },
  {
    id: 'performance',
    title: 'Performance',
    icon: '⚡',
    color: '#0ea5e9',
    questions: [
      { id: 'p1', text: 'Do you use a CDN for static assets?', options: [{ label: 'No CDN', value: 0 }, { label: 'CDN for some assets', value: 1 }, { label: 'Full CDN coverage', value: 2 }, { label: 'CDN + edge compute + image optimization', value: 3 }] },
      { id: 'p2', text: 'How do you handle scaling?', options: [{ label: 'Fixed, manually scaled', value: 0 }, { label: 'Manual scale-up when alerted', value: 1 }, { label: 'Auto-scaling configured', value: 2 }, { label: 'Predictive scaling + load testing', value: 3 }] },
      { id: 'p3', text: 'Is caching implemented for your data layer?', options: [{ label: 'No caching', value: 0 }, { label: 'Application-level caching', value: 1 }, { label: 'Redis/Memcached for key queries', value: 2 }, { label: 'Multi-layer caching strategy', value: 3 }] },
    ],
  },
  {
    id: 'operations',
    title: 'Operational Excellence',
    icon: '📊',
    color: '#a855f7',
    questions: [
      { id: 'o1', text: 'How is infrastructure provisioned?', options: [{ label: 'Manual (console clicks)', value: 0 }, { label: 'Scripts or basic automation', value: 1 }, { label: 'Infrastructure as Code (Terraform/CDK)', value: 2 }, { label: 'IaC + GitOps + drift detection', value: 3 }] },
      { id: 'o2', text: 'What is your observability coverage?', options: [{ label: 'No monitoring', value: 0 }, { label: 'Basic uptime monitoring', value: 1 }, { label: 'Metrics + logs + alerts', value: 2 }, { label: 'Full observability stack + SLOs', value: 3 }] },
      { id: 'o3', text: 'Do you run post-incident reviews?', options: [{ label: 'No process', value: 0 }, { label: 'Informal discussions', value: 1 }, { label: 'Documented postmortems', value: 2 }, { label: 'Blameless culture + action tracking', value: 3 }] },
    ],
  },
]

const MATURITY_LEVELS = [
  { min: 0,  max: 25, label: 'Starter',   color: '#ef4444', desc: 'Your cloud setup has significant gaps. Focus on the quick wins below to reduce risk and waste immediately.' },
  { min: 26, max: 50, label: 'Developing', color: '#f59e0b', desc: 'A solid foundation exists but there are clear gaps. Address the medium-priority items to reach industry standard.' },
  { min: 51, max: 75, label: 'Mature',     color: '#22c55e', desc: 'You\'re above average. Fine-tuning a few areas will get you to best-in-class.' },
  { min: 76, max: 100,label: 'Best-in-Class', color: '#6366f1', desc: 'Excellent cloud maturity. Focus on continuous improvement and staying current with new services.' },
]

export default function CloudScorePage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentDim, setCurrentDim] = useState(0)
  const [completed, setCompleted] = useState(false)

  const totalQuestions = DIMENSIONS.flatMap(d => d.questions).length
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / totalQuestions) * 100

  const dimScores = DIMENSIONS.map(dim => {
    const total = dim.questions.reduce((s, q) => s + (answers[q.id] ?? 0), 0)
    const max = dim.questions.length * 3
    return { id: dim.id, pct: Math.round((total / max) * 100) }
  })

  const overallScore = Math.round(dimScores.reduce((s, d) => s + d.pct, 0) / dimScores.length)
  const maturity = MATURITY_LEVELS.find(m => overallScore >= m.min && overallScore <= m.max) ?? MATURITY_LEVELS[0]

  const currentDimension = DIMENSIONS[currentDim]
  const dimAnswered = currentDimension.questions.every(q => answers[q.id] !== undefined)

  function setAnswer(qId: string, value: number) {
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  function nextDim() {
    if (currentDim < DIMENSIONS.length - 1) {
      setCurrentDim(d => d + 1)
    } else {
      setCompleted(true)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '11px 16px', color: 'white', outline: 'none',
    fontSize: 14, width: '100%', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            CLOUD MATURITY SCORE
          </div>
          <h1 style={{ fontSize: 'clamp(26px,5vw,40px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
            What&apos;s your Cloud Score?
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 460, margin: '0 auto' }}>
            15 questions across 5 dimensions. Get your maturity score and a prioritized action plan.
          </p>
        </div>

        {!completed ? (
          <>
            {/* Global progress */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', marginBottom: 6 }}>
                <span>{answeredCount} of {totalQuestions} answered</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#6366f1', borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
            </div>

            {/* Dimension tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {DIMENSIONS.map((dim, i) => {
                const done = dim.questions.every(q => answers[q.id] !== undefined)
                return (
                  <button
                    key={dim.id}
                    onClick={() => setCurrentDim(i)}
                    style={{
                      flex: 1, minWidth: 100, padding: '8px 10px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      border: currentDim === i ? `1px solid ${dim.color}60` : '1px solid rgba(255,255,255,0.08)',
                      background: currentDim === i ? `rgba(${hexToRgb(dim.color)},0.1)` : done ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)',
                      color: currentDim === i ? dim.color : done ? '#22c55e' : '#555', transition: 'all 0.15s',
                    }}
                  >
                    {done ? '✓ ' : ''}{dim.icon} {dim.title}
                  </button>
                )
              })}
            </div>

            {/* Questions */}
            <div className="glass-card" style={{ padding: 28, marginBottom: 20, borderTop: `3px solid ${currentDimension.color}` }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 24 }}>
                {currentDimension.icon} {currentDimension.title}
              </div>
              {currentDimension.questions.map(q => (
                <div key={q.id} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#d0d0e0', marginBottom: 10 }}>{q.text}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {q.options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setAnswer(q.id, opt.value)}
                        style={{
                          textAlign: 'left', padding: '10px 14px', borderRadius: 9, cursor: 'pointer', fontSize: 13,
                          border: answers[q.id] === opt.value ? `1px solid ${currentDimension.color}60` : '1px solid rgba(255,255,255,0.08)',
                          background: answers[q.id] === opt.value ? `rgba(${hexToRgb(currentDimension.color)},0.1)` : 'rgba(255,255,255,0.02)',
                          color: answers[q.id] === opt.value ? currentDimension.color : '#a0a0b0', transition: 'all 0.1s',
                        }}
                      >
                        {answers[q.id] === opt.value ? '● ' : '○ '}{opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={nextDim}
              disabled={!dimAnswered}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: dimAnswered ? currentDimension.color : 'rgba(255,255,255,0.08)',
                border: 'none', color: dimAnswered ? 'white' : '#444', cursor: dimAnswered ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              {currentDim < DIMENSIONS.length - 1 ? `Next: ${DIMENSIONS[currentDim + 1].title} →` : 'See My Score →'}
            </button>
          </>
        ) : (
          <>
            {/* Score result */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 80, fontWeight: 900, color: maturity.color, lineHeight: 1, marginBottom: 8 }}>{overallScore}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: maturity.color, marginBottom: 8 }}>{maturity.label}</div>
              <p style={{ color: '#a0a0b0', fontSize: 14, maxWidth: 420, margin: '0 auto 8px', lineHeight: 1.6 }}>{maturity.desc}</p>
            </div>

            {/* Dimension breakdown */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>DIMENSION SCORES</div>
              {DIMENSIONS.map((dim, i) => {
                const pct = dimScores[i].pct
                return (
                  <div key={dim.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span style={{ fontWeight: 600, color: 'white' }}>{dim.icon} {dim.title}</span>
                      <span style={{ fontWeight: 900, color: dim.color }}>{pct}%</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: dim.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/analyze?mode=finops')} style={{ flex: 1, background: '#6366f1', border: 'none', borderRadius: 10, padding: '13px 20px', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Get AI Improvement Plan →
              </button>
              <button onClick={() => { setAnswers({}); setCurrentDim(0); setCompleted(false) }} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '13px 20px', color: '#a0a0b0', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Retake
              </button>
            </div>

            <NextActionCards actions={[
              { icon: '📊', title: 'Industry Benchmark', desc: 'Compare to peers',          href: '/learn?tab=benchmarks' },
              { icon: '💼', title: 'Build Action Plan',  desc: 'Strategy session',           href: '/ai-advisor' },
              { icon: '🛠️', title: 'Visualize Journey',  desc: '12-week trajectory',         href: '/outcome-simulator' },
            ]} />
          </>
        )}

      </div>
    </div>
  )
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`
}
