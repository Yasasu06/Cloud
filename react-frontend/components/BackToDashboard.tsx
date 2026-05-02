'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BackToDashboard() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (pathname === '/' || pathname === '/dashboard') { setShow(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setShow(!!session)
    })
  }, [pathname])

  if (!show) return null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '8px 24px 0', display: 'flex', justifyContent: 'flex-end' }}>
      <Link
        href="/dashboard"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: '#6366f1', fontWeight: 600,
          textDecoration: 'none', padding: '5px 12px',
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 8, transition: 'all 0.15s',
        }}
      >
        ← Dashboard
      </Link>
    </div>
  )
}
