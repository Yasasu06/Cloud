'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react'
import Link from 'next/link'

const QUESTIONS = [
  {
    id: 1,
    question: 'What best describes your primary workload?',
    options: [
      { label: 'Web & Mobile Applications', value: 'web' },
      { label: 'Data Analytics & Big Data', value: 'data' },
      { label: 'AI / Machine Learning', value: 'ai' },
      { label: 'Enterprise / ERP / SAP', value: 'enterprise' },
      { label: 'DevOps / CI/CD Pipelines', value: 'devops' },
    ],
  },
  {
    id: 2,
    question: 'What are your compliance requirements?',
    options: [
      { label: 'None / Minimal', value: 'none' },
      { label: 'SOC2 / ISO 27001', value: 'soc2' },
      { label: 'HIPAA (Healthcare)', value: 'hipaa' },
      { label: 'FedRAMP / Government', value: 'fedramp' },
      { label: 'GDPR (Europe)', value: 'gdpr' },
    ],
  },
  {
    id: 3,
    question: 'How large is your engineering team?',
    options: [
      { label: 'Solo / 1–5 engineers', value: 'solo' },
      { label: 'Small team (6–25)', value: 'small' },
      { label: 'Mid-size (26–100)', value: 'mid' },
      { label: 'Large (100–500)', value: 'large' },
      { label: 'Enterprise (500+)', value: 'enterprise' },
    ],
  },
  {
    id: 4,
    question: 'What is your existing technology stack?',
    options: [
      { label: 'Microsoft / .NET / Windows', value: 'microsoft' },
      { label: 'Open source / Linux / Python', value: 'oss' },
      { label: 'Google Workspace / Firebase', value: 'google' },
      { label: 'AWS-native already', value: 'aws' },
      { label: 'Vendor agnostic / Mixed', value: 'agnostic' },
    ],
  },
  {
    id: 5,
    question: 'What is your monthly cloud budget?',
    options: [
      { label: 'Under $1,000', value: 'micro' },
      { label: '$1,000 – $10,000', value: 'small' },
      { label: '$10,000 – $50,000', value: 'mid' },
      { label: '$50,000 – $500,000', value: 'large' },
      { label: 'Over $500,000', value: 'enterprise' },
    ],
  },
]

const SCORES: Record<string, Record<string, { aws: number; azure: number; gcp: number }>> = {
  workload: {
    web: { aws: 3, azure: 2, gcp: 1 },
    data: { aws: 2, azure: 2, gcp: 3 },
    ai: { aws: 2, azure: 3, gcp: 3 },
    enterprise: { aws: 1, azure: 3, gcp: 1 },
    devops: { aws: 3, azure: 2, gcp: 2 },
  },
  compliance: {
    none: { aws: 2, azure: 2, gcp: 2 },
    soc2: { aws: 2, azure: 2, gcp: 2 },
    hipaa: { aws: 3, azure: 3, gcp: 1 },
    fedramp: { aws: 3, azure: 2, gcp: 1 },
    gdpr: { aws: 2, azure: 3, gcp: 2 },
  },
  size: {
    solo: { aws: 2, azure: 1, gcp: 3 },
    small: { aws: 3, azure: 2, gcp: 2 },
    mid: { aws: 3, azure: 2, gcp: 2 },
    large: { aws: 2, azure: 3, gcp: 2 },
    enterprise: { aws: 2, azure: 3, gcp: 1 },
  },
  stack: {
    microsoft: { aws: 1, azure: 3, gcp: 1 },
    oss: { aws: 3, azure: 2, gcp: 3 },
    google: { aws: 1, azure: 1, gcp: 3 },
    aws: { aws: 3, azure: 1, gcp: 1 },
    agnostic: { aws: 2, azure: 2, gcp: 2 },
  },
  budget: {
    micro: { aws: 2, azure: 1, gcp: 3 },
    small: { aws: 3, azure: 2, gcp: 2 },
    mid: { aws: 3, azure: 3, gcp: 2 },
    large: { aws: 2, azure: 3, gcp: 2 },
    enterprise: { aws: 2, azure: 3, gcp: 2 },
  },
}

