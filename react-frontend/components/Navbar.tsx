'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const ANALYZE_ITEMS = [
  { href: '/analyze',            label: '🔍 AI Analyze',              desc: 'Explain any cloud situation' },
  { href: '/architecture',       label: '🏗️ Architecture',             desc: 'Visualize your stack' },
  { href: '/bill-upload',        label: '📊 Bill Upload',              desc: 'Analyze your actual bill' },
  { href: '/savings',            label: '💰 Savings Calculator',       desc: 'Find your savings' },
  { href: '/migration-cost',     label: '🔄 Egress Calculator',        desc: 'Cost to switch providers' },
  { href: '/forecast',           label: '📈 Cost Forecast',            desc: 'Project your cloud spend' },
  { href: '/multi-cloud',        label: '☁️ Multi-Cloud View',          desc: 'Consolidate all providers' },
  { href: '/terraform-estimator',label: '🏗️ Infrastructure Estimator', desc: 'Estimate infra costs' },
]

const ADVISE_ITEMS = [
  { href: '/advisor',            label: '🎯 Cloud Advisor',            desc: 'Get a recommendation' },
  { href: '/report-card',        label: '📋 Report Card',              desc: 'Grade your setup' },
  { href: '/benchmark',          label: '🏆 Cloud Score',              desc: 'Maturity assessment' },
  { href: '/ai-advisor',         label: '💼 AI Strategy',              desc: 'Full strategy session' },
  { href: '/roi-calculator',     label: '📈 ROI Calculator',           desc: 'Calculate your ROI' },
  { href: '/compliance',         label: '✅ Compliance',               desc: 'Check requirements' },
  { href: '/reserved-instances', label: '🔒 Reserved Instances',       desc: 'Optimize commitments' },
]

const INTELLIGENCE_ITEMS = [
  { href: '/vendor-alerts',  label: '💸 Price Alerts',        desc: 'Track price changes' },
  { href: '/weekly-digest',  label: '📰 Cloud Updates',       desc: 'Latest provider news' },
  { href: '/benchmark',      label: '📊 Benchmarks',          desc: 'Compare to industry' },
  { href: '/cloud-glossary', label: '📚 Glossary',            desc: 'Cloud terms explained' },
]

const MOBILE_LINKS = [
  { href: '/',                    label: 'Home' },
  { href: '/analyze',             label: 'AI Analyze' },
  { href: '/architecture',        label: 'Architecture' },
  { href: '/bill-upload',         label: 'Bill Upload' },
  { href: '/savings',             label: 'Savings Calculator' },
  { href: '/migration-cost',      label: 'Egress Calculator' },
  { href: '/forecast',            label: 'Cost Forecast' },
  { href: '/multi-cloud',         label: 'Multi-Cloud View' },
  { href: '/terraform-estimator', label: 'Infrastructure Estimator' },
  { href: '/advisor',             label: 'Cloud Advisor' },
  { href: '/report-card',         label: 'Report Card' },
  { href: '/ai-advisor',          label: 'AI Strategy' },
  { href: '/roi-calculator',      label: 'ROI Calculator' },
  { href: '/compliance',          label: 'Compliance' },
  { href: '/reserved-instances',  label: 'Reserved Instances' },
  { href: '/vendor-alerts',       label: 'Price Alerts' },
  { href: '/benchmark',           label: 'Benchmarks' },
  { href: '/cloud-glossary',      label: 'Glossary' },
  { href: '/pricing',             label: 'Pricing' },
]

