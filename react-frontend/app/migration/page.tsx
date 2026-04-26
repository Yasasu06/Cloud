'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, AlertCircle, Info } from 'lucide-react'

const PROVIDERS = ['AWS', 'Azure', 'GCP']

interface MigrationPath {
  complexity: number
  duration: string
  hardest: string[]
  easiest: string[]
  tips: string[]
}

const MIGRATION_DATA: Record<string, MigrationPath> = {
  'AWS→Azure': {
    complexity: 72,
    duration: '6–12 months',
    hardest: ['IAM → Entra ID mapping', 'Lambda → Azure Functions rewrites', 'S3 → Blob Storage data migration'],
    easiest: ['VPC → VNet configuration', 'SQL databases', 'DNS and CDN'],
    tips: ['Use Azure Migrate for discovery', 'Start with stateless workloads', 'Establish AD sync first'],
  },
  'AWS→GCP': {
    complexity: 68,
    duration: '4–9 months',
    hardest: ['IAM roles to GCP IAM', 'EC2 → Compute Engine configs', 'CloudFront → Cloud CDN'],
    easiest: ['BigQuery replaces Redshift well', 'GKE is closest to EKS', 'Pub/Sub replaces SQS/SNS'],
    tips: ['Use Migrate for Compute Engine', 'GCS is near drop-in for S3', 'Leverage Anthos for hybrid'],
  },
  'Azure→AWS': {
    complexity: 65,
    duration: '5–10 months',
    hardest: ['Entra ID → IAM restructure', 'Azure DevOps → CodePipeline', 'Cosmos DB → DynamoDB'],
    easiest: ['Azure SQL → RDS', 'Blob Storage → S3', 'VNet → VPC'],
    tips: ['AWS Migration Hub tracks progress', 'Use Schema Conversion Tool', 'CloudEndure for servers'],
  },
  'Azure→GCP': {
    complexity: 58,
    duration: '4–8 months',
    hardest: ['Entra ID → GCP IAM', 'Azure Functions → Cloud Run', 'Azure Monitor → Cloud Ops'],
    easiest: ['BigQuery + Power BI integration', 'Kubernetes workloads', 'Storage migration'],
    tips: ['Both share strong Kubernetes DNA', 'Migrate analytics to BigQuery first', 'Use Transfer Appliance for data'],
  },
  'GCP→AWS': {
    complexity: 70,
    duration: '5–11 months',
    hardest: ['BigQuery → Redshift/Athena', 'GKE → EKS reconfiguration', 'Cloud Spanner → Aurora'],
    easiest: ['Compute instances', 'Object storage', 'Managed databases'],
    tips: ['AWS DataSync for storage transfer', 'Replace Spanner with Aurora Global', 'Use AWS Schema Conversion Tool'],
  },
  'GCP→Azure': {
    complexity: 62,
    duration: '4–9 months',
    hardest: ['BigQuery → Synapse Analytics', 'Pub/Sub → Event Hub', 'GCP IAM → Entra ID'],
    easiest: ['VM migration', 'Container workloads', 'DevOps tooling'],
    tips: ['Azure Data Factory for pipelines', 'Migrate analytics to Synapse', 'Use Azure Migrate assessment'],
  },
}

function ComplexityGauge({ value }: { value: number }) {
  const color = value >= 70 ? '#ef4444' : value >= 50 ? '#f59e0b' : '#34A853'
  const label = value >= 70 ? 'High Complexity' : value >= 50 ? 'Medium Complexity' : 'Lower Complexity'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden mb-2">
        <svg viewBox="0 0 120 60" className="w-full">
          <path d="M10 55 A50 50 0 0 1 110 55" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <path
            d="M10 55 A50 50 0 0 1 110 55"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${(value / 100) * 157} 157`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="text-2xl font-black text-white">{value}</span>
          <span className="text-xs text-white">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

export default function MigrationPage() {
  const [from, setFrom] = useState('AWS')
  const [to, setTo] = useState('Azure')

  const key = `${from}→${to}`
  const path = MIGRATION_DATA[key] ?? null
  const isValid = from !== to && path !== null

  return (
    <div className="min-h-screen pt-24 px-4 pb-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
            Migration Planner
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Plan your cloud migration
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Complexity scores, timelines, and key considerations for every migration path.
          </p>
        </div>

        {/* Provider selectors */}
        <div
          className="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-4 justify-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div>
            <p className="text-xs font-semibold text-white mb-2 text-center">Migrating FROM</p>
            <div className="flex gap-2">
              {PROVIDERS.map((p) => (
                <button key={p} onClick={() => setFrom(p)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: from === p ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                    border: from === p ? '1px solid #6366f1' : '1px solid transparent',
                    color: from === p ? '#c7d2fe' : '#a0a0b0',
                  }}
                >{p}</button>
              ))}
            </div>
          </div>
          <ArrowRight size={20} className="hidden sm:block" style={{ color: 'var(--text-secondary)' }} />
          <div>
            <p className="text-xs font-semibold text-white mb-2 text-center">Migrating TO</p>
            <div className="flex gap-2">
              {PROVIDERS.map((p) => (
                <button key={p} onClick={() => setTo(p)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: to === p ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                    border: to === p ? '1px solid #6366f1' : '1px solid transparent',
                    color: to === p ? '#c7d2fe' : '#a0a0b0',
                  }}
                >{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {from === to ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Info size={32} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Select different source and destination providers.</p>
          </div>
        ) : isValid && path ? (
          <div className="space-y-5">
            {/* Summary row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                className="rounded-2xl p-5 flex flex-col items-center text-center col-span-1"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <ComplexityGauge value={path.complexity} />
              </div>
              <div
                className="rounded-2xl p-5 sm:col-span-2"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Migration Path</p>
                <h2 className="text-2xl font-black text-white mb-1">{from} → {to}</h2>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Estimated timeline: <span className="text-white font-semibold">{path.duration}</span>
                </p>
                <div className="space-y-1">
                  {path.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94a3b8' }}>
                      <span style={{ color: 'var(--accent)' }}>›</span> {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={16} style={{ color: '#f87171' }} />
                  <p className="text-sm font-semibold" style={{ color: '#f87171' }}>Hardest to Migrate</p>
                </div>
                <ul className="space-y-2">
                  {path.hardest.map((item, i) => (
                    <li key={i} className="text-sm" style={{ color: '#fca5a5' }}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl p-5" style={{ background: 'rgba(52,168,83,0.07)', border: '1px solid rgba(52,168,83,0.2)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
                  <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>Easiest to Migrate</p>
                </div>
                <ul className="space-y-2">
                  {path.easiest.map((item, i) => (
                    <li key={i} className="text-sm" style={{ color: '#86efac' }}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
