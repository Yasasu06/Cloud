'use client'

import { useEffect, useMemo, useState } from 'react'
import { compareCompute, type ComparisonRow, PROVIDER_SOURCE, PROVIDER_LAST_UPDATED } from '@/lib/pricing/compare'
import LivePricingBadge from '@/components/LivePricingBadge'

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
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2, margin: 0 }}>PRICING EXPLORER</p>
            <LivePricingBadge />
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
            Compare 12 providers in real time
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 640 }}>
            Live AWS + Azure prices, verified pricing for the other 10. Pick a workload spec, see who&apos;s cheapest.
          </p>
        </div>

        {/* Spec controls */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ flex: '1 1 240px' }}>
            <label htmlFor="vcpus" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1, marginBottom: 8 }}>VCPUS</label>
            <input id="vcpus" type="range" min={1} max={16} value={vcpus} onChange={e => setVcpus(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: '#6366f1' }} />
            <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: 'white' }}>{vcpus} vCPU</div>
          </div>
          <div style={{ flex: '1 1 240px' }}>
            <label htmlFor="ram" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1, marginBottom: 8 }}>RAM (GB)</label>
            <input id="ram" type="range" min={1} max={64} value={ramGb} onChange={e => setRamGb(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: '#6366f1' }} />
            <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: 'white' }}>{ramGb} GB</div>
          </div>
        </div>

        {/* Quick specs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {COMMON_SPECS.map(s => (
            <button
              key={s.label}
              onClick={() => { setVcpus(s.vcpus); setRamGb(s.ram_gb) }}
              style={{
                padding: '6px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600,
                background: vcpus === s.vcpus && ramGb === s.ram_gb ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${vcpus === s.vcpus && ramGb === s.ram_gb ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: vcpus === s.vcpus && ramGb === s.ram_gb ? '#818cf8' : '#a0a0b0',
                cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Provider filter chips */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#666', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>SHOW PROVIDERS</div>
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
                    color: excluded ? '#444' : PROVIDER_COLOR[p],
                    cursor: 'pointer', textDecoration: excluded ? 'line-through' : 'none',
                  }}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="ai-shimmer" style={{ height: 400, borderRadius: 14 }} />
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
            <p style={{ color: '#666', fontSize: 14 }}>No providers offer an instance matching {vcpus} vCPU + {ramGb} GB. Try a smaller spec.</p>
          </div>
        ) : (
          <>
            {/* Big savings banner */}
            {cheapest && mostExpensive && cheapest.provider !== mostExpensive.provider && (
              <div style={{
                padding: '20px 24px', borderRadius: 14, marginBottom: 16,
                background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))',
                border: '1px solid rgba(34,197,94,0.25)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: 1.5, marginBottom: 4 }}>SAVINGS OPPORTUNITY</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>
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
                  <div key={row.provider} style={{
                    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                    padding: '16px 20px', borderRadius: 12,
                    background: isCheapest ? `${color}08` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isCheapest ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
                    borderLeft: `3px solid ${color}`,
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
                      <div style={{ fontSize: 22, fontWeight: 900, color: 'white', lineHeight: 1 }}>
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
        <div style={{ marginTop: 32, padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, fontSize: 12, color: '#666' }}>
          🟢 = Live API · 📌 = Verified by hand. AWS pricing fetched from <code style={{ color: '#818cf8' }}>pricing.us-east-1.amazonaws.com</code>; Azure from <code style={{ color: '#818cf8' }}>prices.azure.com</code>. Other providers verified {PROVIDER_LAST_UPDATED.GCP}. Pricing changes frequently — always verify with provider before committing.
        </div>
      </div>
    </div>
  )
}