function DropdownMenu({ items, open }: { items: typeof ANALYZE_ITEMS; open: boolean }) {
  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: '50%',
      transform: open ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-8px)',
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'auto' : 'none',
      transition: 'all 0.15s ease',
      background: 'rgba(5,5,8,0.98)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      padding: 8,
      minWidth: 240,
      zIndex: 100,
      boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    }}>
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            display: 'block', padding: '10px 14px', borderRadius: 10,
            textDecoration: 'none', transition: 'background 0.1s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', marginBottom: 2 }}>{item.label}</div>
          <div style={{ fontSize: 11, color: '#555' }}>{item.desc}</div>
        </Link>
      ))}
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const analyzeActive      = ['/analyze', '/architecture', '/bill-upload', '/savings', '/migration-cost', '/forecast', '/multi-cloud', '/terraform-estimator'].includes(pathname)
  const adviseActive       = ['/advisor', '/report-card', '/benchmark', '/ai-advisor', '/roi-calculator', '/compliance', '/reserved-instances'].includes(pathname)
  const intelligenceActive = ['/vendor-alerts', '/weekly-digest', '/cloud-glossary'].includes(pathname)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(5,5,8,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" style={{ textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, transition: 'transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              ⚡
            </div>
            <span style={{ fontWeight: 800, color: 'white', fontSize: 14, letterSpacing: '-0.01em' }}
              className="hidden sm:block">
              Cloud Intelligence
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">

            <Link href="/" style={{
              fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
              color: pathname === '/' ? '#fff' : '#a0a0b0',
              background: pathname === '/' ? 'rgba(99,102,241,0.15)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            }}>
              Home
            </Link>

            {/* Analyze dropdown */}
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setOpenDropdown('analyze')}
              onMouseLeave={() => setOpenDropdown(null)}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
                color: analyzeActive ? '#fff' : '#a0a0b0',
                background: analyzeActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                Analyze <ChevronDown size={12} style={{ opacity: 0.6, transition: 'transform 0.15s', transform: openDropdown === 'analyze' ? 'rotate(180deg)' : 'none' }} />
              </button>
              <DropdownMenu items={ANALYZE_ITEMS} open={openDropdown === 'analyze'} />
            </div>

            {/* Advise dropdown */}
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setOpenDropdown('advise')}
              onMouseLeave={() => setOpenDropdown(null)}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
                color: adviseActive ? '#fff' : '#a0a0b0',
                background: adviseActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                Advise <ChevronDown size={12} style={{ opacity: 0.6, transition: 'transform 0.15s', transform: openDropdown === 'advise' ? 'rotate(180deg)' : 'none' }} />
              </button>
              <DropdownMenu items={ADVISE_ITEMS} open={openDropdown === 'advise'} />
            </div>

            {/* Intelligence dropdown */}
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setOpenDropdown('intelligence')}
              onMouseLeave={() => setOpenDropdown(null)}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
                color: intelligenceActive ? '#fff' : '#a0a0b0',
                background: intelligenceActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                Intelligence <ChevronDown size={12} style={{ opacity: 0.6, transition: 'transform 0.15s', transform: openDropdown === 'intelligence' ? 'rotate(180deg)' : 'none' }} />
              </button>
              <DropdownMenu items={INTELLIGENCE_ITEMS} open={openDropdown === 'intelligence'} />
            </div>

            <Link href="/pricing" style={{
              fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
              color: pathname === '/pricing' ? '#fff' : '#a0a0b0',
              background: pathname === '/pricing' ? 'rgba(99,102,241,0.15)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            }}>
              Pricing
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {loggedIn ? (
              <Link href="/dashboard" className="hidden sm:block text-sm font-medium" style={{
                color: pathname === '/dashboard' ? '#fff' : '#a0a0b0',
                padding: '6px 12px', textDecoration: 'none',
                background: pathname === '/dashboard' ? 'rgba(99,102,241,0.15)' : 'transparent',
                borderRadius: 8,
              }}>
                Dashboard
              </Link>
            ) : (
              <Link href="/auth" className="hidden sm:block text-sm font-medium" style={{
                color: '#a0a0b0', padding: '6px 12px', textDecoration: 'none',
              }}>
                Sign In
              </Link>
            )}
            <Link
              href="/analyze"
              className="hidden sm:block btn-primary animate-glow"
              style={{ fontSize: 13, padding: '8px 18px' }}
            >
              Get Started Free
            </Link>
            <button
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-white transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-4 py-3 space-y-1"
          style={{ background: 'rgba(5,5,8,0.98)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {MOBILE_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                color: pathname === link.href ? '#ffffff' : '#a0a0b0',
                background: pathname === link.href ? 'rgba(99,102,241,0.1)' : 'transparent',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
          {loggedIn ? (
            <Link href="/dashboard" onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium"
              style={{ color: '#a0a0b0', textDecoration: 'none' }}>
              Dashboard
            </Link>
          ) : (
            <Link href="/auth" onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium"
              style={{ color: '#a0a0b0', textDecoration: 'none' }}>
              Sign In
            </Link>
          )}
          <Link
            href="/analyze"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-white text-center mt-2"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', textDecoration: 'none' }}
          >
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  )
}
