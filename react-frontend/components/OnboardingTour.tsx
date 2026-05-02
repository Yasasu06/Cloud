'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Step {
  title: string
  body: string
  highlight?: 'analyze-link' | 'instant-audit-link' | 'search-button' | null
  ctaPrimary: string
  ctaSecondary?: string
}

const STEPS: Step[] = [
  {
    title: 'Welcome to Cloud Intelligence',
    body: "Let's take a 60-second tour to show you what's possible.",
    ctaPrimary: 'Start Tour →',
    ctaSecondary: 'Skip Tour',
  },
  {
    title: 'AI Analyze',
    body: 'Start here. Describe any cloud situation in plain English and get expert analysis in 30 seconds.',
    highlight: 'analyze-link',
    ctaPrimary: 'Next →',
    ctaSecondary: '← Back',
  },
  {
    title: 'Instant Audit',
    body: 'Want a quick win? Try Instant Audit. Get a visual report of your cloud waste in 30 seconds.',
    highlight: 'instant-audit-link',
    ctaPrimary: 'Next →',
    ctaSecondary: '← Back',
  },
  {
    title: 'Quick search',
    body: 'Press Cmd+K (or Ctrl+K) anytime to quickly find any tool. We have 58 of them.',
    highlight: 'search-button',
    ctaPrimary: 'Next →',
    ctaSecondary: '← Back',
  },
  {
    title: "You're all set",
    body: "We've personalized your dashboard based on your role. Come back anytime — your analyses are saved.",
    ctaPrimary: 'Get Started →',
    ctaSecondary: '← Back',
  },
]

const STORAGE_KEY = 'onboarding_completed'

interface Props {
  forceOpen?: boolean
  onClose?: () => void
}

export default function OnboardingTour({ forceOpen, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (forceOpen) {
      setStep(0)
      setOpen(true)
      return
    }
    const completed = localStorage.getItem(STORAGE_KEY) === 'true'
    if (!completed) setOpen(true)
  }, [forceOpen])

  function close(completed: boolean) {
    if (completed) localStorage.setItem(STORAGE_KEY, 'true')
    setOpen(false)
    onClose?.()
  }

  function next() {
    if (step >= STEPS.length - 1) {
      close(true)
      router.push('/analyze')
    } else {
      setStep(s => s + 1)
    }
  }

  function back() {
    if (step === 0) close(false)
    else setStep(s => s - 1)
  }

  if (!open) return null
  const current = STEPS[step]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget && step === 0) close(false) }}
    >
      {/* Spotlight indicator (visual hint pointing to navbar area) */}
      {current.highlight && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 64,
          border: '2px solid #6366f1', borderRadius: 0,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
          pointerEvents: 'none',
          animation: 'pulseRing 1.5s ease-out infinite',
        }} />
      )}

      <div style={{
        background: '#0d0d18',
        border: '1px solid rgba(99,102,241,0.4)',
        borderRadius: 18, padding: '28px 30px', width: '100%', maxWidth: 460,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        position: 'relative',
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 22 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 22 : 6, height: 6, borderRadius: 3,
              background: i <= step ? '#6366f1' : 'rgba(255,255,255,0.12)',
              transition: 'all 0.2s',
            }} />
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>
          STEP {step + 1} OF {STEPS.length}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12, textAlign: 'center', lineHeight: 1.2 }}>
          {current.title}
        </h2>
        <p style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.6, textAlign: 'center', marginBottom: 24 }}>
          {current.body}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {current.ctaSecondary && (
            <button
              onClick={back}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 20px', color: '#a0a0b0', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              {current.ctaSecondary}
            </button>
          )}
          <button
            onClick={next}
            style={{ background: '#6366f1', border: 'none', borderRadius: 10, padding: '11px 24px', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            {current.ctaPrimary}
          </button>
        </div>
      </div>
    </div>
  )
}
