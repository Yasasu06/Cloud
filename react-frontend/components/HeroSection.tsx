'use client'

import { motion } from 'framer-motion'

const PROVIDER_LOGOS = [
  { label: 'AWS', color: '#FF9900', x: '15%', y: '25%', size: 64, delay: 0 },
  { label: 'Azure', color: '#0078D4', x: '75%', y: '20%', size: 72, delay: 1.5 },
  { label: 'GCP', color: '#34A853', x: '82%', y: '65%', size: 56, delay: 3 },
]

function FloatingLogo({
  label,
  color,
  x,
  y,
  size,
  delay,
}: {
  label: string
  color: string
  x: string
  y: string
  size: number
  delay: number
}) {
  return (
    <motion.div
      className="absolute hidden lg:flex items-center justify-center rounded-2xl font-bold text-white select-none pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: `${color}22`,
        border: `1px solid ${color}44`,
        backdropFilter: 'blur(8px)',
        fontSize: size * 0.22,
      }}
      animate={{
        y: [0, -18, 0],
        rotate: [0, 4, 0],
        opacity: [0.5, 0.85, 0.5],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {label}
    </motion.div>
  )
}

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden animated-gradient pt-16"
    >
      {/* Floating provider logos */}
      {PROVIDER_LOGOS.map((logo) => (
        <FloatingLogo key={logo.label} {...logo} />
      ))}

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{
              background: 'rgba(99,102,241,0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.25)',
            }}
          >
            Cloud Intelligence Platform v7.0
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span className="text-white">The Definitive</span>
          <br />
          <span className="gradient-text">Cloud Intelligence</span>
          <br />
          <span className="text-white">Platform</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Everything you need to know about AWS, Azure, and Google Cloud —
          in one place. Independent analysis. Real financial data. Always current.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', marginTop: 40 }}
        >
          <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 8 }}>Where do you want to start?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, maxWidth: 700, width: '100%' }}>
            {[
              { icon: '🌱', title: 'Never used cloud?', desc: 'Start from zero — we guide you step by step', link: '/start', color: '#22c55e', label: 'Begin Here →' },
              { icon: '⚡', title: 'Help me choose', desc: 'Answer 5 questions, get a personalized recommendation', link: '/advisor', color: '#6366f1', label: 'Get Advice →' },
              { icon: '☁️', title: 'Already on cloud?', desc: 'Optimize your multi-cloud setup and cut costs', link: '/multicloud', color: '#FF9900', label: 'Optimize Now →' },
            ].map(path => (
              <a key={path.title} href={path.link} style={{ textDecoration: 'none' }}>
                <div className="card-hover" style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${path.color}30`,
                  borderRadius: 16,
                  padding: 24,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{path.icon}</div>
                  <div style={{ fontWeight: 700, color: 'white', marginBottom: 8, fontSize: 15 }}>{path.title}</div>
                  <p style={{ color: '#a0a0b0', fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>{path.desc}</p>
                  <div style={{ color: path.color, fontSize: 13, fontWeight: 700, padding: '8px 16px', background: `${path.color}15`, borderRadius: 8, display: 'inline-block' }}>
                    {path.label}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5"
            style={{ borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <div
              className="w-1 h-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.4)' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
