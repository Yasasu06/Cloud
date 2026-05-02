'use client'

import { useState, useEffect, useRef } from 'react'

type Provider = 'AWS' | 'Azure' | 'GCP' | 'DigitalOcean'
const PROVIDERS: Provider[] = ['AWS', 'Azure', 'GCP', 'DigitalOcean']

const PROVIDER_COLOR: Record<Provider, string> = {
  AWS: '#f59e0b',
  Azure: '#3b82f6',
  GCP: '#22c55e',
  DigitalOcean: '#0080ff',
}

const EGRESS_TIERS: Record<Provider, { limit: number; rate: number }[]> = {
  AWS: [
    { limit: 10_000,   rate: 0.09 },
    { limit: 50_000,   rate: 0.085 },
    { limit: Infinity, rate: 0.07 },
  ],
  Azure: [
    { limit: 10_000,   rate: 0.087 },
    { limit: 50_000,   rate: 0.083 },
    { limit: Infinity, rate: 0.07 },
  ],
  GCP: [
    { limit: 10_000,   rate: 0.08 },
    { limit: 150_000,  rate: 0.06 },
    { limit: Infinity, rate: 0.05 },
  ],
  DigitalOcean: [{ limit: Infinity, rate: 0.01 }],
}

const MONTHLY_SAVINGS_PER_GB: Record<Provider, Record<Provider, number>> = {
  AWS:          { AWS: 0,     Azure: 0.003, GCP: 0.004, DigitalOcean: 0.015 },
  Azure:        { AWS: 0.002, Azure: 0,     GCP: 0.003, DigitalOcean: 0.014 },
  GCP:          { AWS: 0.001, Azure: 0.002, GCP: 0,     DigitalOcean: 0.013 },
  DigitalOcean: { AWS: -0.01, Azure: -0.009,GCP: -0.008,DigitalOcean: 0 },
}

function calcEgress(provider: Provider, gb: number): number {
  const tiers = EGRESS_TIERS[provider]
  let cost = 0, remaining = gb, prevLimit = 0
  for (const tier of tiers) {
    const tierGB = Math.min(remaining, tier.limit - prevLimit)
    if (tierGB <= 0) break
    cost += tierGB * tier.rate
    remaining -= tierGB
    prevLimit = tier.limit
    if (remaining <= 0) break
  }
  return cost
}

function useAnimatedValue(target: number, duration = 500): number {
  const [displayed, setDisplayed] = useState(target)
  const rafRef = useRef<number | null>(null)
  const prevRef = useRef(target)
  useEffect(() => {
    const from = prevRef.current
    const to = target
    if (from === to) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(from + (to - from) * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else { prevRef.current = to; setDisplayed(to) }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])
  return displayed
}

function fmtExact(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function verdict(months: number): { label: string; color: string; bg: string } {
  if (months <= 0)  return { label: 'No savings — destination costs more', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' }
  if (months <= 6)  return { label: 'Worth it — migrate now',              color: '#22c55e', bg: 'rgba(34,197,94,0.08)' }
  if (months <= 12) return { label: 'Consider carefully',                  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' }
  return { label: 'Probably not worth it', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' }
}

interface ResultCardProps {
  egress: number; monthlyGain: number; breakEven: number
  from: Provider; to: Provider; gb: number; highlight?: boolean
}

function ResultCard({ egress, monthlyGain, breakEven, from, to, gb, highlight }: ResultCardProps) {
  const animEgress = useAnimatedValue(egress)
  const animGain = useAnimatedValue(monthlyGain)
  const v = verdict(breakEven)

  return (
    <div style={{
      background: highlight ? 'rgba(99,102,241,0.06)' : '#111118',
      border: highlight ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: '22px 20px', flex: 1, minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: PROVIDER_COLOR[from] }}>{from}</span>
        <span style={{ fontSize: 12, color: '#444' }}>→</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: PROVIDER_COLOR[to] }}>{to}</span>
        {highlight && (
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: 6 }}>YOUR CHOICE</span>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>ONE-TIME EGRESS COST</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: 'white' }}>{fmtExact(animEgress)}</div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
          {(gb / 1000).toFixed(1)} TB at tiered rates
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>MONTHLY SAVINGS</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: monthlyGain > 0 ? '#22c55e' : '#ef4444' }}>
          {monthlyGain > 0 ? '+' : ''}{fmtExact(animGain)}<span style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>/mo</span>
        </div>
      </div>
      {monthlyGain > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>BREAK-EVEN</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
            {breakEven < 999 ? `${breakEven.toFixed(1)} months` : '∞'}
          </div>
        </div>
      )}
      <div style={{ background: v.bg, borderRadius: 10, padding: '10px 12px', marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: v.color }}>{v.label}</div>
      </div>
    </div>
  )
}

interface Props { embedded?: boolean }

