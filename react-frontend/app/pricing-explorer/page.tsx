'use client'

import { useEffect, useMemo, useState } from 'react'
import { compareCompute, type ComparisonRow, PROVIDER_LAST_UPDATED } from '@/lib/pricing/compare'
import LivePricingBadge from '@/components/LivePricingBadge'
import ToolShell from '@/components/ToolShell'

const PROVIDER_COLOR: Record<string, string> = {
  AWS: '#D97706', Azure: '#0078D4', GCP: '#4285f4',
  DigitalOcean: '#0080ff', Hetzner: '#e63946', Linode: '#02b159',
  Vultr: '#007bfc', Cloudflare: '#f6821f', Oracle: '#c0392b',
  Render: '#0d9488', Railway: '#475569', 'Fly.io': '#0EA5E9',
}

const COMMON_SPECS = [
  { label: '1 vCPU · 1 GB',  vcpus: 1, ram_gb: 1 },
  { label: '2 vCPU · 4 GB',  vcpus: 2, ram_gb: 4 },
  { label: '2 vCPU · 8 GB',  vcpus: 2, ram_gb: 8 },
  { label: '4 vCPU · 16 GB', vcpus: 4, ram_gb: 16 },
  { label: '8 vCPU · 32 GB', vcpus: 8, ram_gb: 32 },
]

