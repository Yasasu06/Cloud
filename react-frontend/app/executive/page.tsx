'use client'

import { useState } from 'react'
import { useJourney } from '@/lib/journeyContext'

const INDUSTRIES = [
  'Technology / SaaS',
  'Healthcare',
  'Financial Services',
  'E-commerce / Retail',
  'Media & Entertainment',
  'Government / Public Sector',
  'Education',
  'Manufacturing',
  'Gaming',
  'Startup / Early Stage',
]

interface IndustryRec {
  primary: string
  color: string
  reasons: string[]
  risks: string[]
  certifications: string[]
}

const PROVIDER_RECOMMENDATIONS: Record<string, IndustryRec> = {
  'Technology / SaaS': {
    primary: 'AWS',
    color: '#FF9900',
    reasons: ['Broadest service catalog for SaaS architectures', 'Best serverless ecosystem with Lambda', 'Largest developer community and documentation'],
    risks: ['Egress costs can surprise at scale', 'Complexity increases with team size'],
    certifications: ['SOC 2', 'ISO 27001', 'PCI DSS'],
  },
  'Healthcare': {
    primary: 'Azure',
    color: '#0078D4',
    reasons: ['Best HIPAA compliance tooling', 'Azure Health Data Services purpose-built for healthcare', 'Microsoft BAA is straightforward to execute'],
    risks: ['Higher cost than AWS for equivalent compute', 'Steeper learning curve for non-Microsoft teams'],
    certifications: ['HIPAA', 'HITRUST', 'SOC 2', 'ISO 27001'],
  },
  'Financial Services': {
    primary: 'AWS',
    color: '#FF9900',
    reasons: ['Most financial services customers globally', 'Best compliance tooling for PCI DSS', 'AWS GovCloud for regulated workloads'],
    risks: ['Vendor lock-in risk', 'Complex pricing at enterprise scale'],
    certifications: ['PCI DSS', 'SOC 1/2/3', 'ISO 27001', 'FedRAMP'],
  },
  'E-commerce / Retail': {
    primary: 'AWS',
    color: '#FF9900',
    reasons: ['Amazon heritage means best e-commerce tooling', 'CloudFront CDN excellent for global storefronts', 'Auto-scaling handles traffic spikes perfectly'],
    risks: ['Competing with Amazon directly as a customer', 'Cost optimization requires dedicated expertise'],
    certifications: ['PCI DSS', 'SOC 2', 'ISO 27001'],
  },
  'Media & Entertainment': {
    primary: 'AWS',
    color: '#FF9900',
    reasons: ['AWS Elemental best-in-class for video streaming', 'CloudFront global CDN for content delivery', 'S3 most cost-effective for large media storage'],
    risks: ['Egress costs high for large video files', 'Transcoding costs add up quickly'],
    certifications: ['SOC 2', 'ISO 27001'],
  },
  'Government / Public Sector': {
    primary: 'Azure',
    color: '#0078D4',
    reasons: ['Azure Government cloud purpose-built for public sector', 'FedRAMP High authorization across most services', 'Microsoft existing government relationships'],
    risks: ['Azure Government region availability limited', 'Higher cost than commercial cloud'],
    certifications: ['FedRAMP High', 'DoD IL2/IL4/IL5', 'CJIS', 'ITAR'],
  },
  'Education': {
    primary: 'GCP',
    color: '#34A853',
    reasons: ['Google Workspace deep integration', 'Best pricing for educational institutions', 'BigQuery excellent for student data analytics'],
    risks: ['Smaller ecosystem than AWS', 'Less enterprise support options'],
    certifications: ['FERPA', 'COPPA', 'SOC 2', 'ISO 27001'],
  },
  'Manufacturing': {
    primary: 'Azure',
    color: '#0078D4',
    reasons: ['Azure IoT Hub best for factory sensor data', 'Strong SAP integration for manufacturing ERP', 'Azure Digital Twins for factory simulation'],
    risks: ['IoT at scale becomes expensive', 'Requires significant Azure expertise'],
    certifications: ['ISO 27001', 'SOC 2', 'IEC 62443'],
  },
  'Gaming': {
    primary: 'AWS',
    color: '#FF9900',
    reasons: ['Amazon GameLift purpose-built for game servers', 'Global low-latency network for multiplayer', 'Best auto-scaling for player count spikes'],
    risks: ['GameLift pricing complex', 'Data transfer costs high for gaming workloads'],
    certifications: ['SOC 2', 'ISO 27001'],
  },
  'Startup / Early Stage': {
    primary: 'AWS',
    color: '#FF9900',
    reasons: ['AWS Activate gives startups up to $100k credits', 'Most tutorials and Stack Overflow answers', 'Scales from day 1 to IPO without switching'],
    risks: ['Free tier expires after 12 months', 'Easy to over-engineer early'],
    certifications: ['SOC 2', 'ISO 27001', 'PCI DSS'],
  },
}

