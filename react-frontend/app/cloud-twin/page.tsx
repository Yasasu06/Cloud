'use client'

import { useState, useEffect } from 'react'

const QUESTIONS = [
  {
    id: 'provider',
    text: 'Which cloud provider are you on?',
    options: ['AWS', 'Azure', 'Google Cloud', 'DigitalOcean', 'Not on cloud yet', 'Multiple clouds'],
  },
  {
    id: 'spend',
    text: 'How much do you spend per month?',
    options: ['Under $500', '$500 – $2,000', '$2,000 – $10,000', '$10,000 – $50,000', 'Over $50,000'],
  },
  {
    id: 'teamSize',
    text: 'How many team members manage your cloud?',
    options: ['Just me', '2 – 5 people', '6 – 20 people', '21+ people'],
  },
  {
    id: 'workload',
    text: "What's your main workload?",
    options: ['Web app / SaaS', 'ML / AI models', 'Data pipeline', 'E-commerce', 'Other'],
  },
  {
    id: 'painPoint',
    text: "What's your biggest pain point right now?",
    options: [
      'Unexpected bill spikes',
      'Wasting money on unused resources',
      'Security & compliance gaps',
      'Scaling costs growing fast',
      'Slow deployments',
      'Choosing the right cloud',
    ],
  },
]

const PROVIDER_COLORS: Record<string, string> = {
  AWS: '#FF9900',
  Azure: '#0078D4',
  'Google Cloud': '#34A853',
  DigitalOcean: '#0080FF',
  'Not on cloud yet': '#6366f1',
  'Multiple clouds': '#a855f7',
}

const WORKLOAD_ICONS: Record<string, string> = {
  'Web app / SaaS': '🌐',
  'ML / AI models': '🤖',
  'Data pipeline': '📊',
  'E-commerce': '🛍️',
  'Other': '⚡',
}

const PAIN_RECOMMENDATIONS: Record<string, string> = {
  'Unexpected bill spikes': 'Enable Cost Anomaly Detection and set billing alerts at 80% of your expected monthly spend. Review the last 3 months of billing history to find the pattern.',
  'Wasting money on unused resources': 'Run a rightsizing audit this week — start with EC2/VM instances and unattached storage volumes. AWS Trusted Advisor and Azure Advisor do this for free.',
  'Security & compliance gaps': 'Enable CloudTrail/Audit Logs and set up MFA for all IAM users. Review public S3/Blob/GCS bucket access. This takes under 2 hours.',
  'Scaling costs growing fast': 'Implement auto-scaling policies and evaluate Reserved/Committed Use discounts for steady-state workloads. A 1-year commitment saves 30–40% on compute.',
  'Slow deployments': 'Set up a CI/CD pipeline with GitHub Actions or native cloud pipelines. Automate your deployments to reduce manual errors and cut deploy time by 80%.',
  'Choosing the right cloud': 'Use the Advisor tool for a data-driven recommendation based on your specific workload, budget, and compliance needs.',
}

const SPEND_MIDPOINTS: Record<string, number> = {
  'Under $500': 250,
  '$500 – $2,000': 1250,
  '$2,000 – $10,000': 6000,
  '$10,000 – $50,000': 30000,
  'Over $50,000': 75000,
}

function getTeamEfficiency(teamSize: string): number {
  if (teamSize === 'Just me') return 60
  if (teamSize === '2 – 5 people') return 75
  return 85
}

interface Profile {
  provider: string
  spend: string
  teamSize: string
  workload: string
  painPoint: string
}

interface ChatEntry {
  question: string
  answer: string
}

const STORAGE_KEY = 'cloud-twin-profile'

