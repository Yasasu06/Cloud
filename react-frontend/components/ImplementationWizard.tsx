'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Step {
  title: string
  desc: string
  action?: { label: string; href?: string }
  type?: 'preflight' | 'rollback' | 'normal'
}

const PREFLIGHT_ITEMS = [
  "I've tested this in non-production",
  "I've backed up my data",
  "I have a rollback plan",
  "I've notified my team",
]

const ROLLBACK_STEPS = [
  'Open AWS Console and navigate to the EC2 service that was changed',
  'Find the instance you modified — sort by "Last Modified" or use the resource history',
  'Stop the instance (Actions → Instance State → Stop)',
  'Change instance type back to the original size (Actions → Instance Settings → Change Instance Type)',
  'Start the instance and verify CPU/memory metrics return to expected baseline',
  'If you committed Reserved Instances, contact AWS Support to discuss the modification window',
]

const CORE_STEPS: Step[] = [
  {
    title: 'Open AWS Console',
    desc: 'Sign in to the AWS Management Console. Make sure you\'re in the correct region for your workloads.',
    action: { label: 'Open AWS Console', href: 'https://console.aws.amazon.com' },
    type: 'normal',
  },
  {
    title: 'Navigate to EC2 Instances',
    desc: 'In the AWS Console, search for "EC2" in the top bar, then click "Instances" in the left sidebar.',
    action: { label: 'Direct link to EC2 Instances', href: 'https://console.aws.amazon.com/ec2/v2/home#Instances' },
    type: 'normal',
  },
  {
    title: 'Find over-provisioned instances',
    desc: 'Sort instances by "Instance type" and look for large instance types (m5.xlarge, c5.2xlarge+) with low CPU usage. Enable the CPU utilization column if not visible.',
    type: 'normal',
  },
  {
    title: 'Stop the instance',
    desc: 'Select the instance → Actions → Instance State → Stop. Wait for the instance to fully stop before changing the type.',
    type: 'normal',
  },
  {
    title: 'Change instance type',
    desc: 'Select the stopped instance → Actions → Instance Settings → Change Instance Type. Choose the recommended smaller type (e.g. m5.large → m5.medium).',
    type: 'normal',
  },
  {
    title: 'Restart and verify',
    desc: 'Start the instance, monitor CPU/memory for 24 hours. If performance is acceptable, the optimization is complete.',
    type: 'normal',
  },
]

const ALL_STEPS: Step[] = [
  {
    title: 'Pre-flight Checklist',
    desc: 'Before making changes, confirm you\'ve completed each safety check below.',
    type: 'preflight',
  },
  ...CORE_STEPS,
  {
    title: 'Rollback Procedure',
    desc: 'If something goes wrong after this change, follow these steps to undo it. Save this for your records.',
    type: 'rollback',
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
  const [preflight, setPreflight] = useState<boolean[]>(PREFLIGHT_ITEMS.map(() => false))

  const currentStep = ALL_STEPS[step]
  const isLast = step === ALL_STEPS.length - 1
  const allPreflightChecked = preflight.every(Boolean)
  const canAdvance = currentStep.type !== 'preflight' || allPreflightChecked

  async function finish() {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.from('implementation_results').insert({
          user_id: session.user.id,
          recommendation: 'EC2 Right-sizing',
          action_taken: 'Completed implementation wizard with preflight + rollback',
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
        borderRadius: 20, padding: '28px', width: '100%', maxWidth: 560,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto',
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
              {ALL_STEPS.map((s, i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 4,
                  background: i <= step
                    ? (s.type === 'preflight' ? '#f59e0b' : s.type === 'rollback' ? '#ef4444' : '#6366f1')
                    : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>

            {/* Step counter */}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 10 }}>
              {currentStep.type === 'preflight' && '🛡️ '}
              {currentStep.type === 'rollback' && '↩️ '}
              STEP {step + 1} OF {ALL_STEPS.length}
              {currentStep.type === 'preflight' && ' — SAFETY CHECK'}
              {currentStep.type === 'rollback' && ' — UNDO PROCEDURE'}
            </div>

            {/* Step content */}
            <div style={{
              background: currentStep.type === 'preflight' ? 'rgba(245,158,11,0.06)'
                       : currentStep.type === 'rollback'  ? 'rgba(239,68,68,0.06)'
                       : 'rgba(99,102,241,0.06)',
              border: `1px solid ${currentStep.type === 'preflight' ? 'rgba(245,158,11,0.18)' : currentStep.type === 'rollback' ? 'rgba(239,68,68,0.18)' : 'rgba(99,102,241,0.15)'}`,
              borderRadius: 14, padding: '20px', marginBottom: 20,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 10 }}>
                {currentStep.title}
              </h3>
              <p style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.6, margin: 0 }}>
                {currentStep.desc}
              </p>

              {/* Pre-flight checklist */}
              {currentStep.type === 'preflight' && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PREFLIGHT_ITEMS.map((item, i) => (
                    <label key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                      padding: '10px 12px', borderRadius: 8,
                      background: preflight[i] ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${preflight[i] ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.06)'}`,
                      transition: 'all 0.15s',
                    }}>
                      <input
                        type="checkbox"
                        checked={preflight[i]}
                        onChange={e => setPreflight(prev => prev.map((v, idx) => idx === i ? e.target.checked : v))}
                        style={{ width: 18, height: 18, accentColor: '#22c55e', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 13, color: preflight[i] ? '#d0d0e0' : '#a0a0b0' }}>{item}</span>
                    </label>
                  ))}
                  {!allPreflightChecked && (
                    <p style={{ fontSize: 11, color: '#f59e0b', margin: '4px 0 0' }}>
                      All four checks required to proceed.
                    </p>
                  )}
                </div>
              )}

              {/* Rollback procedure */}
              {currentStep.type === 'rollback' && (
                <ol style={{ marginTop: 16, paddingLeft: 0, listStyle: 'none' }}>
                  {ROLLBACK_STEPS.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.12)', borderRadius: 5, padding: '2px 7px', flexShrink: 0, height: 'fit-content', marginTop: 2 }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 13, color: '#d0d0e0', lineHeight: 1.6 }}>{s}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Step action link */}
            {currentStep.action?.href && (
              <div style={{ marginBottom: 20 }}>
                <a
                  href={currentStep.action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 16px', color: '#a0a0b0', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                >
                  ↗ {currentStep.action.label}
                </a>
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
                  disabled={!canAdvance}
                  style={{
                    background: canAdvance ? '#6366f1' : 'rgba(99,102,241,0.3)',
                    border: 'none', borderRadius: 10, padding: '11px 28px',
                    color: 'white', fontWeight: 700, fontSize: 14,
                    cursor: canAdvance ? 'pointer' : 'not-allowed',
                  }}
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
