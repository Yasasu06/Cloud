'use client'

export type UserMode = 'plain' | 'technical'

const KEY = 'user_mode'

export function getUserMode(): UserMode {
  if (typeof window === 'undefined') return 'plain'
  const stored = localStorage.getItem(KEY)
  if (stored === 'technical' || stored === 'plain') return stored
  return 'plain'
}

export function setUserMode(mode: UserMode) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, mode)
  window.dispatchEvent(new CustomEvent('userModeChange', { detail: mode }))
}

export function modeInstruction(mode: UserMode): string {
  if (mode === 'plain') {
    return `\n\nIMPORTANT — PLAIN ENGLISH MODE:
- Avoid jargon. When you must use technical terms (EC2, RDS, VPC, S3, etc.), briefly define them in parentheses on first use.
- Use everyday analogies. Compare cloud concepts to familiar things ("Reserved Instances are like prepaying gym membership for a discount").
- Keep step-by-step instructions specific and actionable.
- Prefer dollar amounts and percentages over technical specs.`
  }
  return ''
}
