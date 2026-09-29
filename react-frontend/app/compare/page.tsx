'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { compareCompute, type ComparisonRow } from '@/lib/pricing/compare'
import LivePricingBadge from '@/components/LivePricingBadge'

const ALL_PROVIDERS = ['AWS', 'Azure', 'GCP', 'DigitalOcean', 'Hetzner', 'Oracle Cloud', 'Linode', 'Vultr', 'Cloudflare Workers', 'OVH', 'Render', 'Railway'] as const
type Provider = typeof ALL_PROVIDERS[number]

interface ProviderData {
  color: string
  tagline: string
  startingCost: string
  freeTier: string
  bestFor: string
  regions: number
  supportCost: string
  egressFees: string
  aiMl: number
  easeOfUse: number
  smbFriendly: number
  lockIn: 'Low' | 'Medium' | 'High'
  lockInScore: number
  costScore: number
}

const DATA: Record<Provider, ProviderData> = {
  AWS:           { color: '#f59e0b', tagline: 'Market leader',          startingCost: '~$5–20/mo',       freeTier: '12 months on 100+ services (t2.micro, S3, Lambda)',            bestFor: 'Enterprise workloads, regulated industries, global scale',            regions: 34, supportCost: 'From $29/mo (Developer)',          egressFees: '$0.09/GB (first 10TB)',      aiMl: 4, easeOfUse: 2, smbFriendly: 2, lockIn: 'High',   lockInScore: 3, costScore: 5 },
  Azure:         { color: '#0078D4', tagline: 'Microsoft ecosystem',    startingCost: '~$5–18/mo',       freeTier: '12 months on popular services + always-free tier',              bestFor: 'Microsoft shops, enterprise, hybrid cloud',                          regions: 60, supportCost: 'From $29/mo (Developer)',          egressFees: '$0.087/GB (first 10TB)',     aiMl: 4, easeOfUse: 2, smbFriendly: 2, lockIn: 'High',   lockInScore: 3, costScore: 4 },
  GCP:           { color: '#22c55e', tagline: 'AI-first cloud',         startingCost: '~$5–15/mo',       freeTier: 'Always-free tier (f1-micro, 5GB Cloud Storage, Cloud Run)',     bestFor: 'AI/ML workloads, data analytics, Kubernetes',                        regions: 40, supportCost: 'From $29/mo (Basic paid)',          egressFees: '$0.08/GB (first 1–10TB)',    aiMl: 5, easeOfUse: 3, smbFriendly: 3, lockIn: 'High',   lockInScore: 3, costScore: 3 },
  DigitalOcean:  { color: '#0080ff', tagline: 'Developer-friendly',     startingCost: '$4/mo (Droplet)', freeTier: '$200 credit for 60 days',                                       bestFor: 'Startups, developers, web apps, side projects',                       regions: 15, supportCost: 'Free ticket; $50/mo faster response', egressFees: '1TB free/mo then $0.01/GB', aiMl: 2, easeOfUse: 5, smbFriendly: 5, lockIn: 'Low',    lockInScore: 1, costScore: 2 },
  Hetzner:       { color: '#e63946', tagline: 'Best price/performance', startingCost: '€3.29/mo (~$3.50)', freeTier: 'None (pay-as-you-go)',                                        bestFor: 'EU workloads, cost-sensitive apps, bare metal',                      regions: 5,  supportCost: 'Free (community + ticket)',          egressFees: '20TB free/mo then €1/TB',   aiMl: 1, easeOfUse: 4, smbFriendly: 5, lockIn: 'Low',    lockInScore: 1, costScore: 1 },
  'Oracle Cloud':{ color: '#c0392b', tagline: 'Generous free tier',     startingCost: '$0 (Always Free)', freeTier: 'Always-free: 2 AMD VMs, 4 ARM VMs, 200GB storage, 10TB egress', bestFor: 'Oracle DB workloads, cost-sensitive enterprise teams',                regions: 46, supportCost: 'Free; from $100/mo (Premier)',       egressFees: '10TB free/mo then $0.0085/GB', aiMl: 2, easeOfUse: 2, smbFriendly: 3, lockIn: 'Medium', lockInScore: 2, costScore: 2 },
  Linode:              { color: '#02b159', tagline: 'Simple & affordable',     startingCost: '$5/mo (1GB)',       freeTier: '$100 credit for 60 days',                                        bestFor: 'Linux workloads, developers, simple web hosting',                    regions: 11, supportCost: 'Free ticket; $15/mo professional',      egressFees: '1TB free/mo then $0.01/GB',     aiMl: 1, easeOfUse: 5, smbFriendly: 5, lockIn: 'Low',    lockInScore: 1, costScore: 2 },
  Vultr:               { color: '#007bfc', tagline: 'Global edge computing',   startingCost: '$2.50/mo',          freeTier: '$250 credit for 30 days',                                        bestFor: 'Edge computing, global reach, bare metal',                           regions: 32, supportCost: 'Free ticket; $30/mo Pro',             egressFees: '1TB free/mo then $0.01/GB',     aiMl: 1, easeOfUse: 4, smbFriendly: 5, lockIn: 'Low',    lockInScore: 1, costScore: 1 },
  'Cloudflare Workers':{ color: '#f6821f', tagline: 'Edge-first serverless',   startingCost: '$0 (free tier)',    freeTier: '100k requests/day free forever',                                 bestFor: 'Edge functions, static sites, global APIs',                          regions: 300, supportCost: 'Community; $200/mo Business',          egressFees: 'Zero egress included',          aiMl: 2, easeOfUse: 4, smbFriendly: 5, lockIn: 'Medium', lockInScore: 2, costScore: 1 },
  OVH:                 { color: '#123f6d', tagline: 'European cloud leader',   startingCost: '€3/mo (~$3)',       freeTier: 'None (pay-as-you-go)',                                           bestFor: 'EU compliance, data sovereignty, dedicated servers',                 regions: 14, supportCost: 'Free; from €56/mo OVHcloud Pro',       egressFees: 'Bandwidth included in plans',   aiMl: 1, easeOfUse: 3, smbFriendly: 4, lockIn: 'Low',    lockInScore: 1, costScore: 1 },
  Render:              { color: '#46e3b7', tagline: 'Heroku replacement',      startingCost: '$7/mo',             freeTier: 'Static sites free; limited services',                            bestFor: 'Web services, Heroku migrants, Git deploy',                          regions: 5,  supportCost: 'Community; $29/mo team plan',          egressFees: '$0.10/GB',                      aiMl: 1, easeOfUse: 5, smbFriendly: 5, lockIn: 'Low',    lockInScore: 1, costScore: 2 },
  Railway:             { color: '#b044f8', tagline: 'Modern dev platform',     startingCost: '$5/mo + usage',     freeTier: '$5 credit/month',                                                bestFor: 'Indie hackers, side projects, fast deploys',                         regions: 3,  supportCost: 'Community Discord',                    egressFees: '$0.10/GB',                      aiMl: 1, easeOfUse: 5, smbFriendly: 5, lockIn: 'Low',    lockInScore: 1, costScore: 2 },
}

