'use client'
import { PLANS } from '@/lib/stripe'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 12 }}>
            PRICING
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
            Simple, transparent pricing
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 18 }}>
            Start free. Upgrade when you need more. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {Object.entries(PLANS).map(([key, plan]) => (
            <div key={key} style={{
              background: key === 'pro' ? 'linear-gradient(135deg, #1e1b4b, #1a1a2e)' : '#1a1a2e',
              borderRadius: 20,
              padding: 32,
              border: key === 'pro' ? '2px solid #6366f1' : '1px solid #ffffff08',
              position: 'relative',
            }}>
              {key === 'pro' && (
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#6366f1',
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{plan.name}</div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 800 }}>${plan.price}</span>
                {plan.price > 0 && (
                  <span style={{ color: '#a0a0b0' }}>/month</span>
                )}
              </div>
              <div style={{ marginBottom: 32 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 12, fontSize: 14, color: '#e0e0e0' }}>
                    <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push(plan.price === 0 ? '/auth' : '/auth?plan=' + key)}
                style={{
                  width: '100%',
                  background: key === 'pro' ? '#6366f1' : 'transparent',
                  color: 'white',
                  border: key === 'pro' ? 'none' : '1px solid #ffffff30',
                  borderRadius: 12,
                  padding: '14px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {plan.price === 0 ? 'Get Started Free' : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 60, color: '#a0a0b0', fontSize: 14 }}>
          All plans include a 14-day free trial on paid tiers.
          No credit card required for Free plan.
          Questions? Email us at hello@cloudintelligence.io
        </div>
      </div>
    </div>
  )
}
