'use client'

import HeroSection from '@/components/HeroSection'
import ProviderCard from '@/components/ProviderCard'
import AiGrowthChart from '@/components/AiGrowthChart'
import { PROVIDERS, WHY_FEATURES } from '@/lib/data'
import { Shield, TrendingUp, RefreshCw, LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  TrendingUp,
  RefreshCw,
}

export default function HomePage() {
  const router = useRouter()
  return (
    <>
      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: Market Pulse */}
      <div id="market-data" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: 2 }}>MARKET PULSE</p>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>The numbers that define the cloud era</h2>
        <p style={{ color: '#a0a0b0', marginBottom: 40, fontSize: 15 }}>Hover over any number to understand what it means for you.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          {[
            { value: '$855B', label: 'Cloud Market Size', color: '#6366f1', change: '+19% from 2025', tooltip: 'The total amount spent on cloud computing globally in 2026. To put this in perspective — this is bigger than the entire GDP of Switzerland. If you are not on cloud yet, your competitors probably are.' },
            { value: '19%', label: 'Annual Growth Rate', color: '#0078D4', change: 'CAGR through 2029', tooltip: 'The cloud market grows 19% every single year. Most mature industries grow 2-3%. This means cloud spending will nearly double every 4 years. Choosing the right provider now matters more than ever.' },
            { value: '47%', label: 'AI Cloud Growth', color: '#34A853', change: 'Year over year 2026', tooltip: 'The AI portion of cloud is growing at 47% per year — more than twice the overall cloud growth rate. Azure leads this race through its OpenAI partnership. If your project involves AI, this number directly affects which provider you should choose.' },
            { value: '89%', label: 'Multi-cloud Adoption', color: '#FF9900', change: 'Of enterprises in 2026', tooltip: '89% of large enterprises use more than one cloud provider. They use AWS for some workloads, Azure for others, GCP for AI. This does not mean you should start with multiple clouds — begin with one, expand when you have a specific reason.' },
          ].map((metric, i) => (
            <div
              key={i}
              className="card-hover"
              style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, border: '1px solid #ffffff08', position: 'relative', cursor: 'default' }}
              onMouseEnter={e => {
                const tooltip = e.currentTarget.querySelector('.metric-tooltip') as HTMLElement
                if (tooltip) { tooltip.style.opacity = '1'; tooltip.style.visibility = 'visible' }
              }}
              onMouseLeave={e => {
                const tooltip = e.currentTarget.querySelector('.metric-tooltip') as HTMLElement
                if (tooltip) { tooltip.style.opacity = '0'; tooltip.style.visibility = 'hidden' }
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 800, color: metric.color, marginBottom: 8 }}>{metric.value}</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{metric.label}</div>
              <div style={{ color: '#a0a0b0', fontSize: 12 }}>{metric.change}</div>
              <div className="metric-tooltip" style={{
                position: 'absolute', bottom: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)',
                background: '#0a0a0f', border: `1px solid ${metric.color}`, borderRadius: 12, padding: 16,
                width: 260, fontSize: 13, lineHeight: 1.6, color: '#e0e0e0',
                opacity: 0, visibility: 'hidden', transition: 'opacity 0.2s ease', zIndex: 100,
                textAlign: 'left', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              }}>
                <div style={{ color: metric.color, fontWeight: 700, marginBottom: 8, fontSize: 14 }}>What this means for you:</div>
                {metric.tooltip}
                <div style={{
                  position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                  width: 12, height: 12, background: '#0a0a0f',
                  border: `1px solid ${metric.color}`, borderTop: 'none', borderLeft: 'none', rotate: '45deg',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2b: Who is this for? */}
      <div style={{ padding: '60px 24px', borderTop: '1px solid #ffffff08' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: 2 }}>WHO IS THIS FOR?</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 40 }}>Built for everyone making cloud decisions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            {[
              { icon: '👨‍💻', persona: 'Developer', desc: 'Starting a personal project or side business and need the cheapest reliable option', link: '/start', cta: 'Start Here →', color: '#22c55e' },
              { icon: '🚀', persona: 'Founder', desc: 'Building a startup and need to choose a cloud that scales without breaking the bank', link: '/advisor', cta: 'Get Advice →', color: '#6366f1' },
              { icon: '🏢', persona: 'IT Manager', desc: 'Evaluating providers for your organization and need compliance and cost data', link: '/executive', cta: 'Get Report →', color: '#0078D4' },
              { icon: '☁️', persona: 'Multi-cloud User', desc: 'Already using multiple clouds and need help deciding which workload goes where', link: '/multicloud', cta: 'Optimize Now →', color: '#FF9900' },
            ].map(p => (
              <a key={p.persona} href={p.link} style={{ textDecoration: 'none' }}>
                <div className="card-hover" style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, border: '1px solid #ffffff08', height: '100%', cursor: 'pointer' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{p.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: 'white' }}>{p.persona}</div>
                  <p style={{ color: '#a0a0b0', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</p>
                  <div style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>{p.cta}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Provider Cards */}
      <section className="py-20 px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--accent)' }}
            >
              The Big Three
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Cloud providers at a glance
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Q4 2025 figures from official earnings calls and SEC filings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROVIDERS.map((provider) => (
              <div key={provider.key} className="card-hover">
                <ProviderCard name={provider.name} color={provider.color}
                  marketShare={provider.marketShare} revenue={provider.revenue}
                  growth={provider.growth} tag={provider.tag} description={provider.description} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: AI Growth Chart */}
      <AiGrowthChart />

      {/* Section 5: Why This Tool */}
      <section className="py-20 px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--accent)' }}
            >
              Why This Platform
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Built for serious cloud decisions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY_FEATURES.map((feature) => {
              const Icon = ICON_MAP[feature.icon]
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl p-6 text-center card-hover"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(99,102,241,0.15)' }}
                  >
                    {Icon && <Icon size={22} style={{ color: 'var(--accent)' }} />}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '80px 24px',
        borderTop: '1px solid #ffffff08',
        borderBottom: '1px solid #ffffff08',
        textAlign: 'center',
      }}>
        <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: 2 }}>
          HOW IT WORKS
        </p>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
          From confusion to confident decision in 3 steps
        </h2>
        <p style={{ color: '#a0a0b0', marginBottom: 48, maxWidth: 500, margin: '0 auto 48px' }}>
          No jargon. No bias. Just clear guidance based on your actual situation.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, maxWidth: 800, margin: '0 auto' }}>
          {[
            { step: '01', title: 'Tell us about yourself', desc: 'Answer 5 quick questions about your team, workload, and budget. Takes 60 seconds.', icon: '🎯' },
            { step: '02', title: 'Get your recommendation', desc: 'Our engine scores every provider against your specific needs and tells you exactly why.', icon: '⚡' },
            { step: '03', title: 'Plan with confidence', desc: 'See cost projections, migration complexity, and compliance requirements — all in one place.', icon: '🚀' },
          ].map((s) => (
            <div key={s.step} className="card-hover" style={{
              background: '#1a1a2e',
              borderRadius: 16,
              padding: 32,
              textAlign: 'center',
              border: '1px solid #ffffff08',
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ color: '#6366f1', fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: 2 }}>
                STEP {s.step}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
              <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Journey CTA */}
      <section style={{ borderTop: '1px solid #ffffff10', background: 'var(--bg-secondary)' }}>
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            YOUR JOURNEY STARTS HERE
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, color: 'white' }}>
            Not sure where to begin?
          </h2>
          <p style={{ color: '#a0a0b0', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
            Answer 3 quick questions and we will tell you exactly which cloud
            fits your situation — no jargon, no confusion.
          </p>
          <button
            onClick={() => router.push('/start')}
            className="btn-primary"
            style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 12, padding: '16px 40px', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
          >
            Start My Cloud Journey →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-4 text-center text-sm border-t"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        <p>
          Cloud Intelligence Platform · Data sourced from SEC filings &amp; earnings calls ·
          Updated Q4 2025
        </p>
      </footer>
    </>
  )
}
