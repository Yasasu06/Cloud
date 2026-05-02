'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Step {
  title: string
  desc: string
  action?: { label: string; href?: string; onClick?: () => void }
}

const DEFAULT_STEPS: Step[] = [
  {
    title: 'Open AWS Console',
    desc: 'Sign in to the AWS Management Console. Make sure you\'re in the correct region for your workloads.',
    action: { label: 'Open AWS Console', href: 'https://console.aws.amazon.com' },
  },
  {
    title: 'Navigate to EC2 Instances',
    desc: 'In the AWS Console, search for "EC2" in the top bar, then click "Instances" in the left sidebar.',
    action: { label: 'Direct link to EC2 Instances', href: 'https://console.aws.amazon.com/ec2/v2/home#Instances' },
  },
  {
    title: 'Find over-provisioned instances',
    desc: 'Sort instances by "Instance type" and look for large instance types (m5.xlarge, c5.2xlarge+) with low CPU usage. Enable the CPU utilization column if not visible.',
  },
  {
    title: 'Stop the instance',
    desc: 'Select the instance → Actions → Instance State → Stop. Wait for the instance to fully stop before changing the type.',
  },
  {
    title: 'Change instance type',
    desc: 'Select the stopped instance → Actions → Instance Settings → Change Instance Type. Choose the recommended smaller type (e.g. m5.large → m5.medium).',
  },
  {
    title: 'Restart and verify',
    desc: 'Start the instance, monitor CPU/memory for 24 hours. If performance is acceptable, the optimization is complete.',
  },
]

interface Props {
  onClose: () => void
  savingEstimate?: string
}

export default function ImplementationWizard({ onClose, savingEstimate }: Props) {
  const [step, setStep]           = useState(0)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving]       = useState(false)

  const currentStep = DEFAULT_STEPS[step]
  const isLast = step === DEFAULT_STEPS.length - 1

  async function finish() {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.from('implementation_results').insert({
          user_id: session.user.id,
          recommendation: 'EC2 Right-sizing',
          action_taken: 'Completed 6-step implementation wizard',
          outcome: 'saved_money',
          saving_amount: 0,
          rating: 5,
          created_at: new Date().toISOString(),
        })
      }
    } catch { /* silent */ }
    setSaving(false)
    setCompleted(true)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        backdropFilter: 'blur(8px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#0d0d16', border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 20, padding: '28px', width: '100%', maxWidth: 520,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {completed ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, color: 'white' }}>Implementation Complete!</h2>
            {savingEstimate && (
              <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e', marginBottom: 12 }}>
                {savingEstimate} saved
              </div>
            )}
            <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Track your actual savings and share your result with the community.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <a href="/track-results" style={{ background: '#6366f1', borderRadius: 10, padding: '11px 22px', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                Share Results →
              </a>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 22px', color: '#a0a0b0', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: 1, marginBottom: 4 }}>IMPLEMENTATION WIZARD</div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>EC2 Right-Sizing</h2>
                {savingEstimate && <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 700, marginTop: 2 }}>Estimated saving: {savingEstimate}</div>}
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '2px 6px' }}>×</button>
            </div>

            {/* Progress bar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
              {DEFAULT_STEPS.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 4,
                  background: i <= step ? '#6366f1' : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>

            {/* Step counter */}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 10 }}>
              STEP {step + 1} OF {DEFAULT_STEPS.length}
            </div>

            {/* Step content */}
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, padding: '20px', marginBottom: 20, minHeight: 100 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 10 }}>
                {currentStep.title}
              </h3>
              <p style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.6, margin: 0 }}>
                {currentStep.desc}
              </p>
            </div>

            {/* Step action */}
            {currentStep.action && (
              <div style={{ marginBottom: 20 }}>
                {currentStep.action.href ? (
                  <a
                    href={currentStep.action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 16px', color: '#a0a0b0', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                  >
                    ↗ {currentStep.action.label}
                  </a>
                ) : null}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 20px', color: step === 0 ? '#333' : '#a0a0b0', cursor: step === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                ← Back
              </button>
              {isLast ? (
                <button
                  onClick={finish}
                  disabled={saving}
                  style={{ background: '#22c55e', border: 'none', borderRadius: 10, padding: '11px 28px', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  {saving ? 'Saving...' : '✓ Mark Complete'}
                </button>
              ) : (
                <button
                  onClick={() => setStep(s => s + 1)}
                  style={{ background: '#6366f1', border: 'none', borderRadius: 10, padding: '11px 28px', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  Next →
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