const SCORE_KEYS = ['workload', 'compliance', 'size', 'stack', 'budget']

const PROVIDER_INFO: Record<string, { color: string; name: string; tagline: string }> = {
  aws: { color: '#FF9900', name: 'Amazon Web Services', tagline: 'Broadest service catalog, best for startups and enterprise alike.' },
  azure: { color: '#0078D4', name: 'Microsoft Azure', tagline: 'Best for enterprises and Microsoft-heavy environments.' },
  gcp: { color: '#34A853', name: 'Google Cloud Platform', tagline: 'Best-in-class AI/ML and data analytics capabilities.' },
}

export default function AdvisorPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<{ winner: string; confidence: number; scores: Record<string, number> } | null>(null)

  const question = QUESTIONS[step]

  function handleSelect(value: string) {
    setSelected(value)
  }

  function handleNext() {
    if (!selected) return
    const newAnswers = [...answers, selected]
    if (step < QUESTIONS.length - 1) {
      setAnswers(newAnswers)
      setSelected(null)
      setStep(step + 1)
    } else {
      // Compute scores
      const totals = { aws: 0, azure: 0, gcp: 0 }
      newAnswers.forEach((ans, idx) => {
        const key = SCORE_KEYS[idx]
        const s = SCORES[key][ans]
        if (s) {
          totals.aws += s.aws
          totals.azure += s.azure
          totals.gcp += s.gcp
        }
      })
      const max = Math.max(totals.aws, totals.azure, totals.gcp)
      const winner = totals.azure === max ? 'azure' : totals.aws === max ? 'aws' : 'gcp'
      const confidence = Math.min(95, Math.max(50, Math.round((max / 15) * 100)))
      setResult({ winner, confidence, scores: totals })
    }
  }

  function reset() {
    setStep(0)
    setAnswers([])
    setSelected(null)
    setResult(null)
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
            Cloud Advisor
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Find your perfect cloud
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Answer 5 quick questions — get a data-driven recommendation in seconds.
          </p>
        </div>

        {!result ? (
          <div
            className="rounded-2xl p-8"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {/* Progress bar */}
            <div className="flex gap-1.5 mb-8">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{
                    background: i < step ? 'var(--accent)' : i === step ? '#818cf8' : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </div>

            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              Question {step + 1} of {QUESTIONS.length}
            </p>
            <h2 className="text-xl font-semibold text-white mb-6">{question.question}</h2>

            <div className="space-y-3 mb-8">
              {question.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150"
                  style={{
                    background: selected === opt.value ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                    border: selected === opt.value ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                    color: selected === opt.value ? '#c7d2fe' : '#e2e8f0',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!selected}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {step === QUESTIONS.length - 1 ? 'Get My Recommendation' : 'Next'}
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-8"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="text-center mb-8">
                <CheckCircle2 size={40} className="mx-auto mb-4" style={{ color: PROVIDER_INFO[result.winner].color }} />
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                  We Recommend
                </p>
                <h2 className="text-3xl font-black mb-2" style={{ color: PROVIDER_INFO[result.winner].color }}>
                  {PROVIDER_INFO[result.winner].name}
                </h2>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {PROVIDER_INFO[result.winner].tagline}
                </p>
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
                  style={{
                    background: `${PROVIDER_INFO[result.winner].color}20`,
                    color: PROVIDER_INFO[result.winner].color,
                  }}
                >
                  {result.confidence}% confidence match
                </span>
              </div>

              {/* Score bars */}
              <div className="space-y-3 mb-8">
                {Object.entries(result.scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([provider, score]) => (
                    <div key={provider}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium" style={{ color: PROVIDER_INFO[provider].color }}>
                          {provider.toUpperCase()}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{score}/15</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: PROVIDER_INFO[provider].color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(score / 15) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  <RotateCcw size={14} /> Retake Quiz
                </button>
                <Link
                  href="/simulator"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01]"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  Model the Cost <ChevronRight size={14} />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