export default function PricingExplorerPage() {
  const [vcpus, setVcpus] = useState(2)
  const [ramGb, setRamGb] = useState(4)
  const [results, setResults] = useState<ComparisonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [excludedProviders, setExcludedProviders] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const data = await compareCompute({ vcpus, ram_gb: ramGb })
      if (!cancelled) {
        setResults(data)
        setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [vcpus, ramGb])

  const filtered = useMemo(() =>
    results.filter(r => !excludedProviders.has(r.provider)),
    [results, excludedProviders],
  )

  const cheapest = filtered[0]
  const mostExpensive = filtered[filtered.length - 1]

  function toggleProvider(p: string) {
    setExcludedProviders(prev => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p); else next.add(p)
      return next
    })
  }

  return (
    <ToolShell label="Pricing Explorer">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 88px' }}>

        {/* Print-optimized stylesheet — hides the live UI chrome for clean PDFs */}
        <style>{`
          @media print {
            body { background: white !important; color: black !important; }
            .no-print, header, .mesh-bg, .mesh-veil { display: none !important; }
            .pricing-row { break-inside: avoid; page-break-inside: avoid; }
            .pricing-row * { color: black !important; background: white !important; border-color: #888 !important; }
            input[type="range"] { display: none !important; }
            .pricing-print-header { display: block !important; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #333; }
          }
          .pricing-print-header { display: none; }
        `}</style>

        {/* Print header (only visible in PDF) */}
        <div className="pricing-print-header">
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>☁️ Cloud Intelligence — Pricing Comparison</h1>
          <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
            Generated {new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })} ·
            Filter: {vcpus} vCPU + {ramGb} GB RAM
          </p>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <p style={{ color: 'var(--blue)', fontSize: 12, fontWeight: 700, letterSpacing: 2, margin: 0 }}>PRICING EXPLORER</p>
              <LivePricingBadge />
            </div>
            <button
              onClick={() => window.print()}
              className="no-print"
              style={{
                background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.3)',
                borderRadius: 10, padding: '9px 15px', color: 'var(--blue)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(37,99,235,0.12)' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(37,99,235,0.06)' }}
            >
              📄 Download PDF
            </button>
          </div>
          <h1 className="serif" style={{ fontSize: 'clamp(36px, 6vw, 60px)', marginBottom: 14, lineHeight: 1.04, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Which cloud is <span className="shimmer-text">cheapest</span> for<br />your exact workload?
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: 640, lineHeight: 1.6 }}>
            Live AWS + Azure prices, verified pricing for the other 10. Pick a workload spec, see who&apos;s cheapest in real time.
          </p>
        </div>

        {/* Controls card */}
        <div className="edi-card" style={{ padding: '22px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ flex: '1 1 240px' }}>
              <label htmlFor="vcpus" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', letterSpacing: 1, marginBottom: 8 }}>VCPUS</label>
              <input id="vcpus" type="range" min={1} max={16} value={vcpus} onChange={e => setVcpus(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: '#2563EB' }} />
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{vcpus} vCPU</div>
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <label htmlFor="ram" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', letterSpacing: 1, marginBottom: 8 }}>RAM (GB)</label>
              <input id="ram" type="range" min={1} max={64} value={ramGb} onChange={e => setRamGb(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: '#2563EB' }} />
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{ramGb} GB</div>
            </div>
          </div>

          {/* Quick specs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {COMMON_SPECS.map(s => {
              const active = vcpus === s.vcpus && ramGb === s.ram_gb
              return (
                <button
                  key={s.label}
                  onClick={() => { setVcpus(s.vcpus); setRamGb(s.ram_gb) }}
                  style={{
                    padding: '7px 13px', borderRadius: 16, fontSize: 12, fontWeight: 600,
                    background: active ? 'rgba(37,99,235,0.1)' : '#F4F4F0',
                    border: `1px solid ${active ? 'rgba(37,99,235,0.4)' : 'var(--border)'}`,
                    color: active ? 'var(--blue)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>

          {/* Provider filter chips */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>SHOW PROVIDERS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.keys(PROVIDER_COLOR).map(p => {
                const excluded = excludedProviders.has(p)
                return (
                  <button
                    key={p}
                    onClick={() => toggleProvider(p)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: excluded ? 'transparent' : `${PROVIDER_COLOR[p]}14`,
                      border: `1px solid ${excluded ? 'var(--border)' : `${PROVIDER_COLOR[p]}55`}`,
                      color: excluded ? 'var(--text-faint)' : PROVIDER_COLOR[p],
                      cursor: 'pointer', textDecoration: excluded ? 'line-through' : 'none', transition: 'all 0.15s ease',
                    }}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="ai-shimmer" style={{ height: 400, borderRadius: 18 }} />
        ) : filtered.length === 0 ? (
          <div className="edi-card" style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No providers offer an instance matching {vcpus} vCPU + {ramGb} GB. Try a smaller spec.</p>
          </div>
        ) : (
          <>
            {/* Big savings banner */}
            {cheapest && mostExpensive && cheapest.provider !== mostExpensive.provider && (
              <div style={{
                padding: '22px 26px', borderRadius: 16, marginBottom: 16,
                background: 'rgba(22,163,74,0.06)',
                border: '1px solid rgba(22,163,74,0.28)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', letterSpacing: 1.5, marginBottom: 6 }}>SAVINGS OPPORTUNITY</div>
                <div style={{ fontSize: 'clamp(18px, 2.6vw, 24px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
                  Save <span style={{ color: 'var(--green)' }}>${(mostExpensive.instance.price_monthly_usd - cheapest.instance.price_monthly_usd).toFixed(0)}/mo</span>
                  {' '}by choosing {cheapest.provider} ({cheapest.instance.name}) over {mostExpensive.provider}
                </div>
              </div>
            )}

            {/* Result rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map((row, i) => {
                const color = PROVIDER_COLOR[row.provider] ?? '#888'
                const isCheapest = i === 0
                return (
                  <div key={row.provider} className="pricing-row" style={{
                    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                    padding: '16px 20px', borderRadius: 14,
                    background: isCheapest ? `${color}0D` : 'var(--surface)',
                    border: `1px solid ${isCheapest ? `${color}55` : 'var(--border)'}`,
                    borderLeft: `3px solid ${color}`,
                    boxShadow: 'var(--shadow-card)',
                  }}>
                    <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <strong style={{ color, fontSize: 14, fontWeight: 800 }}>{row.provider}</strong>
                        {isCheapest && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: 'rgba(22,163,74,0.12)', color: 'var(--green)', borderRadius: 4, letterSpacing: 1 }}>CHEAPEST</span>}
                        <LivePricingBadge provider={row.provider} compact />
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.instance.name}</div>
                      {row.instance.notes && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{row.instance.notes}</div>}
                    </div>
                    <div style={{ flex: '0 0 auto', display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-faint)' }}>
                      <span><strong style={{ color: 'var(--text-muted)' }}>{row.instance.vcpus}</strong> vCPU</span>
                      <span><strong style={{ color: 'var(--text-muted)' }}>{row.instance.ram_gb}</strong> GB</span>
                    </div>
                    <div style={{ flex: '0 0 120px', textAlign: 'right' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
                        ${row.instance.price_monthly_usd.toFixed(0)}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: 0.5 }}>/MONTH</div>
                      {row.premium_vs_cheapest > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>+${row.premium_vs_cheapest.toFixed(0)} vs cheapest</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Footer note */}
        <div style={{ marginTop: 32, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          🟢 = Live API · 📌 = Verified by hand. AWS pricing fetched from <code style={{ color: 'var(--blue)' }}>pricing.us-east-1.amazonaws.com</code>; Azure from <code style={{ color: 'var(--blue)' }}>prices.azure.com</code>. Other providers verified {PROVIDER_LAST_UPDATED.GCP}. Pricing changes frequently — always verify with provider before committing.
        </div>

        <style>{`
          @media print { .pricing-print-footer { display: block !important; } }
        `}</style>
        <div className="pricing-print-footer" style={{ display: 'none', marginTop: 24, fontSize: 11, color: '#666', textAlign: 'center' }}>
          Generated by Cloud Intelligence Platform — Built by Yasaswi Dutta
        </div>
      </div>
    </ToolShell>
  )
}