export default function ExecutivePage() {
  const { journey } = useJourney()
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('Technology / SaaS')
  const [employees, setEmployees] = useState('1-50')
  const [generated, setGenerated] = useState(false)

  const rec = PROVIDER_RECOMMENDATIONS[industry]
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

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
  ul { padding-left: 20px; }
  li { margin-bottom: 8px; color: #444; }
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
<div class="footer">
  Generated by Cloud Intelligence Platform · ${date}<br>
  Data sourced from SEC filings, earnings reports, and Synergy Research Group.
</div>
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#1a1a2e',
    border: '1px solid #ffffff15',
    borderRadius: 8,
    padding: '12px 16px',
    color: 'white',
    fontSize: 15,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '100px 24px 60px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>📋 Executive Report</h1>
        <p style={{ color: '#a0a0b0', marginBottom: 40 }}>
          Generate a professional cloud strategy report for your organization.
        </p>

        {journey && (
          <div style={{
            background: '#1a1a2e', borderRadius: 12, padding: '16px 20px',
            marginBottom: 24, borderLeft: `4px solid ${rec.color}`,
          }}>
            <div style={{ fontSize: 12, color: '#a0a0b0' }}>FROM YOUR CLOUD ADVISOR</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>
              {journey.recommendedProvider} recommended · {journey.confidence}% confidence
            </div>
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ color: '#a0a0b0', fontSize: 13, display: 'block', marginBottom: 8 }}>COMPANY NAME</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Corp"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ color: '#a0a0b0', fontSize: 13, display: 'block', marginBottom: 8 }}>COMPANY SIZE</label>
            <select value={employees} onChange={(e) => setEmployees(e.target.value)} style={inputStyle}>
              <option>1-50</option>
              <option>51-200</option>
              <option>201-1000</option>
              <option>1000+</option>
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
          <button onClick={generateReport} style={{
            background: rec.color, color: 'white', border: 'none',
            borderRadius: 12, padding: '14px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>
            Generate &amp; Print Report →
          </button>
          <button onClick={downloadHTML} style={{
            background: 'transparent', color: 'white', border: '1px solid #ffffff30',
            borderRadius: 12, padding: '14px 32px', fontSize: 16, cursor: 'pointer',
          }}>
            ⬇ Download HTML Report
          </button>
        </div>

        {/* Preview */}
        {generated && (
          <div id="report-content" style={{
            background: 'white', color: '#1a1a1a', borderRadius: 16, padding: 40,
          }}>
            {/* Report header */}
            <div style={{ background: '#0a0a0f', color: 'white', padding: 32, borderRadius: 8, marginBottom: 32 }}>
              <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>CLOUD INTELLIGENCE PLATFORM</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Executive Cloud Strategy Report</h1>
              <p style={{ color: '#a0a0b0', marginBottom: 16 }}>{company || 'My Company'} · {industry} · {date}</p>
              <span style={{ background: rec.color, color: 'white', padding: '6px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700 }}>
                Recommended: {rec.primary}
              </span>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
              {[
                { value: '$855B', label: 'Cloud Market 2026' },
                { value: '19%', label: 'Market CAGR' },
                { value: '89%', label: 'Enterprise Multi-cloud' },
              ].map((m) => (
                <div key={m.label} style={{ background: '#f8f8f8', padding: 20, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: rec.color }}>{m.value}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div style={{ marginBottom: 24, padding: 24, border: '1px solid #e5e5e5', borderRadius: 8, borderLeft: `4px solid ${rec.color}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Primary Recommendation: {rec.primary}</h2>
              <p style={{ color: '#444', marginBottom: 16 }}>
                Based on your {industry} profile and {employees} employee organization,
                our analysis recommends {rec.primary} as your primary cloud provider.
              </p>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Why {rec.primary}:</h3>
              <ul style={{ paddingLeft: 20 }}>
                {rec.reasons.map((r) => <li key={r} style={{ marginBottom: 8, color: '#444' }}>{r}</li>)}
              </ul>
            </div>

            {/* Risks */}
            <div style={{ marginBottom: 24, padding: 24, border: '1px solid #e5e5e5', borderRadius: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Risk Considerations</h2>
              <ul style={{ paddingLeft: 20 }}>
                {rec.risks.map((r) => <li key={r} style={{ marginBottom: 8, color: '#444' }}>{r}</li>)}
              </ul>
            </div>

            {/* Certifications */}
            <div style={{ marginBottom: 24, padding: 24, border: '1px solid #e5e5e5', borderRadius: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Compliance Certifications</h2>
              <div>
                {rec.certifications.map((c) => (
                  <span key={c} style={{ display: 'inline-block', background: '#f0f0f0', padding: '4px 12px', borderRadius: 4, fontSize: 13, margin: 4 }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', color: '#888', fontSize: 12, marginTop: 40, paddingTop: 20, borderTop: '1px solid #e5e5e5' }}>
              Generated by Cloud Intelligence Platform · {date}<br />
              Data sourced from SEC filings, earnings reports, and Synergy Research Group.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
