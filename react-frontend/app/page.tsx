'use client'

import HeroSection from '@/components/HeroSection'
import ProviderCard from '@/components/ProviderCard'
import { PROVIDERS } from '@/lib/data'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { motion } from 'framer-motion'

const CHAT_SUGGESTIONS = [
  'Which cloud is cheapest for a startup?',
  'AWS vs Azure for enterprise?',
  'Best cloud for AI/ML workloads?',
  'How do I reduce my cloud bill?',
]

export default function HomePage() {
  const router = useRouter()
  const [chatInput, setChatInput] = useState('')

  function handleChatSubmit(text?: string) {
    const q = text || chatInput.trim()
    if (!q) return
    router.push(`/intent?q=${encodeURIComponent(q)}`)
  }

  return (
    <>
      {/* Vendor neutrality strip */}
      <div style={{
        background: 'rgba(34,197,94,0.05)',
        borderBottom: '1px solid rgba(34,197,94,0.15)',
        padding: '10px 24px',
        textAlign: 'center',
        fontSize: 13,
        color: '#22c55e',
      }}>
        ✓ 100% Vendor Neutral — No AWS, Azure, or GCP sponsorship. Our recommendations are unbiased by design.
      </div>

      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: Inline intent teaser */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        style={{ padding: '64px 24px', borderTop: '1px solid #ffffff08', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: 2 }}>
            AI-POWERED ANALYSIS
          </p>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
            Describe your project. Get your cloud blueprint.
          </h2>
          <p style={{ color: '#a0a0b0', marginBottom: 28, fontSize: 15 }}>
            No forms, no jargon — just tell us what you&apos;re building.
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            background: '#1a1a2e',
            borderRadius: 14,
            padding: '8px 8px 8px 16px',
            border: '1px solid #ffffff10',
            marginBottom: 16,
          }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
              placeholder="e.g. I want to build a healthcare app for 500 doctors in Europe..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: 15,
              }}
            />
            <button
              onClick={() => handleChatSubmit()}
              disabled={!chatInput.trim()}
              style={{
                background: '#6366f1',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                opacity: !chatInput.trim() ? 0.5 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              Analyze My Project →
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {CHAT_SUGGESTIONS.map(q => (
              <button
                key={q}
                onClick={() => handleChatSubmit(q)}
                style={{
                  background: '#1a1a2e',
                  border: '1px solid #ffffff15',
                  borderRadius: 20,
                  padding: '6px 14px',
                  color: '#a0a0b0',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Section 3: Market Pulse */}
      <motion.div
        id="market-data"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        style={{ padding: '60px 24px', textAlign: 'center', borderTop: '1px solid #ffffff08' }}
      >
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
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div
                  className="card-hover"
                  style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, border: '1px solid #ffffff08', cursor: 'default' }}
                >
                  <div style={{ fontSize: 36, fontWeight: 800, color: metric.color, marginBottom: 8 }}>{metric.value}</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{metric.label}</div>
                  <div style={{ color: '#a0a0b0', fontSize: 12 }}>{metric.change}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="max-w-[260px] bg-[#0a0a0f] text-[#e0e0e0] p-4"
                style={{ border: `1px solid ${metric.color}` }}
              >
                <p className="font-bold mb-2" style={{ color: metric.color }}>What this means for you:</p>
                <p className="text-sm leading-relaxed">{metric.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </motion.div>

      {/* Section 4: How It Works */}
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
        <p style={{ color: '#a0a0b0', marginBottom: 48, maxWidth: 500, margin: '0 auto 32px' }}>
          No jargon. No bias. Just clear guidance based on your actual situation.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 48, flexWrap: 'wrap' }}>
          {[
            { icon: '🚫', text: 'No vendor sponsorships' },
            { icon: '⚡', text: 'AI-powered in seconds' },
            { icon: '💰', text: 'Free to start' },
            { icon: '🌍', text: 'Covers 9+ providers' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a0a0b0', fontSize: 14 }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
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

      {/* Section 5: Provider Cards */}
      <section className="py-20 px-4" style={{ background: '#0a0a0f' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-[#6366f1]">
              The Big Three
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Cloud providers at a glance
            </h2>
            <p className="text-base max-w-xl mx-auto text-[#a0a0b0]">
              Q4 2025 figures from official earnings calls and SEC filings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROVIDERS.map((provider, index) => (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-hover"
              >
                <ProviderCard name={provider.name} color={provider.color}
                  marketShare={provider.marketShare} revenue={provider.revenue}
                  growth={provider.growth} tag={provider.tag} description={provider.description} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Bottom CTA */}
      <section style={{ borderTop: '1px solid #ffffff10', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          READY TO DECIDE?
        </p>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, color: 'white' }}>
          Get your personalized cloud recommendation
        </h2>
        <p style={{ color: '#a0a0b0', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
          Built for founders, developers, and IT managers who need clear cloud answers without the consultant price tag.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/intent" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '14px 36px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}>
              Analyze My Project →
            </button>
          </a>
          <a href="/chat" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid #ffffff30',
              borderRadius: 12,
              padding: '14px 36px',
              fontSize: 16,
              cursor: 'pointer',
            }}>
              Ask the AI
            </button>
          </a>
        </div>
      </section>
    </>
  )
}
