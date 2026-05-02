'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import GlobalSearch from './GlobalSearch'
import ModeToggle from './ModeToggle'

const ANALYZE_ITEMS = [
  { href: '/analyze',         label: '🔍 AI Analyze',       desc: 'Explain any cloud situation' },
  { href: '/instant-audit',   label: '⚡ Instant Audit',     desc: 'Free 30-second cloud audit' },
  { href: '/architecture',    label: '🏗️ Architecture',      desc: 'Visualize your stack' },
  { href: '/bill-upload',     label: '📊 Bill Upload',       desc: 'Analyze your actual bill' },
]

const OPTIMIZE_ITEMS = [
  { href: '/optimize',           label: '💰 Optimize',           desc: 'Savings, waste, RI, quick wins' },
  { href: '/cost-intelligence',  label: '📊 Cost Intelligence',  desc: 'Forecast, per-user, credits, AI cost' },
  { href: '/migrate',            label: '🔄 Migrate',            desc: 'Plan, egress, repatriation' },
  { href: '/outcome-simulator',  label: '🔮 Outcome Simulator',  desc: 'Visual journey current → optimized' },
]

const ADVISE_ITEMS = [
  { href: '/advisor',         label: '🎯 Cloud Advisor',  desc: 'Get a recommendation' },
  { href: '/cloud-score',     label: '🏆 Cloud Score',    desc: 'Maturity assessment' },
  { href: '/report-card',     label: '📋 Report Card',    desc: 'Grade your setup' },
  { href: '/ai-advisor',      label: '💼 AI Strategy',    desc: 'Full strategy session' },
  { href: '/sanity-check',    label: '🛟 Sanity Check',   desc: 'Pre-decision review' },
  { href: '/compliance',      label: '✅ Compliance',     desc: 'Check requirements' },
]

const INTELLIGENCE_ITEMS = [
  { href: '/pricing-explorer', label: '💰 Live Pricing',     desc: 'Compare 12 providers in real time' },
  { href: '/compare',          label: '⚖️ Compare',           desc: 'Side-by-side qualitative comparison' },
  { href: '/intelligence',     label: '📰 Intelligence Hub', desc: 'News, alerts, weekly digest' },
  { href: '/stats',            label: '📊 Live Stats',       desc: 'Aggregated user results' },
]

const LEARN_ITEMS = [
  { href: '/learn',            label: '📚 Learn',            desc: 'Glossary, benchmarks, cloud twin' },
]

const CONSULTANTS_ITEMS = [
  { href: '/for-consultants',  label: '💼 For Consultants',  desc: 'White label, experts, performance pricing' },
]

const MOBILE_LINKS = [
  { href: '/',                    label: 'Home' },
  { href: '/analyze',             label: 'AI Analyze' },
  { href: '/instant-audit',       label: 'Instant Audit' },
  { href: '/architecture',        label: 'Architecture' },
  { href: '/bill-upload',         label: 'Bill Upload' },
  { href: '/savings',             label: 'Savings Calculator' },
  { href: '/migration-cost',      label: 'Egress Calculator' },
  { href: '/forecast',            label: 'Cost Forecast' },
  { href: '/multi-cloud',         label: 'Multi-Cloud View' },
  { href: '/terraform-estimator', label: 'Infrastructure Estimator' },
  { href: '/cost-per-user',       label: 'Cost Per User' },
  { href: '/ai-cost-tracker',     label: 'AI Costs' },
  { href: '/advisor',             label: 'Cloud Advisor' },
  { href: '/report-card',         label: 'Report Card' },
  { href: '/cloud-score',         label: 'Cloud Score' },
  { href: '/ai-advisor',          label: 'AI Strategy' },
  { href: '/roi-calculator',      label: 'ROI Calculator' },
  { href: '/compliance',          label: 'Compliance' },
  { href: '/reserved-instances',  label: 'Reserved Instances' },
  { href: '/credits-tracker',     label: 'Credits Tracker' },
  { href: '/sanity-check',        label: 'Sanity Check' },
  { href: '/pricing-explorer',    label: 'Pricing Explorer' },
  { href: '/stats',               label: 'Live Stats' },
  { href: '/vendor-alerts',       label: 'Price Alerts' },
  { href: '/benchmark',           label: 'Industry Benchmarks' },
  { href: '/cloud-glossary',      label: 'Glossary' },
  { href: '/waste-report',        label: 'Waste Report' },
  { href: '/alternatives',        label: 'All Providers' },
  { href: '/replaces',            label: 'What We Replace' },
  { href: '/pricing',             label: 'Pricing' },
]

