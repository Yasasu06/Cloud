'use client'

import { useState } from 'react'
import { useJourney } from '@/lib/journeyContext'
import ReactMarkdown from 'react-markdown'

// ─── Shared constants ────────────────────────────────────────────────────────

const PROVIDERS = ['AWS', 'Azure', 'GCP', 'Multi-Cloud'] as const

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0a0a0f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '11px 14px',
  color: 'white',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

// ─── Executive mode ───────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Technology / SaaS', 'Healthcare', 'Financial Services', 'E-commerce / Retail',
  'Media & Entertainment', 'Government / Public Sector', 'Education',
  'Manufacturing', 'Gaming', 'Startup / Early Stage',
]

interface IndustryRec {
  primary: string
  color: string
  reasons: string[]
  risks: string[]
  certifications: string[]
}

const PROVIDER_RECOMMENDATIONS: Record<string, IndustryRec> = {
  'Technology / SaaS':       { primary: 'AWS',   color: '#FF9900', reasons: ['Broadest service catalog for SaaS architectures', 'Best serverless ecosystem with Lambda', 'Largest developer community and documentation'], risks: ['Egress costs can surprise at scale', 'Complexity increases with team size'], certifications: ['SOC 2', 'ISO 27001', 'PCI DSS'] },
  'Healthcare':               { primary: 'Azure', color: '#0078D4', reasons: ['Best HIPAA compliance tooling', 'Azure Health Data Services purpose-built for healthcare', 'Microsoft BAA is straightforward to execute'], risks: ['Higher cost than AWS for equivalent compute', 'Steeper learning curve for non-Microsoft teams'], certifications: ['HIPAA', 'HITRUST', 'SOC 2', 'ISO 27001'] },
  'Financial Services':       { primary: 'AWS',   color: '#FF9900', reasons: ['Most financial services customers globally', 'Best compliance tooling for PCI DSS', 'AWS GovCloud for regulated workloads'], risks: ['Vendor lock-in risk', 'Complex pricing at enterprise scale'], certifications: ['PCI DSS', 'SOC 1/2/3', 'ISO 27001', 'FedRAMP'] },
  'E-commerce / Retail':      { primary: 'AWS',   color: '#FF9900', reasons: ['Amazon heritage means best e-commerce tooling', 'CloudFront CDN excellent for global storefronts', 'Auto-scaling handles traffic spikes perfectly'], risks: ['Competing with Amazon directly as a customer', 'Cost optimization requires dedicated expertise'], certifications: ['PCI DSS', 'SOC 2', 'ISO 27001'] },
  'Media & Entertainment':    { primary: 'AWS',   color: '#FF9900', reasons: ['AWS Elemental best-in-class for video streaming', 'CloudFront global CDN for content delivery', 'S3 most cost-effective for large media storage'], risks: ['Egress costs high for large video files', 'Transcoding costs add up quickly'], certifications: ['SOC 2', 'ISO 27001'] },
  'Government / Public Sector':{ primary: 'Azure', color: '#0078D4', reasons: ['Azure Government cloud purpose-built for public sector', 'FedRAMP High authorization across most services', 'Microsoft existing government relationships'], risks: ['Azure Government region availability limited', 'Higher cost than commercial cloud'], certifications: ['FedRAMP High', 'DoD IL2/IL4/IL5', 'CJIS', 'ITAR'] },
  'Education':                { primary: 'GCP',   color: '#34A853', reasons: ['Google Workspace deep integration', 'Best pricing for educational institutions', 'BigQuery excellent for student data analytics'], risks: ['Smaller ecosystem than AWS', 'Less enterprise support options'], certifications: ['FERPA', 'COPPA', 'SOC 2', 'ISO 27001'] },
  'Manufacturing':            { primary: 'Azure', color: '#0078D4', reasons: ['Azure IoT Hub best for factory sensor data', 'Strong SAP integration for manufacturing ERP', 'Azure Digital Twins for factory simulation'], risks: ['IoT at scale becomes expensive', 'Requires significant Azure expertise'], certifications: ['ISO 27001', 'SOC 2', 'IEC 62443'] },
  'Gaming':                   { primary: 'AWS',   color: '#FF9900', reasons: ['Amazon GameLift purpose-built for game servers', 'Global low-latency network for multiplayer', 'Best auto-scaling for player count spikes'], risks: ['GameLift pricing complex', 'Data transfer costs high for gaming workloads'], certifications: ['SOC 2', 'ISO 27001'] },
  'Startup / Early Stage':    { primary: 'AWS',   color: '#FF9900', reasons: ['AWS Activate gives startups up to $100k credits', 'Most tutorials and Stack Overflow answers', 'Scales from day 1 to IPO without switching'], risks: ['Free tier expires after 12 months', 'Easy to over-engineer early'], certifications: ['SOC 2', 'ISO 27001', 'PCI DSS'] },
}

