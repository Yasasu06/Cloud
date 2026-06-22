'use client'

import { useEffect, useMemo, useState } from 'react'
import { compareCompute, type ComparisonRow, PROVIDER_LAST_UPDATED } from '@/lib/pricing/compare'
import LivePricingBadge from '@/components/LivePricingBadge'
import ToolShell from '@/components/ToolShell'

const PROVIDER_COLOR: Record<string, string> = {
  AWS: '#f59e0b', Azure: '#0078D4', GCP: '#4285f4',
  DigitalOcean: '#0080ff', Hetzner: '#e63946', Linode: '#02b159',
  Vultr: '#007bfc', Cloudflare: '#f6821f', Oracle: '#c0392b',
  Render: '#46e3b7', Railway: '#b044f8', 'Fly.io': '#a855f7',
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
            .no-print, header, .aurora-bg, .aurora-blob, .particle { display: none !important; }
            .pricing-row { break-inside: avoid; page-break-inside: avoid; }
            .pricing-row * { color: black !important; background: white !important; border-color: #888 !important; }
            input[type="range"] { display: none !important; }
            .pricing-print-header { display: block !important; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #333; }
            section, div { background: transparent !important; backdrop-filter: none !important; }
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
              <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2, margin: 0 }}>PRICING EXPLORER</p>
              <LivePricingBadge />
            </div>
            <button
              onClick={() => window.print()}
              className="no-print"
              style={{
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 10, padding: '9px 15px', color: '#a5b4fc',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(99,102,241,0.2)'; el.style.color = 'white' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(99,102,241,0.1)'; el.style.color = '#a5b4fc' }}
            >
              📄 Download PDF
            </button>
          </div>
          <h1 style={{ fontSize: 'clamp(34px, 6vw, 58px)', fontWeight: 900, marginBottom: 14, lineHeight: 1.04, letterSpacing: '-0.02em' }}>
            Which cloud is <span className="shimmer-text">cheapest</span> for<br />your exact workload?
          </h1>
          <p style={{ color: '#b4b4c4', fontSize: 17, maxWidth: 640 }}>
            Live AWS + Azure prices, verified pricing for the other 10. Pick a workload spec, see who&apos;s cheapest in real time.
          </p>
        </div>

        {/* Controls card (glassmorphism) */}
        <div className="glass-premium" style={{ padding: '22px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ flex: '1 1 240px' }}>
              <label htmlFor="vcpus" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8a8a9c', letterSpacing: 1, marginBottom: 8 }}>VCPUS</label>
              <input id="vcpus" type="range" min={1} max={16} value={vcpus} onChange={e => setVcpus(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: '#6366f1' }} />
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 800, color: 'white' }}>{vcpus} vCPU</div>
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <label htmlFor="ram" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8a8a9c', letterSpacing: 1, marginBottom: 8 }}>RAM (GB)</label>
              <input id="ram" type="range" min={1} max={64} value={ramGb} onChange={e => setRamGb(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: '#6366f1' }} />
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 800, color: 'white' }}>{ramGb} GB</div>
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
                    background: active ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: active ? '#a5b4fc' : '#a0a0b0', cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>

          {/* Provider filter chips */}
          <div>
            <div style={{ fontSize: 11, color: '#8a8a9c', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>SHOW PROVIDERS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.keys(PROVIDER_COLOR).map(p => {
                const excluded = excludedProviders.has(p)
                return (
                  <button
                    key={p}
                    onClick={() => toggleProvider(p)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: excluded ? 'transparent' : `${PROVIDER_COLOR[p]}15`,
                      border: `1px solid ${excluded ? 'rgba(255,255,255,0.08)' : `${PROVIDER_COLOR[p]}40`}`,
                      color: excluded ? '#555' : PROVIDER_COLOR[p],
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
          <div className="glass-premium" style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: '#a0a0b0', fontSize: 14 }}>No providers offer an instance matching {vcpus} vCPU + {ramGb} GB. Try a smaller spec.</p>
          </div>
        ) : (
          <>
            {/* Big savings banner */}
            {cheapest && mostExpensive && cheapest.provider !== mostExpensive.provider && (
              <div style={{
                padding: '22px 26px', borderRadius: 16, marginBottom: 16,
                background: 'linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.03))',
                border: '1px solid rgba(34,197,94,0.3)',
                boxShadow: '0 0 40px rgba(34,197,94,0.1)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: 1.5, marginBottom: 6 }}>SAVINGS OPPORTUNITY</div>
                <div style={{ fontSize: 'clamp(18px, 2.6vw, 24px)', fontWeight: 800, color: 'white', lineHeight: 1.3 }}>
                  Save <span style={{ color: '#22c55e' }}>${(mostExpensive.instance.price_monthly_usd - cheapest.instance.price_monthly_usd).toFixed(0)}/mo</span>
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
                    background: isCheapest ? `${color}12` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isCheapest ? `${color}45` : 'rgba(255,255,255,0.08)'}`,
                    borderLeft: `3px solid ${color}`,
                    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: isCheapest ? `0 0 30px ${color}18` : 'none',
                  }}>
                    <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <strong style={{ color, fontSize: 14, fontWeight: 800 }}>{row.provider}</strong>
                        {isCheapest && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', borderRadius: 4, letterSpacing: 1 }}>CHEAPEST</span>}
                        <LivePricingBadge provider={row.provider} compact />
                      </div>
                      <div style={{ fontSize: 13, color: '#a0a0b0' }}>{row.instance.name}</div>
                      {row.instance.notes && <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{row.instance.notes}</div>}
                    </div>
                    <div style={{ flex: '0 0 auto', display: 'flex', gap: 14, fontSize: 12, color: '#666' }}>
                      <span><strong style={{ color: '#a0a0b0' }}>{row.instance.vcpus}</strong> vCPU</span>
                      <span><strong style={{ color: '#a0a0b0' }}>{row.instance.ram_gb}</strong> GB</span>
                    </div>
                    <div style={{ flex: '0 0 120px', textAlign: 'right' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: 'white', lineHeight: 1 }}>
                        ${row.instance.price_monthly_usd.toFixed(0)}
                      </div>
                      <div style={{ fontSize: 10, color: '#666', letterSpacing: 0.5 }}>/MONTH</div>
                      {row.premium_vs_cheapest > 0 && (
                        <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>+${row.premium_vs_cheapest.toFixed(0)} vs cheapest</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Footer note */}
        <div style={{ marginTop: 32, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, fontSize: 12, color: '#777', backdropFilter: 'blur(10px)' }}>
          🟢 = Live API · 📌 = Verified by hand. AWS pricing fetched from <code style={{ color: '#818cf8' }}>pricing.us-east-1.amazonaws.com</code>; Azure from <code style={{ color: '#818cf8' }}>prices.azure.com</code>. Other providers verified {PROVIDER_LAST_UPDATED.GCP}. Pricing changes frequently — always verify with provider before committing.
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
