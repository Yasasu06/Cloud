'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cloud, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/intent', label: 'AI Analyze' },
  { href: '/planner', label: 'Plan' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/repatriation', label: 'Exit Analyzer' },
  { href: '/executive', label: 'Report' },
  { href: '/pricing', label: 'Pricing' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(10, 10, 15, 0.92)'
          : 'rgba(10, 10, 15, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
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

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 navbar-links">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md"
                  style={{
                    color: isActive ? '#ffffff' : '#a0a0b0',
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: '#6366f1' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="hidden sm:block px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              style={{ color: '#a0a0b0' }}
            >
              Sign In
            </Link>
            <Link
              href="/chat"
              className="hidden sm:block px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
              style={{ background: '#6366f1' }}
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
          style={{
            background: 'rgba(10, 10, 15, 0.98)',
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: isActive ? '#ffffff' : '#a0a0b0',
                  background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            )
          })}
          <Link
            href="/auth"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium transition-colors"
            style={{ color: '#a0a0b0', background: 'transparent' }}
          >
            Sign In
          </Link>
          <Link
            href="/chat"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-white text-center mt-2"
            style={{ background: '#6366f1' }}
          >
            Ask AI
          </Link>
        </div>
      )}
    </nav>
  )
}