function DropdownMenu({ items, open, onClose }: { items: typeof ANALYZE_ITEMS; open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div
      data-dropdown
      style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        paddingTop: 8,
        zIndex: 100,
      }}
    >
      <div style={{
        background: 'rgba(5,5,8,0.98)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        padding: 8,
        minWidth: 240,
        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        animation: 'pageEnter 0.15s ease-out',
      }}>
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
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
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => { setMenuOpen(false); setOpenDropdown(null) }, [pathname])

  // Click-outside closes dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const analyzeActive      = ['/analyze', '/architecture', '/bill-upload', '/savings', '/migration-cost', '/forecast', '/multi-cloud', '/terraform-estimator'].includes(pathname)
  const adviseActive       = ['/advisor', '/report-card', '/benchmark', '/ai-advisor', '/roi-calculator', '/compliance', '/reserved-instances'].includes(pathname)
  const intelligenceActive = ['/vendor-alerts', '/weekly-digest', '/cloud-glossary', '/waste-report'].includes(pathname)

  function toggle(name: string) {
    setOpenDropdown(prev => prev === name ? null : name)
  }

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
            <div data-dropdown style={{ position: 'relative' }}>
              <button
                data-dropdown
                onClick={(e) => { e.stopPropagation(); toggle('analyze') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
                  color: analyzeActive || openDropdown === 'analyze' ? '#fff' : '#a0a0b0',
                  background: analyzeActive || openDropdown === 'analyze' ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                Analyze <ChevronDown size={12} style={{ opacity: 0.6, transition: 'transform 0.15s', transform: openDropdown === 'analyze' ? 'rotate(180deg)' : 'none' }} />
              </button>
              <DropdownMenu items={ANALYZE_ITEMS} open={openDropdown === 'analyze'} onClose={() => setOpenDropdown(null)} />
            </div>

            {/* Optimize dropdown */}
            <div data-dropdown style={{ position: 'relative' }}>
              <button
                data-dropdown
                onClick={(e) => { e.stopPropagation(); toggle('optimize') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
                  color: openDropdown === 'optimize' ? '#fff' : '#a0a0b0',
                  background: openDropdown === 'optimize' ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                Optimize <ChevronDown size={12} style={{ opacity: 0.6, transition: 'transform 0.15s', transform: openDropdown === 'optimize' ? 'rotate(180deg)' : 'none' }} />
              </button>
              <DropdownMenu items={OPTIMIZE_ITEMS} open={openDropdown === 'optimize'} onClose={() => setOpenDropdown(null)} />
            </div>

            {/* Advise dropdown */}
            <div data-dropdown style={{ position: 'relative' }}>
              <button
                data-dropdown
                onClick={(e) => { e.stopPropagation(); toggle('advise') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
                  color: adviseActive || openDropdown === 'advise' ? '#fff' : '#a0a0b0',
                  background: adviseActive || openDropdown === 'advise' ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                Advise <ChevronDown size={12} style={{ opacity: 0.6, transition: 'transform 0.15s', transform: openDropdown === 'advise' ? 'rotate(180deg)' : 'none' }} />
              </button>
              <DropdownMenu items={ADVISE_ITEMS} open={openDropdown === 'advise'} onClose={() => setOpenDropdown(null)} />
            </div>

            {/* Intelligence dropdown */}
            <div data-dropdown style={{ position: 'relative' }}>
              <button
                data-dropdown
                onClick={(e) => { e.stopPropagation(); toggle('intelligence') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
                  color: intelligenceActive || openDropdown === 'intelligence' ? '#fff' : '#a0a0b0',
                  background: intelligenceActive || openDropdown === 'intelligence' ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                Intelligence <ChevronDown size={12} style={{ opacity: 0.6, transition: 'transform 0.15s', transform: openDropdown === 'intelligence' ? 'rotate(180deg)' : 'none' }} />
              </button>
              <DropdownMenu items={INTELLIGENCE_ITEMS} open={openDropdown === 'intelligence'} onClose={() => setOpenDropdown(null)} />
            </div>

            {/* Learn dropdown */}
            <div data-dropdown style={{ position: 'relative' }}>
              <button
                data-dropdown
                onClick={(e) => { e.stopPropagation(); toggle('learn') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
                  color: openDropdown === 'learn' ? '#fff' : '#a0a0b0',
                  background: openDropdown === 'learn' ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                Learn <ChevronDown size={12} style={{ opacity: 0.6, transition: 'transform 0.15s', transform: openDropdown === 'learn' ? 'rotate(180deg)' : 'none' }} />
              </button>
              <DropdownMenu items={LEARN_ITEMS} open={openDropdown === 'learn'} onClose={() => setOpenDropdown(null)} />
            </div>

            {/* Consultants dropdown */}
            <div data-dropdown style={{ position: 'relative' }}>
              <button
                data-dropdown
                onClick={(e) => { e.stopPropagation(); toggle('consultants') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
                  color: openDropdown === 'consultants' ? '#fff' : '#a0a0b0',
                  background: openDropdown === 'consultants' ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                Consultants <ChevronDown size={12} style={{ opacity: 0.6, transition: 'transform 0.15s', transform: openDropdown === 'consultants' ? 'rotate(180deg)' : 'none' }} />
              </button>
              <DropdownMenu items={CONSULTANTS_ITEMS} open={openDropdown === 'consultants'} onClose={() => setOpenDropdown(null)} />
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

          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '6px 12px',
              color: '#a0a0b0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
            }}
          >
            🔍
            <span className="hide-mobile" style={{ fontSize: 11, color: '#555' }}>⌘K</span>
          </button>

          {/* Mode toggle (Plain English / Technical) */}
          <div className="hide-mobile">
            <ModeToggle />
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

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}

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
