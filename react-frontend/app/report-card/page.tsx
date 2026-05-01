'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Grade = 'A' | 'B' | 'C' | 'D' | 'F'
type DimensionName = 'Cost Efficiency' | 'Security Posture' | 'Architecture Health' | 'Compliance Readiness' | 'Growth Readiness'

const QUESTIONS = [
  { id: 0, text: 'Do you review your cloud bill monthly?' },
  { id: 1, text: 'Do you have unused resources you know about?' },
  { id: 2, text: 'Do you have billing alerts set up?' },
  { id: 3, text: 'Do you have backups configured?' },
  { id: 4, text: 'Do you know your cloud spend by service?' },
]

// q1 = reviewed bill (+), q2 = has unused resources (reversed: no = good),
// q3 = billing alerts (+), q4 = backups (+), q5 = knows spend by service (+)
function calculateGrades(answers: boolean[]): { dimension: DimensionName; grade: Grade; action: string }[] {
  const [q1, q2, q3, q4, q5] = answers

  const ACTIONS: Record<DimensionName, Record<Grade, string>> = {
    'Cost Efficiency': {
      A: 'Excellent! Set up automated cost anomaly detection to maintain this.',
      B: 'Enable AWS Cost Explorer daily granularity and tag resources by team.',
      C: 'Schedule a monthly bill review and set up budget alerts this week.',
      D: 'Find and delete unused resources — start with EC2 and EBS volumes.',
      F: 'Urgent: enable billing alerts and schedule a cost review today.',
    },
    'Security Posture': {
      A: 'Strong posture. Consider adding CloudTrail for full audit logging.',
      B: 'Verify backup encryption and test restore procedures.',
      C: 'Set billing alerts and confirm all backups are encrypted.',
      D: 'Enable billing alerts and configure automated backups immediately.',
      F: 'Critical: enable MFA, set billing alerts, and configure backups today.',
    },
    'Architecture Health': {
      A: 'Solid foundation. Consider multi-region disaster recovery.',
      B: 'Schedule a resource audit and document your architecture.',
      C: 'Remove unused resources and verify backup restore times.',
      D: 'Audit and remove orphaned resources — they are costing you money.',
      F: 'Immediate action needed: remove orphaned resources and enable backups.',
    },
    'Compliance Readiness': {
      A: 'Compliance-ready. Schedule quarterly security reviews.',
      B: 'Verify billing alert thresholds match your compliance policy.',
      C: 'Document your backup retention policy and alert thresholds.',
      D: 'Enable billing alerts and ensure backups meet retention requirements.',
      F: 'High compliance risk: set up billing controls and data backup immediately.',
    },
    'Growth Readiness': {
      A: 'Well-positioned to scale. Model costs for 3× growth now.',
      B: 'Build a per-service cost breakdown to predict growth expenses.',
      C: 'Start monthly bill reviews to catch scaling costs early.',
      D: 'You need cost visibility before scaling — start with a bill review.',
      F: 'High risk for surprise bills when you grow — get cost visibility now.',
    },
  }

  function score(points: number, max: number): Grade {
    const p = points / max
    if (p >= 0.84) return 'A'
    if (p >= 0.60) return 'B'
    if (p >= 0.40) return 'C'
    if (p >= 0.20) return 'D'
    return 'F'
  }

  const dims: { dimension: DimensionName; points: number; max: number }[] = [
    { dimension: 'Cost Efficiency',      points: (q1 ? 1 : 0) + (!q2 ? 1 : 0) + (q5 ? 1 : 0), max: 3 },
    { dimension: 'Security Posture',     points: (q3 ? 1 : 0) + (q4 ? 1 : 0),                  max: 2 },
    { dimension: 'Architecture Health',  points: (!q2 ? 1 : 0) + (q4 ? 1 : 0),                 max: 2 },
    { dimension: 'Compliance Readiness', points: (q3 ? 1 : 0) + (q4 ? 1 : 0),                  max: 2 },
    { dimension: 'Growth Readiness',     points: (q1 ? 1 : 0) + (q5 ? 1 : 0),                  max: 2 },
  ]

  return dims.map(({ dimension, points, max }) => {
    const grade = score(points, max)
    return { dimension, grade, action: ACTIONS[dimension][grade] }
  })
}

const GRADE_COLORS: Record<Grade, string> = {
  A: '#22c55e',
  B: '#6366f1',
  C: '#f59e0b',
  D: '#f97316',
  F: '#ef4444',
}

const GPA_VALUES: Record<Grade, number> = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 }

