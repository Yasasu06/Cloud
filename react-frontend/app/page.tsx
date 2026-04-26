'use client'

import HeroSection from '@/components/HeroSection'
import MarketPulse from '@/components/MarketPulse'
import ProviderCard from '@/components/ProviderCard'
import AiGrowthChart from '@/components/AiGrowthChart'
import { PROVIDERS, WHY_FEATURES } from '@/lib/data'
import { Shield, TrendingUp, RefreshCw, LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  TrendingUp,
  RefreshCw,
}

export default function HomePage() {
  return (
    <>
      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: Market Pulse */}
      <div id="market-data">
        <MarketPulse />
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
              <ProviderCard key={provider.key} name={provider.name} color={provider.color}
                marketShare={provider.marketShare} revenue={provider.revenue}
                growth={provider.growth} tag={provider.tag} description={provider.description} />
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
                  className="rounded-2xl p-6 text-center"
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