const LOCK_IN_COLOR: Record<ProviderData['lockIn'], string> = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' }

const WINNER_OPTIONS = [
  { key: 'cost',   label: 'Lowest cost',    icon: '💰' },
  { key: 'ease',   label: 'Easiest to use', icon: '🧭' },
  { key: 'ai',     label: 'Best AI/ML',     icon: '🤖' },
  { key: 'lockin', label: 'Least lock-in',  icon: '🔓' },
] as const
type WinnerKey = typeof WINNER_OPTIONS[number]['key']

function RatingBar({ value, color }: { value: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
        <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${(value / 5) * 100}%`, height: '100%', background: color, borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 12, color: '#666', minWidth: 20 }}>{value}/5</span>
      </div>
      <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 4 }}>
        {[1,2,3,4,5].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i <= value ? color : 'rgba(255,255,255,0.1)' }} />)}
      </div>
    </div>
  )
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16)
  return `${r},${g},${b}`
}

const ROWS: { key: string; label: string; render: (d: ProviderData) => React.ReactNode }[] = [
  { key: 'startingCost', label: 'Starting Monthly Cost', render: d => <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>{d.startingCost}</span> },
  { key: 'freeTier',     label: 'Free Tier',             render: d => <span style={{ fontSize: 11, color: '#a0a0b0', lineHeight: 1.5 }}>{d.freeTier}</span> },
  { key: 'bestFor',      label: 'Best For',              render: d => <span style={{ fontSize: 11, color: '#e0e0e0', lineHeight: 1.5 }}>{d.bestFor}</span> },
  { key: 'regions',      label: 'Global Regions',        render: d => <span style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{d.regions}</span> },
  { key: 'supportCost',  label: 'Support Cost',          render: d => <span style={{ fontSize: 11, color: '#a0a0b0' }}>{d.supportCost}</span> },
  { key: 'egressFees',   label: 'Egress Fees',           render: d => <span style={{ fontSize: 11, color: '#a0a0b0' }}>{d.egressFees}</span> },
  { key: 'aiMl',         label: 'AI / ML',               render: d => <RatingBar value={d.aiMl} color="#a855f7" /> },
  { key: 'easeOfUse',    label: 'Ease of Use',           render: d => <RatingBar value={d.easeOfUse} color="#22c55e" /> },
  { key: 'smbFriendly',  label: 'SMB Friendly',          render: d => <RatingBar value={d.smbFriendly} color="#0080ff" /> },
  { key: 'lockIn',       label: 'Vendor Lock-in Risk',   render: d => <span style={{ fontSize: 12, fontWeight: 700, color: LOCK_IN_COLOR[d.lockIn], background: `rgba(${d.lockIn === 'Low' ? '34,197,94' : d.lockIn === 'Medium' ? '245,158,11' : '239,68,68'},0.1)`, padding: '3px 10px', borderRadius: 6 }}>{d.lockIn}</span> },
]

export default function ComparePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<Provider[]>(['AWS', 'GCP', 'DigitalOcean'])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const withParam = params.get('with') as Provider | null
    if (withParam && ALL_PROVIDERS.includes(withParam)) {
      setSelected(['AWS', 'GCP', withParam])
    }
  }, [])
  const [winnerKey, setWinnerKey] = useState<WinnerKey | null>(null)
  const [liveSpec, setLiveSpec] = useState({ vcpus: 2, ram_gb: 4 })
  const [liveRows, setLiveRows] = useState<ComparisonRow[]>([])
  const [liveLoading, setLiveLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLiveLoading(true)
    compareCompute(liveSpec).then(rows => {
      if (!cancelled) { setLiveRows(rows); setLiveLoading(false) }
    })
    return () => { cancelled = true }
  }, [liveSpec])

  // Match selected providers (Provider type uses "Oracle Cloud", "Cloudflare Workers" — pricing module uses short names)
  const PROVIDER_MAP: Record<string, string> = { 'Oracle Cloud': 'Oracle', 'Cloudflare Workers': 'Cloudflare' }
  const PROVIDER_MAP_INV: Record<string, string> = { Oracle: 'Oracle Cloud', Cloudflare: 'Cloudflare Workers' }
  const filteredLiveRows = useMemo(() => {
    const wanted = new Set(selected.map(p => PROVIDER_MAP[p] ?? p))
    return liveRows.filter(r => wanted.has(r.provider))
  }, [liveRows, selected])

  function toggleProvider(p: Provider) {
    setSelected(prev => {
      if (prev.includes(p)) return prev.length <= 2 ? prev : prev.filter(x => x !== p)
      if (prev.length >= 3) return prev
      return [...prev, p]
    })
  }

  const winner = useMemo((): { provider: Provider; reason: string } | null => {
    if (!winnerKey) return null
    const candidates = selected.map(p => ({ p, d: DATA[p] }))
    switch (winnerKey) {
      case 'cost': { const b = candidates.reduce((a,x) => a.d.costScore < x.d.costScore ? a : x); return { provider: b.p, reason: `${b.p} has the lowest starting cost at ${b.d.startingCost}/month.` } }
      case 'ease': { const b = candidates.reduce((a,x) => a.d.easeOfUse > x.d.easeOfUse ? a : x); return { provider: b.p, reason: `${b.p} scores ${b.d.easeOfUse}/5 for ease of use — ${b.d.tagline}.` } }
      case 'ai':   { const b = candidates.reduce((a,x) => a.d.aiMl > x.d.aiMl ? a : x); return { provider: b.p, reason: `${b.p} scores ${b.d.aiMl}/5 for AI/ML — ${b.d.bestFor.toLowerCase()}.` } }
      case 'lockin':{ const b = candidates.reduce((a,x) => a.d.lockInScore < x.d.lockInScore ? a : x); return { provider: b.p, reason: `${b.p} has ${b.d.lockIn.toLowerCase()} vendor lock-in risk. Open standards, portable workloads.` } }
    }
  }, [winnerKey, selected])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>VENDOR COMPARISON</div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 12 }}>Compare cloud providers side-by-side</h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>Select 2–3 providers to compare. All data based on publicly available pricing.</p>
        </div>

        <div style={{ background: '#1a1a2e', borderRadius: 20, padding: '24px 28px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
          <p style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>SELECT 2–3 PROVIDERS</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ALL_PROVIDERS.map(p => {
              const active = selected.includes(p)
              const disabled = !active && selected.length >= 3
              return (
                <button key={p} onClick={() => !disabled && toggleProvider(p)} style={{ padding: '9px 18px', borderRadius: 10, border: active ? `1px solid ${DATA[p].color}` : '1px solid rgba(255,255,255,0.1)', background: active ? `rgba(${hexToRgb(DATA[p].color)},0.12)` : 'transparent', color: active ? DATA[p].color : disabled ? '#333' : '#a0a0b0', fontWeight: active ? 700 : 500, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
                  {p}{active && <span style={{ marginLeft: 6, fontSize: 10 }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Live pricing panel */}
        {selected.length >= 2 && (
          <div style={{ background: '#1a1a2e', borderRadius: 20, padding: '24px 28px', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>Selected Compute Prices</h2>
                <LivePricingBadge compact />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[{ l: '1 vCPU · 1GB', v: 1, r: 1 }, { l: '2 vCPU · 4GB', v: 2, r: 4 }, { l: '4 vCPU · 16GB', v: 4, r: 16 }, { l: '8 vCPU · 32GB', v: 8, r: 32 }].map(s => (
                  <button key={s.l} onClick={() => setLiveSpec({ vcpus: s.v, ram_gb: s.r })}
                    style={{ padding: '5px 12px', borderRadius: 16, fontSize: 11, fontWeight: 600,
                      background: liveSpec.vcpus === s.v && liveSpec.ram_gb === s.r ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${liveSpec.vcpus === s.v && liveSpec.ram_gb === s.r ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: liveSpec.vcpus === s.v && liveSpec.ram_gb === s.r ? '#818cf8' : '#a0a0b0', cursor: 'pointer' }}
                  >{s.l}</button>
                ))}
              </div>
            </div>

            {liveLoading ? (
              <div className="ai-shimmer" style={{ height: 160, borderRadius: 12 }} />
            ) : filteredLiveRows.length === 0 ? (
              <p style={{ color: '#666', fontSize: 13, padding: '12px 0' }}>None of your selected providers have an instance matching {liveSpec.vcpus} vCPU + {liveSpec.ram_gb}GB. Try a smaller spec.</p>
            ) : (
              <>
                {filteredLiveRows.length > 1 && (() => {
                  const cheapest = filteredLiveRows[0]
                  const top = filteredLiveRows[filteredLiveRows.length - 1]
                  const delta = top.instance.price_monthly_usd - cheapest.instance.price_monthly_usd
                  return delta > 0 ? (
                    <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)', marginBottom: 12, fontSize: 13 }}>
                      <strong style={{ color: '#22c55e' }}>${delta.toFixed(0)}/mo reference price difference</strong>{' '}
                      <span style={{ color: '#a0a0b0' }}>vs the highest listed price — {cheapest.provider} ({cheapest.instance.name}) is the lowest listed match. Verify workload equivalence and provider pricing.</span>
                    </div>
                  ) : null
                })()}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filteredLiveRows.map((row, i) => {
                    const color = DATA[row.provider as Provider]?.color ?? DATA[(PROVIDER_MAP_INV[row.provider] ?? row.provider) as Provider]?.color ?? '#888'
                    const isCheapest = i === 0
                    return (
                      <div key={row.provider} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)`, borderLeft: `3px solid ${color}` }}>
                        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <strong style={{ color, fontSize: 13 }}>{row.provider}</strong>
                            {isCheapest && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', borderRadius: 4, letterSpacing: 0.8 }}>WINNER</span>}
                            <LivePricingBadge provider={row.provider} source={row.instance.price_source} compact />
                          </div>
                          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{row.instance.name} — {row.instance.vcpus}vCPU/{row.instance.ram_gb}GB</div>
                        </div>
                        <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
                          <span style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>${row.instance.price_monthly_usd.toFixed(0)}</span>
                          <span style={{ fontSize: 10, color: '#666', marginLeft: 4 }}>/mo</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {selected.length >= 2 && (
          <div style={{ overflowX: 'auto', marginBottom: 40 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, width: 180, background: '#0a0a0f', position: 'sticky', left: 0, zIndex: 2 }}>FEATURE</th>
                  {selected.map(p => (
                    <th key={p} style={{ padding: '16px 20px', textAlign: 'center', background: '#1a1a2e', borderTop: `3px solid ${DATA[p].color}`, borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 2 }}>{p}</div>
                      <div style={{ fontSize: 11, color: DATA[p].color, fontWeight: 600 }}>{DATA[p].tagline}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, ri) => (
                  <tr key={row.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 0.5, background: '#0a0a0f', position: 'sticky', left: 0, zIndex: 1 }}>{row.label.toUpperCase()}</td>
                    {selected.map(p => (
                      <td key={p} style={{ padding: '14px 20px', textAlign: 'center', background: ri % 2 === 0 ? '#111118' : '#0f0f16', borderLeft: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' }}>
                        {row.render(DATA[p])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected.length >= 2 && (
          <div style={{ background: '#1a1a2e', borderRadius: 20, padding: '32px 28px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Winner for your situation</h2>
            <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 24 }}>What matters most to you?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
              {WINNER_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setWinnerKey(prev => prev === opt.key ? null : opt.key)} style={{ padding: '10px 20px', borderRadius: 12, border: winnerKey === opt.key ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', background: winnerKey === opt.key ? 'rgba(99,102,241,0.15)' : 'transparent', color: winnerKey === opt.key ? '#818cf8' : '#a0a0b0', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{opt.icon}</span>{opt.label}
                </button>
              ))}
            </div>
            {winner && (
              <div style={{ background: `rgba(${hexToRgb(DATA[winner.provider].color)},0.06)`, border: `1px solid rgba(${hexToRgb(DATA[winner.provider].color)},0.3)`, borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `rgba(${hexToRgb(DATA[winner.provider].color)},0.15)`, border: `1px solid rgba(${hexToRgb(DATA[winner.provider].color)},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: DATA[winner.provider].color, textAlign: 'center', flexShrink: 0 }}>
                  {winner.provider.split(' ').map(w => w[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>RECOMMENDED</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: DATA[winner.provider].color, marginBottom: 4 }}>{winner.provider}</div>
                  <div style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.5 }}>{winner.reason}</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #1a1a2e)', borderRadius: 16, padding: '24px 28px', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 6, letterSpacing: 1 }}>NEXT STEP</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Get a personalized provider recommendation</h3>
            <p style={{ color: '#a0a0b0', fontSize: 13 }}>AI analysis tailored to your workload, team size, and budget.</p>
          </div>
          <button onClick={() => router.push('/advisor')} style={{ background: '#6366f1', border: 'none', borderRadius: 12, padding: '13px 28px', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Get My Recommendation →
          </button>
        </div>
      </div>
    </div>
  )
}