export default function CloudTwinPage() {
  const [currentQ, setCurrentQ] = useState(0)
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [history, setHistory] = useState<ChatEntry[]>([])
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setProfile(JSON.parse(saved) as Profile)
        setShowProfile(true)
      }
    } catch { /* ignore */ }
  }, [])

  function handleAnswer(answer: string) {
    const q = QUESTIONS[currentQ]
    const newHistory = [...history, { question: q.text, answer }]
    const newProfile = { ...profile, [q.id]: answer }
    setHistory(newHistory)
    setProfile(newProfile)
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile))
      setShowProfile(true)
    }
  }

  function handleBack() {
    const prev = currentQ - 1
    const keyToRemove = QUESTIONS[prev].id as keyof Profile
    setCurrentQ(prev)
    setHistory(h => h.slice(0, -1))
    setProfile(p => {
      const next = { ...p }
      delete next[keyToRemove]
      return next
    })
  }

  function updateProfile() {
    setShowProfile(false)
    setCurrentQ(0)
    setProfile({})
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const providerColor = PROVIDER_COLORS[profile.provider || ''] || '#6366f1'
  const spendMidpoint = SPEND_MIDPOINTS[profile.spend || ''] || 0
  const wasteEstimate = Math.round(spendMidpoint * 0.28)
  const teamEfficiency = getTeamEfficiency(profile.teamSize || '')
  const workloadIcon = WORKLOAD_ICONS[profile.workload || ''] || '⚡'
  const recommendation = PAIN_RECOMMENDATIONS[profile.painPoint || ''] || ''

  if (showProfile && profile.provider) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 60px' }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🖥️</div>
            <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Your Cloud Profile</h1>
            <p style={{ color: '#a0a0b0', fontSize: 15 }}>
              Saved to your browser · Updates persist across sessions
            </p>
          </div>

          {/* Profile card */}
          <div style={{
            background: '#1a1a2e',
            borderRadius: 20,
            padding: 32,
            border: `2px solid ${providerColor}30`,
            marginBottom: 24,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 28,
            }}>
              <div>
                <div style={{ fontSize: 12, color: '#a0a0b0', fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>
                  CLOUD PROVIDER
                </div>
                <div style={{
                  display: 'inline-block',
                  background: `${providerColor}20`,
                  border: `1px solid ${providerColor}60`,
                  borderRadius: 10,
                  padding: '8px 20px',
                  fontSize: 20,
                  fontWeight: 800,
                  color: providerColor,
                }}>
                  {profile.provider}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#a0a0b0', fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>
                  WORKLOAD
                </div>
                <div style={{ fontSize: 28 }}>{workloadIcon}</div>
                <div style={{ fontSize: 13, color: '#e0e0e0', marginTop: 4 }}>{profile.workload}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              {/* Monthly spend */}
              <div style={{ background: '#0d0d18', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: '#a0a0b0', fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>
                  MONTHLY SPEND
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 6 }}>
                  {profile.spend}
                </div>
                {spendMidpoint > 0 && (
                  <div style={{ fontSize: 12, color: '#f59e0b' }}>
                    ≈ ${wasteEstimate.toLocaleString()} est. waste
                  </div>
                )}
              </div>

              {/* Team efficiency */}
              <div style={{ background: '#0d0d18', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: '#a0a0b0', fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>
                  TEAM SIZE
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 8 }}>
                  {profile.teamSize}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, background: '#1a1a2e', borderRadius: 4, height: 4 }}>
                    <div style={{
                      width: `${teamEfficiency}%`,
                      height: '100%',
                      background: '#22c55e',
                      borderRadius: 4,
                      transition: 'width 1s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{teamEfficiency}%</span>
                </div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>efficiency score</div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          {recommendation && (
            <div style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>
                🎯 TOP RECOMMENDATION
              </div>
              <p style={{ color: '#e0e0e0', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                {recommendation}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={updateProfile}
              style={{
                background: '#6366f1',
                border: 'none',
                borderRadius: 10,
                padding: '12px 28px',
                color: 'white',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Update Profile
            </button>
            <a
              href="/advisor"
              style={{
                background: 'transparent',
                border: '1px solid #ffffff20',
                borderRadius: 10,
                padding: '12px 28px',
                color: '#a0a0b0',
                fontSize: 14,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Get Full Recommendation →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '100px 24px 60px' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🖥️</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Build Your Cloud Twin</h1>
          <p style={{ color: '#a0a0b0', fontSize: 15 }}>
            Answer 5 quick questions to create a persistent digital profile of your cloud setup.
          </p>
        </div>

        {/* Chat history */}
        {history.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {history.map((entry, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 6 }}>
                  <div style={{
                    background: '#1a1a2e',
                    borderRadius: '18px 18px 18px 4px',
                    padding: '10px 16px',
                    fontSize: 14,
                    color: '#a0a0b0',
                    maxWidth: '80%',
                  }}>
                    {entry.question}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    background: '#6366f1',
                    borderRadius: '18px 18px 4px 18px',
                    padding: '10px 16px',
                    fontSize: 14,
                    color: 'white',
                    fontWeight: 600,
                    maxWidth: '80%',
                  }}>
                    {entry.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current question */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '18px 18px 18px 4px',
            padding: '14px 18px',
            fontSize: 16,
            color: 'white',
            fontWeight: 600,
            maxWidth: '85%',
          }}>
            {QUESTIONS[currentQ].text}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {QUESTIONS[currentQ].options.map(opt => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              style={{
                background: '#1a1a2e',
                border: '1px solid #ffffff12',
                borderRadius: 12,
                padding: '14px 20px',
                color: '#e0e0e0',
                fontSize: 14,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: 13 }}>
          <span>{currentQ + 1} of {QUESTIONS.length}</span>
          {currentQ > 0 && (
            <button
              onClick={handleBack}
              style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
