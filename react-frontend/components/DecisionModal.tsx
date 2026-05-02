'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  decisionText: string
  onClose: () => void
}

export default function DecisionModal({ decisionText, onClose }: Props) {
  const [decision, setDecision] = useState(decisionText)
  const [reasoning, setReasoning] = useState('')
  const [alternatives, setAlternatives] = useState('')
  const [expected, setExpected] = useState('')
  const [reviewDate, setReviewDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setSaving(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Please sign in to save decisions.')
        setSaving(false)
        return
      }
      const { error: dbErr } = await supabase.from('decisions').insert({
        user_id: session.user.id,
        decision_text: decision,
        reasoning,
        alternatives,
        expected_outcome: expected,
        review_date: reviewDate,
        status: 'active',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      if (dbErr) {
        if (dbErr.message.includes('does not exist') || dbErr.code === '42P01') {
          setError('Decisions table not yet provisioned. Saved locally for now.')
          localStorage.setItem(`decision_${Date.now()}`, JSON.stringify({ decision, reasoning, alternatives, expected, reviewDate, tags }))
        } else {
          throw dbErr
        }
      }
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, color: '#666',
    letterSpacing: 1, marginBottom: 6,
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        backdropFilter: 'blur(8px)', overflowY: 'auto',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#0d0d16', border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 18, padding: '24px 26px', width: '100%', maxWidth: 540,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {saved ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>📝</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 8 }}>Decision Documented</h2>
            <p style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 20 }}>
              We&apos;ll remind you to review on {new Date(reviewDate).toLocaleDateString()}.
            </p>
            <button onClick={onClose} style={{ background: '#6366f1', borderRadius: 10, padding: '11px 24px', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: 1.5, marginBottom: 4 }}>DECISION DOCUMENTATION</div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>Document this decision</h2>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 22, padding: '0 4px' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>WHAT WAS THE DECISION?</label>
                <input value={decision} onChange={e => setDecision(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>WHY DID YOU CHOOSE THIS PATH?</label>
                <textarea value={reasoning} onChange={e => setReasoning(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} placeholder="What made this the best option?" />
              </div>
              <div>
                <label style={labelStyle}>WHAT ALTERNATIVES DID YOU CONSIDER?</label>
                <textarea value={alternatives} onChange={e => setAlternatives(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} placeholder="Other options you ruled out and why" />
              </div>
              <div>
                <label style={labelStyle}>EXPECTED OUTCOME?</label>
                <textarea value={expected} onChange={e => setExpected(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} placeholder="What you expect to happen" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>REVIEW DATE</label>
                  <input type="date" value={reviewDate} onChange={e => setReviewDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>TAGS (OPTIONAL)</label>
                  <input value={tags} onChange={e => setTags(e.target.value)} placeholder="cost, migration" style={inputStyle} />
                </div>
              </div>

              {error && <p style={{ fontSize: 12, color: '#fca5a5', margin: 0 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  onClick={save}
                  disabled={saving || !decision.trim() || !reasoning.trim()}
                  style={{
                    flex: 1, background: '#6366f1', border: 'none', borderRadius: 10, padding: '11px 24px',
                    color: 'white', fontWeight: 700, fontSize: 14,
                    cursor: saving || !decision.trim() || !reasoning.trim() ? 'not-allowed' : 'pointer',
                    opacity: saving || !decision.trim() || !reasoning.trim() ? 0.5 : 1,
                  }}
                >
                  {saving ? 'Saving…' : 'Save Decision'}
                </button>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 22px', color: '#a0a0b0', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
