'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const WORKLOAD_RECOMMENDATIONS: Record<string, {
  bestCloud: string
  color: string
  reason: string
  alternatives: string
}> = {
  'AI & Machine Learning Training': { bestCloud: 'GCP', color: '#34A853', reason: 'TPUs are unmatched for training. Vertex AI is the most mature MLOps platform.', alternatives: 'Azure for OpenAI models' },
  'AI Inference & APIs': { bestCloud: 'Azure', color: '#0078D4', reason: 'Azure OpenAI Service gives enterprise SLAs on GPT-4 and other frontier models.', alternatives: 'AWS Bedrock as alternative' },
  'Data Analytics & Warehousing': { bestCloud: 'GCP', color: '#34A853', reason: 'BigQuery is the best managed data warehouse. Significantly cheaper than Redshift at scale.', alternatives: 'AWS Redshift for existing AWS shops' },
  'Web App & API Hosting': { bestCloud: 'AWS', color: '#FF9900', reason: 'EC2, ECS, and Lambda give the most mature and flexible compute options for web workloads.', alternatives: 'Azure App Service for .NET apps' },
  'Enterprise Identity & Auth': { bestCloud: 'Azure', color: '#0078D4', reason: 'Azure Active Directory is the industry standard for enterprise identity. Integrates with everything.', alternatives: 'AWS Cognito for consumer apps' },
  'DevOps & CI/CD': { bestCloud: 'AWS', color: '#FF9900', reason: 'CodePipeline + CodeBuild + ECR gives the most complete native DevOps suite.', alternatives: 'Azure DevOps if team already uses it' },
  'Global CDN & Edge': { bestCloud: 'Cloudflare', color: '#F38020', reason: '285 edge locations, cheapest egress, Workers for edge compute. AWS CloudFront is a distant second.', alternatives: 'AWS CloudFront for tighter AWS integration' },
  'Database (Relational)': { bestCloud: 'AWS', color: '#FF9900', reason: 'Aurora is the best managed relational database. PostgreSQL and MySQL compatible.', alternatives: 'Azure SQL for Microsoft shops' },
  'Database (NoSQL)': { bestCloud: 'AWS', color: '#FF9900', reason: 'DynamoDB is the gold standard for serverless NoSQL at any scale.', alternatives: 'GCP Firestore for simpler use cases' },
  'IoT & Edge Computing': { bestCloud: 'Azure', color: '#0078D4', reason: 'Azure IoT Hub + Azure Digital Twins is the most complete IoT platform for enterprise.', alternatives: 'AWS IoT Core for simpler deployments' },
  'Gaming Servers': { bestCloud: 'AWS', color: '#FF9900', reason: 'GameLift is purpose-built for game server hosting with global matchmaking.', alternatives: 'Vultr for budget game servers' },
  'File & Object Storage': { bestCloud: 'AWS', color: '#FF9900', reason: 'S3 is the industry standard. Most reliable, most integrations, competitive pricing.', alternatives: 'Cloudflare R2 for zero egress cost storage' },
  'Video Streaming & Processing': { bestCloud: 'AWS', color: '#FF9900', reason: 'AWS Elemental is purpose-built for video. Best transcoding and delivery pipeline.', alternatives: 'GCP for YouTube-scale use cases' },
  'Compliance & Regulated Workloads': { bestCloud: 'Azure', color: '#0078D4', reason: 'Azure has the most compliance certifications (100+) and dedicated government clouds.', alternatives: 'AWS GovCloud for US federal requirements' },
}

