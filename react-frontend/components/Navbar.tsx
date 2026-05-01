'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cloud, Menu, X, ChevronDown } from 'lucide-react'

const ANALYZE_ITEMS = [
  { href: '/analyze', label: 'AI Analyze', desc: 'Explain your cloud situation' },
  { href: '/bill-upload', label: 'Bill Upload', desc: 'Upload your cloud bill' },
  { href: '/cloud-twin', label: 'Cloud Twin', desc: 'Build your cloud profile' },
]

const ADVISE_ITEMS = [
  { href: '/advisor', label: 'Cloud Advisor', desc: 'Get a provider recommendation' },
  { href: '/report-card', label: 'Report Card', desc: 'Grade your cloud setup' },
]

const MOBILE_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/analyze', label: 'AI Analyze' },
  { href: '/bill-upload', label: 'Bill Upload' },
  { href: '/cloud-twin', label: 'Cloud Twin' },
  { href: '/advisor', label: 'Cloud Advisor' },
  { href: '/report-card', label: 'Report Card' },
  { href: '/pricing', label: 'Pricing' },
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
      minWidth: 220,
      zIndex: 100,
      boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    }}>
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            display: 'block',
            padding: '10px 14px',
            borderRadius: 10,
            textDecoration: 'none',
            transition: 'background 0.1s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', marginBottom: 2 }}>{item.label}</div>
          <div style={{ fontSize: 11, color: '#666' }}>{item.desc}</div>
        </Link>
      ))}
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const analyzeActive = ['/analyze', '/bill-upload', '/cloud-twin'].includes(pathname)
  const adviseActive = ['/advisor', '/report-card'].includes(pathname)

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
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
            >
              <Cloud size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-wide hidden sm:block">
              Cloud Intelligence
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">

            {/* Home */}
            <Link
              href="/"
              style={{
                fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
                color: pathname === '/' ? '#fff' : '#a0a0b0',
                background: pathname === '/' ? 'rgba(99,102,241,0.15)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
              }}
            >
              Home
            </Link>

            {/* Analyze dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setOpenDropdown('analyze')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
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
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setOpenDropdown('advise')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
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

            <Link
              href="/pricing"
              style={{
                fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
                color: pathname === '/pricing' ? '#fff' : '#a0a0b0',
                background: pathname === '/pricing' ? 'rgba(99,102,241,0.15)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
              }}
            >
              Pricing
            </Link>
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="hidden sm:block text-sm font-medium transition-colors duration-200"
              style={{ color: '#a0a0b0', padding: '6px 12px', textDecoration: 'none' }}
            >
              Sign In
            </Link>
            <Link
              href="/chat"
              className="hidden sm:block btn-primary accent-glow"
              style={{ fontSize: 13, padding: '8px 18px' }}
            >
              Ask AI
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
          <Link
            href="/auth"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium"
            style={{ color: '#a0a0b0', textDecoration: 'none' }}
          >
            Sign In
          </Link>
          <Link
            href="/chat"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-white text-center mt-2"
            style={{ background: '#6366f1', textDecoration: 'none' }}
          >
            Ask AI
          </Link>
        </div>
      )}
    </nav>
  )
}
