'use client'

import Link from 'next/link'

// Navbar intentionally stripped while the site is being refocused on a single
// analysis page. All previous dropdowns, mobile menu, search, auth links, and
// CTAs are removed from the user-facing nav. The underlying route folders
// under app/ still exist on disk and are not touched.
export default function Navbar() {
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
        <div className="flex items-center h-16">
          <Link
            href="/"
            className="flex items-center gap-2"
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              ⚡
            </div>
            <span
              style={{
                fontWeight: 800,
                color: 'white',
                fontSize: 14,
                letterSpacing: '-0.01em',
              }}
            >
              Cloud Intelligence
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
