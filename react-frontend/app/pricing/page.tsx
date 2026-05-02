'use client'
import { useRouter } from 'next/navigation'

interface Plan {
  key: string
  name: string
  price: number | null
  label: string
  features: string[]
  cta: string
  href: string
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    label: '$0/month',
    features: [
      'AI Analyze: 3 queries/day',
      'Cloud Advisor quiz',
      'Report Card',
      'Bill explanation (text paste only)',
    ],
    cta: 'Get Started Free',
    href: '/analyze',
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 49,
    label: '$49/month',
    features: [
      'Everything in Free',
      'Unlimited AI queries',
      'Bill upload (CSV/PDF)',
      'Cloud Twin profile',
      'Priority AI responses',
      'Save unlimited analyses',
    ],
    cta: 'Start Pro Trial',
    href: '/auth?plan=pro',
    popular: true,
  },
  {
    key: 'growth',
    name: 'Growth',
    price: 149,
    label: '$149/month',
    features: [
      'Everything in Pro',
      'Team access (5 seats)',
      'Weekly cloud cost digest email',
      'API access',
      'Custom recommendations',
      'Migration planning tools',
    ],
    cta: 'Start Growth Trial',
    href: '/auth?plan=growth',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 499,
    label: '$499/month',
    features: [
      'Everything in Growth',
      'Unlimited seats',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Quarterly strategy calls',
    ],
    cta: 'Contact Sales',
    href: 'mailto:hello@cloudintelligence.io',
  },
]

export default function PricingPage() {
  const router = useRouter()

  function handleCta(plan: Plan) {
    if (plan.href.startsWith('mailto:')) {
      window.location.href = plan.href
    } else {
      router.push(plan.href)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
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

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}>
          {PLANS.map(plan => (
            <div
              key={plan.key}
              style={{
                position: 'relative',
                background: plan.popular
                  ? 'linear-gradient(160deg, #1e1b4b 0%, #1a1a2e 100%)'
                  : '#1a1a2e',
                border: plan.popular
                  ? '2px solid #6366f1'
                  : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
              }}
            >
              {/* Most Popular badge */}
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#6366f1',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: '4px 14px',
                  borderRadius: 20,
                  whiteSpace: 'nowrap',
                }}>
                  MOST POPULAR
                </div>
              )}

              {/* Plan name */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', letterSpacing: 1 }}>
                  {plan.name.toUpperCase()}
                </span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: 'white' }}>
                  ${plan.price}
                </span>
                <span style={{ color: '#a0a0b0', fontSize: 14, marginLeft: 4 }}>/month</span>
              </div>

              {/* Features */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#d0d0e0', alignItems: 'flex-start' }}>
                    <span style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleCta(plan)}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 12,
                  border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  background: plan.popular ? '#6366f1' : 'transparent',
                  color: plan.popular ? 'white' : '#a0a0b0',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!plan.popular) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = 'white'
                  } else {
                    e.currentTarget.style.background = '#4f46e5'
                  }
                }}
                onMouseLeave={e => {
                  if (!plan.popular) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#a0a0b0'
                  } else {
                    e.currentTarget.style.background = '#6366f1'
                  }
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Performance pricing banner */}
        <div style={{ marginTop: 48, padding: '24px 28px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#22c55e', marginBottom: 4 }}>Only pay when we save you money</div>
            <div style={{ fontSize: 13, color: '#666' }}>Performance pricing: we take 15% of savings found. No savings → no charge.</div>
          </div>
          <button
            onClick={() => router.push('/performance-pricing')}
            style={{ background: '#22c55e', border: 'none', borderRadius: 10, padding: '10px 20px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Learn more →
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 40, color: '#555', fontSize: 13 }}>
          14-day free trial on paid tiers · No credit card required for Free plan · Questions?{' '}
          <a href="mailto:hello@cloudintelligence.io" style={{ color: '#6366f1', textDecoration: 'none' }}>
            hello@cloudintelligence.io
          </a>
        </div>
      </div>
    </div>
  )
}
