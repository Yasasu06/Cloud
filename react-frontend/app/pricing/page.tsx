'use client'
import { PLANS } from '@/lib/stripe'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

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
            <Card key={key} className={`relative ${key === 'pro'
              ? 'bg-gradient-to-b from-[#1e1b4b] to-[#1a1a2e] border-[#6366f1] border-2'
              : 'bg-[#1a1a2e] border-[#ffffff08]'}`}>
              {key === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#6366f1] text-white px-4">MOST POPULAR</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-4xl font-black text-white">${plan.price}</span>
                  {plan.price > 0 && <span className="text-[#a0a0b0]">/month</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.features.map(f => (
                  <div key={f} className="flex gap-2 text-sm text-[#e0e0e0]">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    {f}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => router.push(plan.price === 0 ? '/auth' : '/auth?plan=' + key)}
                  className={`w-full font-semibold ${key === 'pro'
                    ? 'bg-[#6366f1] hover:bg-[#4f46e5] text-white'
                    : 'bg-transparent border border-[#ffffff30] text-white hover:bg-[#ffffff10]'}`}
                  variant={key === 'pro' ? 'default' : 'outline'}
                >
                  {plan.price === 0 ? 'Get Started Free' : `Get ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
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