export default function EgressCalculatorTool({ embedded = false }: Props) {
  const [from, setFrom] = useState<Provider>('AWS')
  const [to, setTo] = useState<Provider>('GCP')
  const [gb, setGb] = useState(5000)

  const egress = calcEgress(from, gb)
  const monthlySaving = Math.max(0, MONTHLY_SAVINGS_PER_GB[from][to] * gb)
  const breakEven = monthlySaving > 0 ? egress / monthlySaving : Infinity

  const animEgress = useAnimatedValue(egress)
  const animSaving = useAnimatedValue(monthlySaving)
  const v = verdict(breakEven)

  const comparisons: [Provider, Provider][] = (['Azure', 'GCP', 'DigitalOcean'] as Provider[])
    .filter(p => p !== from)
    .slice(0, 3)
    .map(p => [from, p])

  const selectStyle: React.CSSProperties = {
    background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 14px', color: 'white',
    fontSize: 15, fontWeight: 600, outline: 'none', cursor: 'pointer', flex: 1,
  }

  const inner = (
    <>
      {!embedded && (
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            EGRESS CALCULATOR
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
            The Hidden Cost of<br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Switching Cloud Providers
            </span>
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 560, lineHeight: 1.6 }}>
            Cloud vendors charge you to <strong style={{ color: 'white' }}>leave</strong>.
            Egress fees can cost tens of thousands before you save a dollar.
            See exactly what your migration costs — and whether it&apos;s worth it.
          </p>
        </div>
      )}

      <div style={{ background: '#1a1a2e', borderRadius: 20, padding: '28px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="ec-from" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>CURRENT PROVIDER</label>
            <select id="ec-from" value={from} onChange={e => { const v = e.target.value as Provider; setFrom(v); if (v === to) setTo(PROVIDERS.find(p => p !== v) ?? 'GCP') }} style={selectStyle}>
              {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="ec-to" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>DESTINATION</label>
            <select id="ec-to" value={to} onChange={e => setTo(e.target.value as Provider)} style={selectStyle}>
              {PROVIDERS.filter(p => p !== from).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1 }}>DATA VOLUME TO MIGRATE</label>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>
              {gb >= 1000 ? `${(gb / 1000).toFixed(1)} TB` : `${gb} GB`}
            </div>
          </div>
          <input type="range" min={0} max={100000} step={100} value={gb} onChange={e => setGb(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer', height: 6 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#333', marginTop: 6 }}>
            <span>0 GB</span><span>25 TB</span><span>50 TB</span><span>75 TB</span><span>100 TB</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>EGRESS FROM {from}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: PROVIDER_COLOR[from] }}>{fmtExact(animEgress)}</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 6, lineHeight: 1.5 }}>One-time fee to move your data</div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {EGRESS_TIERS[from].map((tier, i) => {
              const prevLimit = i === 0 ? 0 : EGRESS_TIERS[from][i - 1].limit
              const tierLabel = tier.limit === Infinity
                ? `>${(prevLimit / 1000).toFixed(0)} TB`
                : `${(prevLimit / 1000).toFixed(0)}–${(tier.limit / 1000).toFixed(0)} TB`
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#444' }}>
                  <span>{tierLabel}</span>
                  <span>${tier.rate.toFixed(3)}/GB</span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>MONTHLY SAVINGS</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: monthlySaving > 0 ? '#22c55e' : '#ef4444' }}>
            {monthlySaving > 0 ? '+' : ''}{fmtExact(animSaving)}
          </div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 6, lineHeight: 1.5 }}>
            {monthlySaving > 0 ? `Estimated savings at ${to} vs ${from}` : `${to} costs more than ${from} for this workload`}
          </div>
        </div>

        <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>BREAK-EVEN</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'white' }}>
            {monthlySaving > 0 ? breakEven < 999 ? `${breakEven.toFixed(1)}mo` : '∞' : '—'}
          </div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 6, lineHeight: 1.5 }}>
            {monthlySaving > 0 ? 'Months until egress cost is recovered' : 'No monthly savings to recover cost'}
          </div>
        </div>
      </div>

      <div style={{ background: v.bg, border: `1px solid ${v.color}30`, borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
        <div style={{ fontSize: 28 }}>
          {v.color === '#22c55e' ? '✓' : v.color === '#f59e0b' ? '⚠' : '✗'}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: v.color }}>{v.label}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
            {monthlySaving > 0 && breakEven < 999
              ? `Egress costs ${fmtExact(egress)} upfront. You recover that in ${breakEven.toFixed(1)} months of ${fmtExact(monthlySaving)}/mo savings.`
              : monthlySaving > 0
              ? `Egress costs ${fmtExact(egress)} and you never fully recover it at current rates.`
              : `Switching to ${to} doesn't save money on storage/compute — egress fee is pure cost.`}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Compare All Destinations from {from}</h2>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>Same {gb >= 1000 ? `${(gb / 1000).toFixed(1)} TB` : `${gb} GB`} migration, different destinations.</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {comparisons.map(([f, t]) => {
            const eg = calcEgress(f, gb)
            const ms = Math.max(0, MONTHLY_SAVINGS_PER_GB[f][t] * gb)
            const be = ms > 0 ? eg / ms : Infinity
            return <ResultCard key={t} egress={eg} monthlyGain={ms} breakEven={be} from={f} to={t} gb={gb} highlight={t === to} />
          })}
        </div>
      </div>

      <div style={{ marginTop: 48, background: '#111118', borderRadius: 16, padding: '24px 28px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Why does egress cost so much?</h3>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 12 }}>
          Cloud providers charge for <strong style={{ color: '#a0a0b0' }}>data leaving their network</strong> — but not for data entering.
          This asymmetry is intentional: it creates switching costs that make migration expensive, effectively locking you in.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {([
            { label: 'AWS → Internet',    rate: '$0.09/GB',  note: 'First 10 TB/month' },
            { label: 'Azure → Internet',  rate: '$0.087/GB', note: 'First 10 TB/month' },
            { label: 'GCP → Internet',    rate: '$0.08/GB',  note: 'First 10 TB/month' },
            { label: 'DigitalOcean',      rate: '$0.01/GB',  note: 'Much lower egress' },
          ] as const).map(item => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', flex: '1 1 140px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#6366f1' }}>{item.rate}</div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  if (embedded) return <div>{inner}</div>
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px' }}>{inner}</div>
    </div>
  )
}
