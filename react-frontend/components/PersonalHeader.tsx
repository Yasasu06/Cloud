'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PersonalData {
  email: string
  lastProvider: string | null
  lastAnalysisDate: string | null
  totalAnalyses: number
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

export default function PersonalHeader() {
  const [data, setData] = useState<PersonalData | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: recs } = await supabase
        .from('saved_recommendations')
        .select('provider, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const { count } = await supabase
        .from('saved_recommendations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)

      setData({
        email: session.user.email ?? '',
        lastProvider: recs?.[0]?.provider ?? null,
        lastAnalysisDate: recs?.[0]?.created_at ?? null,
        totalAnalyses: count ?? 0,
      })
      setVisible(true)
    }
    load()
  }, [])

  if (!visible || !data || data.totalAnalyses === 0) return null

  const name = data.email.split('@')[0]

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: 24, zIndex: 40,
      background: 'rgba(5,5,8,0.95)', border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: 14, padding: '12px 18px', backdropFilter: 'blur(20px)',
      maxWidth: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 4 }}>
            Welcome back, {name} 👋
          </div>
          {data.lastProvider && data.lastAnalysisDate && (
            <div style={{ fontSize: 11, color: '#666', marginBottom: 6, lineHeight: 1.4 }}>
              Last analysis: {timeAgo(data.lastAnalysisDate)} · {data.lastProvider}
            </div>
          )}
          <div style={{ fontSize: 11, color: '#818cf8', fontWeight: 600 }}>
            {data.totalAnalyses} {data.totalAnalyses === 1 ? 'analysis' : 'analyses'} saved
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 14, lineHeight: 1, marginLeft: 8, padding: '2px 4px' }}
        >
          ×
        </button>
      </div>
      <a
        href="/dashboard"
        style={{ display: 'block', marginTop: 10, fontSize: 11, fontWeight: 700, color: '#818cf8', textDecoration: 'none', textAlign: 'center', padding: '5px 0', background: 'rgba(99,102,241,0.1)', borderRadius: 6 }}
      >
        View Dashboard →
      </a>
    </div>
  )
}