function ExecutiveMode() {
  const { journey } = useJourney()
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('Technology / SaaS')
  const [employees, setEmployees] = useState('1-50')
  const [generated, setGenerated] = useState(false)

  const rec = PROVIDER_RECOMMENDATIONS[industry]
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  function generateReport() {
    setGenerated(true)
    setTimeout(() => window.print(), 500)
  }

  function downloadHTML() {
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Cloud Intelligence Report — ${company || 'My Company'}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #1a1a1a; }
  .header { background: #0a0a0f; color: white; padding: 40px; border-radius: 8px; margin-bottom: 32px; }
  .header h1 { font-size: 28px; margin: 0 0 8px; }
  .header p { color: #a0a0b0; margin: 0; }
  .badge { display: inline-block; background: ${rec.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-top: 12px; }
  .section { margin-bottom: 32px; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px; }
  .section h2 { font-size: 18px; margin: 0 0 16px; color: #1a1a1a; }
  .metric-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .metric { background: #f8f8f8; padding: 16px; border-radius: 8px; text-align: center; }
  .metric-value { font-size: 24px; font-weight: 800; color: ${rec.color}; }
  .metric-label { font-size: 12px; color: #666; margin-top: 4px; }
  ul { padding-left: 20px; } li { margin-bottom: 8px; color: #444; }
  .cert { display: inline-block; background: #f0f0f0; padding: 4px 10px; border-radius: 4px; font-size: 12px; margin: 4px; }
  .footer { text-align: center; color: #888; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
</style>
</head>
<body>
<div class="header">
  <h1>Cloud Intelligence Executive Report</h1>
  <p>${company || 'My Company'} · ${industry} · ${date}</p>
  <div class="badge">Recommended: ${rec.primary}</div>
</div>
<div class="metric-grid">
  <div class="metric"><div class="metric-value">$855B</div><div class="metric-label">Cloud Market Size 2026</div></div>
  <div class="metric"><div class="metric-value">19%</div><div class="metric-label">Market CAGR</div></div>
  <div class="metric"><div class="metric-value">89%</div><div class="metric-label">Enterprise Multi-cloud</div></div>
</div>
<div class="section">
  <h2>Recommendation: ${rec.primary}</h2>
  <p>Based on your industry profile (${industry}) and company size (${employees} employees), our analysis recommends <strong>${rec.primary}</strong> as your primary cloud provider.</p>
  <h3>Why ${rec.primary}:</h3>
  <ul>${rec.reasons.map((r) => `<li>${r}</li>`).join('')}</ul>
</div>
<div class="section">
  <h2>Risk Considerations</h2>
  <ul>${rec.risks.map((r) => `<li>${r}</li>`).join('')}</ul>
</div>
<div class="section">
  <h2>Compliance Certifications</h2>
  <p>Your recommended provider holds the following certifications relevant to ${industry}:</p>
  <div>${rec.certifications.map((c) => `<span class="cert">${c}</span>`).join('')}</div>
</div>
<div class="section">
  <h2>Market Context</h2>
  <p>The global cloud market reached $855B in 2026, growing at 19% CAGR. Azure leads in revenue growth at 31% YoY, AWS maintains market leadership at 30% share, and GCP is the fastest-growing AI/ML platform.</p>
</div>
<div class="footer">Generated by Cloud Intelligence Platform · ${date}<br>Data sourced from SEC filings, earnings reports, and Synergy Research Group.</div>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cloud-report-${(company || 'report').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <style>{`@media print { nav, .no-print { display: none !important; } body { background: white !important; color: black !important; } }`}</style>

      {journey && (
        <div style={{ background: '#1a1a2e', borderRadius: 12, padding: '16px 20px', marginBottom: 24, borderLeft: `4px solid ${rec.color}` }}>
          <div style={{ fontSize: 12, color: '#a0a0b0' }}>FROM YOUR CLOUD ADVISOR</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{journey.recommendedProvider} recommended · {journey.confidence}% confidence</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ color: '#a0a0b0', fontSize: 13, display: 'block', marginBottom: 8 }}>COMPANY NAME</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" style={inputStyle} />
        </div>
        <div>
          <label style={{ color: '#a0a0b0', fontSize: 13, display: 'block', marginBottom: 8 }}>COMPANY SIZE</label>
          <select value={employees} onChange={(e) => setEmployees(e.target.value)} style={inputStyle}>
            <option>1-50</option><option>51-200</option><option>201-1000</option><option>1000+</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={{ color: '#a0a0b0', fontSize: 13, display: 'block', marginBottom: 8 }}>INDUSTRY</label>
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={inputStyle}>
          {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
        <button onClick={generateReport} style={{ background: rec.color, color: 'white', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Generate &amp; Print Report →
        </button>
        <button onClick={downloadHTML} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '14px 32px', fontSize: 15, cursor: 'pointer' }}>
          ⬇ Download HTML Report
        </button>
      </div>

      {generated && (
        <div style={{ background: 'white', color: '#1a1a1a', borderRadius: 16, padding: 40 }}>
          <div style={{ background: '#0a0a0f', color: 'white', padding: 32, borderRadius: 8, marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>CLOUD INTELLIGENCE PLATFORM</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Executive Cloud Strategy Report</h2>
            <p style={{ color: '#a0a0b0', marginBottom: 16 }}>{company || 'My Company'} · {industry} · {date}</p>
            <span style={{ background: rec.color, color: 'white', padding: '6px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700 }}>Recommended: {rec.primary}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
            {[{ value: '$855B', label: 'Cloud Market 2026' }, { value: '19%', label: 'Market CAGR' }, { value: '89%', label: 'Enterprise Multi-cloud' }].map((m) => (
              <div key={m.label} style={{ background: '#f8f8f8', padding: 20, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: rec.color }}>{m.value}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 24, padding: 24, border: '1px solid #e5e5e5', borderRadius: 8, borderLeft: `4px solid ${rec.color}` }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Primary Recommendation: {rec.primary}</h2>
            <p style={{ color: '#444', marginBottom: 12 }}>Based on your {industry} profile and {employees} employee organization, our analysis recommends {rec.primary} as your primary cloud provider.</p>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Why {rec.primary}:</h3>
            <ul style={{ paddingLeft: 20 }}>{rec.reasons.map((r) => <li key={r} style={{ marginBottom: 8, color: '#444' }}>{r}</li>)}</ul>
          </div>
          <div style={{ marginBottom: 24, padding: 24, border: '1px solid #e5e5e5', borderRadius: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Risk Considerations</h2>
            <ul style={{ paddingLeft: 20 }}>{rec.risks.map((r) => <li key={r} style={{ marginBottom: 8, color: '#444' }}>{r}</li>)}</ul>
          </div>
          <div style={{ padding: 24, border: '1px solid #e5e5e5', borderRadius: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Compliance Certifications</h2>
            <div>{rec.certifications.map((c) => <span key={c} style={{ display: 'inline-block', background: '#f0f0f0', padding: '4px 12px', borderRadius: 4, fontSize: 13, margin: 4 }}>{c}</span>)}</div>
          </div>
          <div style={{ textAlign: 'center', color: '#888', fontSize: 12, marginTop: 32, paddingTop: 20, borderTop: '1px solid #e5e5e5' }}>
            Generated by Cloud Intelligence Platform · {date}<br />Data sourced from SEC filings, earnings reports, and Synergy Research Group.
          </div>
        </div>
      )}
    </>
  )
}

// ─── Consultant (white-label) mode ────────────────────────────────────────────

function ConsultantMode() {
  const [yourCompany, setYourCompany] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientSpend, setClientSpend] = useState('')
  const [clientProvider, setClientProvider] = useState<string>('AWS')
  const [notes, setNotes] = useState('')
  const [report, setReport] = useState('')
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const canGenerate = yourCompany.trim() && clientName.trim() && clientSpend.trim()

  async function generate() {
    if (!canGenerate) return
    setGenerating(true)
    setReport('')
    setDone(false)

    const prompt = `You are a senior cloud consultant at ${yourCompany}. Generate a professional cloud analysis report for client ${clientName}.

Details:
- Client: ${clientName}
- Cloud Provider: ${clientProvider}
- Monthly Spend: $${clientSpend}/month
- Consultant Notes: ${notes || 'None provided'}

Generate a professional consulting report with:
1. Executive Summary (2-3 paragraphs)
2. Current State Assessment
3. Cost Optimization Opportunities (with specific dollar amounts based on $${clientSpend}/month spend)
4. Security & Compliance Observations
5. Recommended 90-Day Roadmap (with prioritized action items)
6. Investment Summary

Use ${clientProvider} service names. Be specific with dollar amounts. Write in a professional consulting tone.`

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      })
      if (!res.ok || !res.body) throw new Error('Stream failed')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? ''
              text += delta
              setReport(text)
            } catch (_e) {}
          }
        }
      }
      setDone(true)
    } catch (_e) {
      setReport('Failed to generate report. Please try again.')
      setDone(true)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4 } 50% { opacity: 1 } }
        @media print { nav, .no-print { display: none !important; } body { background: white !important; color: black !important; } .print-area { padding: 20px !important; } }
      `}</style>

      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }} className="no-print">
        <div style={{ background: '#1a1a2e', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>YOUR FIRM</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>COMPANY NAME *</label>
              <input value={yourCompany} onChange={e => setYourCompany(e.target.value)} placeholder="Acme Cloud Consulting" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>LOGO URL (OPTIONAL)</label>
              <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://yourcompany.com/logo.png" style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ background: '#1a1a2e', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>CLIENT INFO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>CLIENT COMPANY *</label>
              <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client Corp" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>MONTHLY SPEND *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }}>$</span>
                  <input type="number" value={clientSpend} onChange={e => setClientSpend(e.target.value)} placeholder="10000" style={{ ...inputStyle, paddingLeft: 24 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>PROVIDER</label>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {PROVIDERS.map(p => (
                    <button key={p} onClick={() => setClientProvider(p)} style={{ background: clientProvider === p ? '#6366f1' : '#0a0a0f', border: `1px solid ${clientProvider === p ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, borderRadius: 7, padding: '7px 10px', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#1a1a2e', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)', gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 10 }}>ANALYSIS NOTES</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Key observations, pain points, client goals, existing issues..." rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
        </div>
      </div>

      <div style={{ marginBottom: 32 }} className="no-print">
        <button onClick={generate} disabled={!canGenerate || generating} style={{ background: canGenerate && !generating ? '#6366f1' : '#333', border: 'none', borderRadius: 12, padding: '14px 32px', color: 'white', fontWeight: 700, fontSize: 15, cursor: canGenerate && !generating ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}>
          {generating ? 'Generating Report…' : '✦ Generate Client Report →'}
        </button>
      </div>

      {generating && !report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(99,102,241,0.08)', borderRadius: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', animation: 'pulse 1s infinite', flexShrink: 0 }} />
            <span style={{ color: '#a0a0b0', fontSize: 14 }}>AI is generating your report...</span>
            <span style={{ color: '#555', fontSize: 12, marginLeft: 'auto', whiteSpace: 'nowrap' }}>Usually takes 15–30 seconds</span>
          </div>
          {[85, 70, 90, 60, 75, 50, 80].map((w, i) => (
            <div key={i} style={{ height: 16, background: 'rgba(255,255,255,0.07)', borderRadius: 8, width: `${w}%`, animation: 'pulse 1.5s infinite', animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}

      {report && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '16px 16px 0 0', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" style={{ height: 40, borderRadius: 6, objectFit: 'contain' }} />
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{yourCompany || 'Your Company'} Cloud Analysis</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Prepared for {clientName} · {clientProvider} · ${Number(clientSpend).toLocaleString()}/month</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }} className="no-print">
              <button onClick={generate} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', cursor: 'pointer', fontSize: 12 }}>↺ Regenerate</button>
              <button onClick={() => window.print()} style={{ background: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', color: '#6366f1', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>🖨 Export PDF</button>
            </div>
          </div>

          <div className="glass-card" style={{ borderRadius: '0 0 16px 16px', padding: '28px 32px', lineHeight: 1.7, borderTop: 'none' }}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12, marginTop: 0 }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: 18, fontWeight: 700, color: '#818cf8', marginBottom: 10, marginTop: 24 }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 700, color: '#a0a0b0', marginBottom: 8, marginTop: 16 }}>{children}</h3>,
                p:  ({ children }) => <p  style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 12 }}>{children}</p>,
                li: ({ children }) => <li style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 6 }}>{children}</li>,
                ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 12 }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ paddingLeft: 20, marginBottom: 12 }}>{children}</ol>,
                strong: ({ children }) => <strong style={{ color: 'white', fontWeight: 700 }}>{children}</strong>,
              }}
            >
              {report}
            </ReactMarkdown>
            {generating && <span style={{ display: 'inline-block', width: 2, height: 14, background: '#6366f1', marginLeft: 2, verticalAlign: 'text-bottom' }} />}
          </div>

          {done && (
            <p style={{ fontSize: 12, color: '#444', marginTop: 12, textAlign: 'center' }} className="no-print">
              AI-generated analysis. Review before sharing with clients.
            </p>
          )}
        </div>
      )}
    </>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────

type ReportMode = 'consultant' | 'executive'

export default function WhiteLabelPage() {
  const [mode, setMode] = useState<ReportMode>('consultant')

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div className="print-area" style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }} className="no-print">
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
            REPORT GENERATOR
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, marginBottom: 10 }}>
            {mode === 'consultant' ? 'Branded Client Report Generator' : 'Executive Cloud Strategy Report'}
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 520 }}>
            {mode === 'consultant'
              ? 'Generate professional cloud consulting reports branded with your company name.'
              : 'Generate a printable executive report with provider recommendation and market data.'}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 4, width: 'fit-content' }} className="no-print">
          {([['consultant', 'Consultant Report'], ['executive', 'Executive Report']] as [ReportMode, string][]).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                background: mode === m ? '#6366f1' : 'transparent',
                border: 'none',
                borderRadius: 9,
                padding: '8px 20px',
                color: mode === m ? 'white' : '#666',
                fontWeight: mode === m ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'consultant' ? <ConsultantMode /> : <ExecutiveMode />}

      </div>
    </div>
  )
}