export default function ReportCardPage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null, null, null])
  const [showResults, setShowResults] = useState(false)
  const [copied, setCopied] = useState(false)

  const allAnswered = answers.every(a => a !== null)

  function generate() {
    if (allAnswered) setShowResults(true)
  }

  function reset() {
    setAnswers([null, null, null, null, null])
    setShowResults(false)
  }

  async function handleShare() {
    const gradeMap = Object.fromEntries(grades.map(g => [g.dimension, g.grade]))
    const text = `☁️ My Cloud Intelligence Report Card
Cost Efficiency: ${gradeMap['Cost Efficiency']}
Security: ${gradeMap['Security Posture']}
Architecture: ${gradeMap['Architecture Health']}
Compliance: ${gradeMap['Compliance Readiness']}
Growth: ${gradeMap['Growth Readiness']}
Overall: ${gpa.toFixed(1)}/4.0 GPA
Get your free cloud report at cloud-psx9.vercel.app`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const grades = showResults ? calculateGrades(answers as boolean[]) : []
  const gpa = grades.length > 0
    ? grades.reduce((sum, g) => sum + GPA_VALUES[g.grade], 0) / grades.length
    : 0
  const overallGrade: Grade = gpa >= 3.5 ? 'A' : gpa >= 2.5 ? 'B' : gpa >= 1.5 ? 'C' : gpa >= 0.5 ? 'D' : 'F'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '100px 24px 80px' }}>

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
            CLOUD HEALTH REPORT CARD
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.2 }}>
            Grade Your Cloud Setup
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 460, margin: '0 auto' }}>
            Answer 5 quick questions to get an A–F grade across 5 dimensions of cloud health.
          </p>
        </div>

        {/* Questions */}
        {!showResults && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              {QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  style={{
                    background: '#1a1a2e',
                    borderRadius: 14,
                    padding: '20px 24px',
                    border: `1px solid ${answers[idx] !== null ? 'rgba(99,102,241,0.4)' : '#ffffff0a'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: answers[idx] !== null ? '#6366f1' : '#ffffff0f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: answers[idx] !== null ? 'white' : '#666',
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: 15, color: '#e0e0e0', fontWeight: 500 }}>{q.text}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {[true, false].map(val => (
                      <button
                        key={String(val)}
                        onClick={() => {
                          const next = [...answers]
                          next[idx] = val
                          setAnswers(next)
                        }}
                        style={{
                          padding: '8px 22px',
                          borderRadius: 8,
                          border: `1px solid ${answers[idx] === val ? (val ? '#22c55e' : '#ef4444') : '#ffffff18'}`,
                          background: answers[idx] === val ? (val ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)') : 'transparent',
                          color: answers[idx] === val ? (val ? '#22c55e' : '#ef4444') : '#a0a0b0',
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {val ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={generate}
                disabled={!allAnswered}
                style={{
                  background: allAnswered ? '#6366f1' : '#ffffff10',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 36px',
                  color: allAnswered ? 'white' : '#555',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: allAnswered ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                Generate Report Card →
              </button>
              {!allAnswered && (
                <p style={{ color: '#555', fontSize: 13, marginTop: 10 }}>
                  Answer all 5 questions to continue
                </p>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div>
            {/* Overall grade */}
            <div style={{
              background: '#1a1a2e',
              borderRadius: 20,
              padding: '32px 28px',
              border: `2px solid ${GRADE_COLORS[overallGrade]}30`,
              textAlign: 'center',
              marginBottom: 32,
            }}>
              <p style={{ color: '#a0a0b0', fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: 1 }}>
                OVERALL CLOUD HEALTH
              </p>
              <div style={{
                fontSize: 96,
                fontWeight: 900,
                color: GRADE_COLORS[overallGrade],
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {overallGrade}
              </div>
              <div style={{ color: '#a0a0b0', fontSize: 16 }}>
                GPA: <strong style={{ color: 'white' }}>{gpa.toFixed(1)}</strong> / 4.0
              </div>
            </div>

            {/* Dimension grades */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 32 }}>
              {grades.map(({ dimension, grade, action }) => (
                <div
                  key={dimension}
                  style={{
                    background: '#1a1a2e',
                    borderRadius: 14,
                    padding: '22px 22px',
                    border: `1px solid ${GRADE_COLORS[grade]}25`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>{dimension}</span>
                    <span style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: GRADE_COLORS[grade],
                      lineHeight: 1,
                    }}>
                      {grade}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.5, margin: 0 }}>
                    <strong style={{ color: '#6366f1' }}>Action: </strong>{action}
                  </p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => router.push('/analyze')}
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
                Get AI Analysis →
              </button>
              <button
                onClick={handleShare}
                style={{
                  background: copied ? 'rgba(34,197,94,0.15)' : 'transparent',
                  border: `1px solid ${copied ? '#22c55e' : '#ffffff20'}`,
                  borderRadius: 10,
                  padding: '12px 24px',
                  color: copied ? '#22c55e' : '#a0a0b0',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? '✓ Copied to clipboard!' : '📤 Share Results'}
              </button>
              <button
                onClick={reset}
                style={{
                  background: 'transparent',
                  border: '1px solid #ffffff20',
                  borderRadius: 10,
                  padding: '12px 24px',
                  color: '#a0a0b0',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Retake Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
