'use client'

import { useState } from 'react'

interface Props { embedded?: boolean }

export default function PerformancePricingTool({ embedded = false }: Props) {
  const [spend, setSpend] = useState(10000)
  const estimatedOpportunity = Math.round(spend * 0.28)
  const exampleFee = Math.round(estimatedOpportunity * 0.15)

  const content = (
    <div style={{ maxWidth: 760, margin: '0 auto', color: 'white' }}>
      <p style={{ color: '#f59e0b', fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>PRICING CONCEPT · ILLUSTRATIVE ONLY</p>
      <h1 style={{ fontSize: 38, margin: '20px 0' }}>Explore a performance-fee scenario</h1>
      <p style={{ color: '#a0a0b0', lineHeight: 1.7 }}>
        This calculator illustrates how a fee tied to verified savings might work. Cloud Intelligence
        does not currently offer performance-based billing, inspect connected cloud accounts, or verify
        savings automatically. The opportunity below is a fixed 28% assumption, not an observed result.
      </p>
      <label htmlFor="pp-spend" style={{ display: 'block', margin: '30px 0 12px' }}>Example monthly cloud spend: ${spend.toLocaleString()}</label>
      <input id="pp-spend" type="range" min={1000} max={100000} step={1000} value={spend}
        onChange={event => setSpend(Number(event.target.value))} style={{ width: '100%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 28 }}>
        <div className="glass-card" style={{ padding: 20 }}>Illustrative opportunity<br /><strong>${estimatedOpportunity.toLocaleString()}/month</strong></div>
        <div className="glass-card" style={{ padding: 20 }}>Example 15% fee<br /><strong>${exampleFee.toLocaleString()}/month</strong></div>
      </div>
      <p style={{ color: '#666', fontSize: 12, marginTop: 20 }}>No fee is charged by this demo. Real savings would require a measured before-and-after baseline.</p>
    </div>
  )
  return embedded ? content : <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '100px 24px' }}>{content}</div>
}