export default function MultiCloudPage() {
  const router = useRouter()
  const [workloads, setWorkloads] = useState<string[]>([])
  const [analyzed, setAnalyzed] = useState(false)

  function toggleWorkload(w: string) {
    setWorkloads(prev =>
      prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]
    )
    setAnalyzed(false)
  }

  const results = workloads.map(w => ({
    workload: w,
    ...WORKLOAD_RECOMMENDATIONS[w],
  }))

  const cloudCount: Record<string, number> = {}
  results.forEach(r => {
    cloudCount[r.bestCloud] = (cloudCount[r.bestCloud] || 0) + 1
  })
  const primaryCloud = Object.entries(cloudCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'
  const monthlySavingsEstimate = workloads.length * 200

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 600, marginBottom: 8, letterSpacing: 2 }}>
            MULTI-CLOUD OPTIMIZER
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Which workload belongs on which cloud?
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 600 }}>
            Select all the workloads your organization runs. We will tell you
            the optimal cloud for each one — and where you might be
            overpaying by using the wrong provider.
          </p>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#a0a0b0', marginBottom: 16 }}>
            SELECT YOUR WORKLOADS ({workloads.length} selected)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {Object.keys(WORKLOAD_RECOMMENDATIONS).map(w => {
              const isSelected = workloads.includes(w)
              return (
                <button
                  key={w}
                  onClick={() => toggleWorkload(w)}
                  style={{
                    background: isSelected ? '#1e3a5f' : '#1a1a2e',
                    border: `2px solid ${isSelected ? '#6366f1' : '#ffffff10'}`,
                    borderRadius: 10,
                    padding: '12px 16px',
                    color: isSelected ? 'white' : '#a0a0b0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {isSelected ? '✓ ' : ''}{w}
                </button>
              )
            })}
          </div>
        </div>

        {workloads.length > 0 && (
          <button
            onClick={() => setAnalyzed(true)}
            style={{
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '14px 40px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 24,
              marginBottom: 40,
            }}
          >
            Analyze My Multi-Cloud Setup →
          </button>
        )}

        {analyzed && results.length > 0 && (
          <div>
            <button
              onClick={() => setAnalyzed(false)}
              style={{ background: 'transparent', border: '1px solid #ffffff20', borderRadius: 8, padding: '8px 16px', color: '#a0a0b0', cursor: 'pointer', fontSize: 14, marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              ← Modify Selection
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 24, borderTop: '3px solid #6366f1' }}>
                <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>PRIMARY CLOUD RECOMMENDATION</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{primaryCloud}</div>
                <div style={{ color: '#a0a0b0', fontSize: 13 }}>
                  Best fit for {primaryCloud !== 'N/A' ? cloudCount[primaryCloud] : 0} of your {workloads.length} workloads
                </div>
              </div>
              <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 24, borderTop: '3px solid #22c55e' }}>
                <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 8 }}>POTENTIAL MONTHLY SAVINGS</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e', marginBottom: 4 }}>
                  ${monthlySavingsEstimate.toLocaleString()}+
                </div>
                <div style={{ color: '#a0a0b0', fontSize: 13 }}>By moving each workload to its optimal provider</div>
              </div>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Workload-by-Workload Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map((r, i) => (
                <div
                  key={i}
                  style={{
                    background: '#1a1a2e',
                    borderRadius: 12,
                    padding: '20px 24px',
                    borderLeft: `4px solid ${r.color}`,
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 2fr',
                    gap: 16,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.workload}</div>
                    <div style={{ color: '#a0a0b0', fontSize: 13 }}>{r.reason}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: r.color, fontWeight: 800, fontSize: 20 }}>{r.bestCloud}</div>
                    <div style={{ color: '#a0a0b0', fontSize: 11, marginTop: 4 }}>BEST FIT</div>
                  </div>
                  <div style={{ background: '#ffffff08', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#a0a0b0' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>Alt: </span>
                    {r.alternatives}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 16, padding: 24, border: '1px solid #ffffff15' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Want a detailed cost analysis?</h3>
              <p style={{ color: '#a0a0b0', marginBottom: 16, fontSize: 14 }}>
                See exactly how much each workload costs on each provider and where you can save the most.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => router.push('/planner')}
                  style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Open Cost Planner →
                </button>
                <button
                  onClick={() => router.push('/chat')}
                  style={{ background: 'transparent', color: 'white', border: '1px solid #ffffff30', borderRadius: 12, padding: '12px 24px', fontSize: 14, cursor: 'pointer' }}
                >
                  Ask AI Consultant
                </button>
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="/others"
                style={{
                  color: '#a0a0b0',
                  fontSize: 14,
                  textDecoration: 'none',
                  padding: '10px 18px',
                  border: '1px solid #ffffff20',
                  borderRadius: 10,
                }}
              >
                Explore Alternative Providers →
              </a>
              <a
                href="/migration"
                style={{
                  color: '#a0a0b0',
                  fontSize: 14,
                  textDecoration: 'none',
                  padding: '10px 18px',
                  border: '1px solid #ffffff20',
                  borderRadius: 10,
                }}
              >
                Analyze Migration Complexity →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
