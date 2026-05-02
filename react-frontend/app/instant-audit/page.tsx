'use client'

import { useState, useEffect, useRef } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import NextActionCards from '@/components/NextActionCards'

// ─── Types ────────────────────────────────────────────────────────────────────

type Provider = 'AWS' | 'Azure' | 'GCP'

interface ServiceRow {
  name:       string
  emoji:      string
  color:      string
  pct:        number
  wastePct:   number
  confidence: 'high' | 'medium' | 'low'
  action:     string
  actionHref: string
}

interface Rec {
  title:    string
  saving:   string
  effort:   string
  priority: 'P1' | 'P2' | 'P3'
  consoleLink: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROVIDER_SERVICES: Record<Provider, ServiceRow[]> = {
  AWS: [
    { name: 'EC2 Compute',    emoji: '🖥️', color: '#f59e0b', pct: 0.40, wastePct: 0.30, confidence: 'high',   action: 'Right-size instances', actionHref: 'https://console.aws.amazon.com/ec2/v2/home#Instances' },
    { name: 'RDS Databases',  emoji: '🗄️', color: '#6366f1', pct: 0.20, wastePct: 0.25, confidence: 'high',   action: 'Enable Reserved Instances', actionHref: 'https://console.aws.amazon.com/rds/home#reserved-instances' },
    { name: 'Data Transfer',  emoji: '🔀', color: '#ef4444', pct: 0.15, wastePct: 0.40, confidence: 'medium', action: 'Add CloudFront CDN', actionHref: 'https://console.aws.amazon.com/cloudfront/v3/home' },
    { name: 'S3 Storage',     emoji: '🪣', color: '#22c55e', pct: 0.10, wastePct: 0.15, confidence: 'high',   action: 'Enable Intelligent-Tiering', actionHref: 'https://s3.console.aws.amazon.com/s3/home' },
    { name: 'Other Services', emoji: '⚙️', color: '#818cf8', pct: 0.15, wastePct: 0.10, confidence: 'low',    action: 'Review with Cost Explorer', actionHref: 'https://console.aws.amazon.com/cost-management/home' },
  ],
  Azure: [
    { name: 'Virtual Machines', emoji: '🖥️', color: '#0078d4', pct: 0.42, wastePct: 0.28, confidence: 'high',   action: 'Resize VMs', actionHref: 'https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.Compute%2FVirtualMachines' },
    { name: 'SQL Database',     emoji: '🗄️', color: '#6366f1', pct: 0.18, wastePct: 0.22, confidence: 'high',   action: 'Enable Reserved Capacity', actionHref: 'https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.Sql%2Fservers' },
    { name: 'Bandwidth',        emoji: '🔀', color: '#ef4444', pct: 0.14, wastePct: 0.35, confidence: 'medium', action: 'Use Azure CDN', actionHref: 'https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.Cdn%2Fprofiles' },
    { name: 'Blob Storage',     emoji: '🪣', color: '#22c55e', pct: 0.12, wastePct: 0.12, confidence: 'high',   action: 'Enable lifecycle management', actionHref: 'https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.Storage%2FStorageAccounts' },
    { name: 'Other',            emoji: '⚙️', color: '#818cf8', pct: 0.14, wastePct: 0.08, confidence: 'low',    action: 'Review Cost Analysis', actionHref: 'https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/costanalysis' },
  ],
  GCP: [
    { name: 'Compute Engine',  emoji: '🖥️', color: '#4285f4', pct: 0.38, wastePct: 0.28, confidence: 'high',   action: 'Use Committed Use Discounts', actionHref: 'https://console.cloud.google.com/compute/instances' },
    { name: 'Cloud SQL',       emoji: '🗄️', color: '#6366f1', pct: 0.20, wastePct: 0.20, confidence: 'high',   action: 'Enable Committed Use', actionHref: 'https://console.cloud.google.com/sql/instances' },
    { name: 'Egress',          emoji: '🔀', color: '#ef4444', pct: 0.16, wastePct: 0.38, confidence: 'medium', action: 'Use Cloud CDN', actionHref: 'https://console.cloud.google.com/net-services/cdn/list' },
    { name: 'Cloud Storage',   emoji: '🪣', color: '#22c55e', pct: 0.11, wastePct: 0.14, confidence: 'high',   action: 'Set lifecycle policies', actionHref: 'https://console.cloud.google.com/storage/browser' },
    { name: 'Other Services',  emoji: '⚙️', color: '#818cf8', pct: 0.15, wastePct: 0.10, confidence: 'low',    action: 'Review Billing', actionHref: 'https://console.cloud.google.com/billing' },
  ],
}

const CONFIDENCE_META = {
  high:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  label: 'High' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Med'  },
  low:    { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'Low'  },
}

const PROVIDER_RECS: Record<Provider, Rec[]> = {
  AWS: [
    { title: 'Switch to Reserved Instances for stable workloads',   saving: '35%',        effort: 'Low',    priority: 'P1', consoleLink: 'https://console.aws.amazon.com/ec2/v2/home#ReservedInstances' },
    { title: 'Right-size over-provisioned EC2 instances',          saving: '18–30%',     effort: 'Medium', priority: 'P1', consoleLink: 'https://console.aws.amazon.com/ec2/v2/home#Instances' },
    { title: 'Add CloudFront to reduce data transfer costs',        saving: '$X00/month', effort: 'Low',    priority: 'P2', consoleLink: 'https://console.aws.amazon.com/cloudfront' },
    { title: 'Enable S3 Intelligent-Tiering on all buckets',        saving: '15–60%',     effort: 'Low',    priority: 'P2', consoleLink: 'https://s3.console.aws.amazon.com/s3/home' },
    { title: 'Delete unused EBS volumes and old snapshots',         saving: '$50–200/mo', effort: 'Low',    priority: 'P3', consoleLink: 'https://console.aws.amazon.com/ec2/v2/home#Volumes' },
  ],
  Azure: [
    { title: 'Purchase Reserved VM Instances (1-year)',             saving: '30–40%',     effort: 'Low',    priority: 'P1', consoleLink: 'https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/ReservationsBlade' },
    { title: 'Resize oversized Virtual Machines',                   saving: '20–35%',     effort: 'Medium', priority: 'P1', consoleLink: 'https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.Compute%2FVirtualMachines' },
    { title: 'Enable Azure Hybrid Benefit',                         saving: '30%',        effort: 'Low',    priority: 'P2', consoleLink: 'https://azure.microsoft.com/en-us/pricing/hybrid-benefit/' },
    { title: 'Set up Azure Cost Alerts and budgets',                saving: 'Preventive', effort: 'Low',    priority: 'P2', consoleLink: 'https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/budgets' },
    { title: 'Delete unused managed disks',                         saving: '$50–300/mo', effort: 'Low',    priority: 'P3', consoleLink: 'https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.Compute%2Fdisks' },
  ],
  GCP: [
    { title: 'Commit to 1-year CUDs on stable Compute Engine VMs', saving: '37–55%',     effort: 'Low',    priority: 'P1', consoleLink: 'https://console.cloud.google.com/compute/commitments' },
    { title: 'Right-size Compute Engine instances',                 saving: '20–30%',     effort: 'Medium', priority: 'P1', consoleLink: 'https://console.cloud.google.com/compute/instances' },
    { title: 'Set Cloud Storage lifecycle rules',                   saving: '15–50%',     effort: 'Low',    priority: 'P2', consoleLink: 'https://console.cloud.google.com/storage/browser' },
    { title: 'Use Cloud CDN to reduce egress',                      saving: '30–60%',     effort: 'Low',    priority: 'P2', consoleLink: 'https://console.cloud.google.com/net-services/cdn' },
    { title: 'Enable Recommender API for automatic suggestions',    saving: 'Ongoing',    effort: 'Low',    priority: 'P3', consoleLink: 'https://console.cloud.google.com/home/recommendations' },
  ],
}

const PRIORITY_META = {
  P1: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'P1 — Critical' },
  P2: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'P2 — High' },
  P3: { color: '#818cf8', bg: 'rgba(129,140,248,0.1)',label: 'P3 — Medium' },
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function useCounter(target: number, active: boolean, duration = 1400): number {
  const [value, setValue] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (!active || target === 0) return
    const start = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * e))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, active, duration])

  return value
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InstantAuditPage() {
  const [spend, setSpend]           = useState('')
  const [provider, setProvider]     = useState<Provider>('AWS')
  const [generated, setGenerated]   = useState(false)
  const [loading, setLoading]       = useState(false)
  const [doneRecs, setDoneRecs]     = useState<Record<number, boolean>>({})

  const spendNum = parseFloat(spend.replace(/,/g, '')) || 0
  const services = PROVIDER_SERVICES[provider]
  const recs     = PROVIDER_RECS[provider]

  // Derived numbers
  const totalWaste   = spendNum > 0 ? Math.round(services.reduce((a, s) => a + spendNum * s.pct * s.wastePct, 0)) : 0
  const wastePct     = spendNum > 0 ? Math.round((totalWaste / spendNum) * 100) : 0
  const industryAvg  = 28
  const annualWaste  = totalWaste * 12

  const counterWaste  = useCounter(totalWaste,  generated)
  const counterAnnual = useCounter(annualWaste, generated, 1800)

  const pieData = services.map(s => ({ name: s.name, value: Math.round(spendNum * s.pct), color: s.color }))

  // Action plan buckets
  const phase1Saving = Math.round(totalWaste * 0.45)
  const phase2Saving = Math.round(totalWaste * 0.30)
  const phase3Saving = Math.round(totalWaste * 0.25)

  function generate() {
    if (!spendNum) return
    setLoading(true)
    setTimeout(() => {
      setGenerated(true)
      setLoading(false)
    }, 1200)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 15, fontWeight: 600,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white; color: black; }
          .glass-card { border: 1px solid #ddd !important; background: #fafafa !important; }
        }
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            FREE CLOUD AUDIT
          </div>
          <h1 style={{ fontSize: 'clamp(26px,5vw,44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
            Get Your Visual Cloud Audit<br />
            <span style={{ color: '#22c55e' }}>in 30 Seconds</span>
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 460, margin: '0 auto' }}>
            Enter your monthly spend. Get a complete waste report, action plan, and recommendations.
          </p>
        </div>

        {/* Input card */}
        <div className="glass-card no-print" style={{ padding: 28, marginBottom: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 8 }}>MONTHLY CLOUD SPEND ($)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b0', fontSize: 15, pointerEvents: 'none' }}>$</span>
                <input
                  type="number" min="0" value={spend}
                  onChange={e => { setSpend(e.target.value); setGenerated(false) }}
                  placeholder="e.g. 8000"
                  style={{ ...inputStyle, paddingLeft: 28 }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 8 }}>CLOUD PROVIDER</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['AWS', 'Azure', 'GCP'] as Provider[]).map(p => (
                  <button key={p} onClick={() => { setProvider(p); setGenerated(false) }} style={{
                    flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    border: provider === p ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: provider === p ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    color: provider === p ? '#818cf8' : '#a0a0b0', transition: 'all 0.15s',
                  }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={!spendNum || loading}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: !spendNum ? 'rgba(99,102,241,0.3)' : loading ? '#4f46e5' : '#6366f1',
              border: 'none', color: 'white', cursor: !spendNum ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {loading ? '⏳ Generating your audit...' : '🔍 Generate Free Audit Report →'}
          </button>
        </div>

        {/* ── Results ── */}
        {generated && spendNum > 0 && (
          <>
            {/* Print + share toolbar */}
            <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#555', flex: 1 }}>Your audit report · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <button onClick={() => window.print()} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', color: '#a0a0b0', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                🖨️ Download PDF
              </button>
              <a href="/analyze" style={{ background: '#6366f1', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                Get AI Deep-Dive →
              </a>
            </div>

            {/* 1. Executive Summary */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20,
              padding: '36px 32px', textAlign: 'center', marginBottom: 24,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', letterSpacing: 2, marginBottom: 12 }}>EXECUTIVE SUMMARY</div>
              <div style={{ fontSize: 'clamp(28px,6vw,52px)', fontWeight: 900, color: '#ef4444', lineHeight: 1, marginBottom: 8 }}>
                ${counterWaste.toLocaleString()}
                <span style={{ fontSize: '0.4em', color: '#a0a0b0', fontWeight: 600 }}>/month in waste</span>
              </div>
              <p style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 8 }}>
                found in your <strong style={{ color: 'white' }}>${spendNum.toLocaleString()}/month</strong> {provider} bill
              </p>
              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16, marginBottom: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: wastePct > industryAvg ? '#ef4444' : '#22c55e' }}>{wastePct}%</div>
                  <div style={{ fontSize: 11, color: '#555' }}>Your waste rate</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#a0a0b0' }}>{industryAvg}%</div>
                  <div style={{ fontSize: 11, color: '#555' }}>Industry average</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>${counterAnnual.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>Annual waste</div>
                </div>
              </div>
            </div>

            {/* 2 + 3. Donut + Heatmap row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, marginBottom: 24, alignItems: 'start' }}>
              {/* Donut chart */}
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>SERVICE BREAKDOWN</div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      contentStyle={{ background: '#0d0d16', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                      <span style={{ color: '#a0a0b0', flex: 1 }}>{d.name}</span>
                      <span style={{ color: 'white', fontWeight: 700 }}>${d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waste heatmap */}
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 14 }}>WASTE HEATMAP</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {services.map(s => {
                    const svcSpend = Math.round(spendNum * s.pct)
                    const svcWaste = Math.round(svcSpend * s.wastePct)
                    const cm = CONFIDENCE_META[s.confidence]
                    return (
                      <div key={s.name} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{s.emoji} {s.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, background: cm.bg, color: cm.color, padding: '2px 7px', borderRadius: 5 }}>{cm.label}</span>
                            <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 700 }}>${svcWaste.toLocaleString()} waste</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${s.wastePct * 100}%`, background: s.color, borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#555' }}>{Math.round(s.wastePct * 100)}% waste</span>
                        </div>
                        <a href={s.actionHref} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
                          → {s.action}
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 4. 30-Day Action Plan */}
            <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 20 }}>📅 30-DAY ACTION PLAN</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {[
                  { range: 'Day 1–7',   label: 'Quick Wins',       saving: phase1Saving, color: '#22c55e', items: ['Enable Reserved Instances', 'S3 Intelligent-Tiering', 'Delete unused snapshots'] },
                  { range: 'Day 8–14',  label: 'Medium Effort',    saving: phase2Saving, color: '#f59e0b', items: ['Right-size 2–3 large instances', 'Add CDN for data transfer', 'Review idle resources'] },
                  { range: 'Day 15–30', label: 'Strategic',        saving: phase3Saving, color: '#6366f1', items: ['Migrate cold data to archive tiers', 'Implement autoscaling policies', 'Set budget alerts'] },
                ].map(phase => (
                  <div key={phase.range} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '18px 16px', borderTop: `3px solid ${phase.color}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: phase.color, letterSpacing: 1, marginBottom: 6 }}>{phase.range}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 4 }}>{phase.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: phase.color, marginBottom: 12 }}>${phase.saving.toLocaleString()}/mo</div>
                    {phase.items.map(item => (
                      <div key={item} style={{ fontSize: 12, color: '#666', marginBottom: 5, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <span style={{ color: phase.color, flexShrink: 0 }}>✓</span>{item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Industry comparison gauge */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>📊 COMPARISON TO INDUSTRY PEERS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555', marginBottom: 6 }}>
                    <span>0% waste</span>
                    <span>Industry avg {industryAvg}%</span>
                    <span>50%+</span>
                  </div>
                  <div style={{ position: 'relative', height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(industryAvg / 50) * 100}%`, width: 2, background: '#a0a0b0', zIndex: 1 }} />
                    <div style={{ height: '100%', width: `${Math.min(wastePct / 50 * 100, 100)}%`, background: wastePct > industryAvg ? '#ef4444' : '#22c55e', borderRadius: 10, transition: 'width 1s ease' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 120 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: wastePct > industryAvg ? '#ef4444' : '#22c55e' }}>
                    {wastePct > industryAvg ? `+${wastePct - industryAvg}%` : `-${industryAvg - wastePct}%`}
                  </div>
                  <div style={{ fontSize: 12, color: '#555' }}>
                    {wastePct > industryAvg ? 'above industry avg' : 'below industry avg'}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                {wastePct > industryAvg
                  ? `You spend ${wastePct - industryAvg}% more than similar companies. Implementing the above recommendations would bring you to the industry average.`
                  : `Your waste rate is better than the ${industryAvg}% industry average. Focus on the quick wins above to improve further.`}
              </p>
            </div>

            {/* 6. Top 5 Recommendation Cards */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>🎯 TOP 5 RECOMMENDATIONS</div>
              {recs.map((rec, i) => {
                const pm = PRIORITY_META[rec.priority]
                const done = !!doneRecs[i]
                return (
                  <div key={i} className="glass-card" style={{
                    padding: '18px 20px', marginBottom: 10,
                    borderLeft: `3px solid ${done ? '#22c55e' : pm.color}`,
                    opacity: done ? 0.6 : 1, transition: 'opacity 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, background: pm.bg, color: pm.color, padding: '2px 8px', borderRadius: 5 }}>{pm.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: done ? '#22c55e' : 'white' }}>
                            {done ? '✓ Done — ' : ''}{rec.title}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#555' }}>
                          <span>💰 Save: <strong style={{ color: '#22c55e' }}>{rec.saving}</strong></span>
                          <span>⏱ Effort: {rec.effort}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <a href={rec.consoleLink} target="_blank" rel="noopener noreferrer" className="no-print" style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, textDecoration: 'none', padding: '5px 10px', border: '1px solid rgba(129,140,248,0.25)', borderRadius: 7 }}>
                          Open Console ↗
                        </a>
                        <button
                          onClick={() => setDoneRecs(p => ({ ...p, [i]: !p[i] }))}
                          className="no-print"
                          style={{
                            background: done ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: 7, padding: '5px 10px', cursor: 'pointer',
                            fontSize: 12, color: done ? '#22c55e' : '#666', fontWeight: 600,
                          }}
                        >
                          {done ? '✓ Done' : 'Mark done'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom CTA */}
            <div className="no-print" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: '32px', textAlign: 'center' }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Want a deeper analysis?</h3>
              <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 20, maxWidth: 380, margin: '0 auto 20px' }}>
                Describe your specific stack and get a personalized optimization plan from our AI.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/analyze" style={{ background: '#6366f1', borderRadius: 10, padding: '12px 24px', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>AI Deep-Dive Analysis →</a>
                <a href="/optimize?tab=savings" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 24px', color: '#a0a0b0', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Savings Calculator</a>
              </div>
            </div>

            <NextActionCards actions={[
              { icon: '🛠️', title: 'Start Optimization', desc: 'Run optimization tools',  href: '/optimize' },
              { icon: '📊', title: 'Track Progress',     desc: 'Visual journey',           href: '/outcome-simulator' },
              { icon: '👥', title: 'Discuss with Team',  desc: 'Share findings',           href: '/team' },
            ]} />
          </>
        )}
      </div>
    </div>
  )
}
