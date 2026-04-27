'use client'

import { useState } from 'react'

const buildOptions = [
  { icon: '🌐', label: 'A website or web app' },
  { icon: '📱', label: 'A mobile app backend' },
  { icon: '🤖', label: 'An AI or ML project' },
  { icon: '🎮', label: 'A game server' },
  { icon: '💾', label: 'Just file storage' },
  { icon: '🏢', label: 'Moving my business to cloud' },
]

const teamOptions = [
  'Just me',
  'Small team (2–10)',
  'Growing startup (10–50)',
  'Established business (50+)',
]

const budgetOptions = [
  '$0 — free only',
  'Under $50/month',
  '$50–$500/month',
  '$500–$5,000/month',
  '$5,000+/month',
]

interface Rec {
  provider: string
  color: string
  reason: string
  second: string
}

function getRecommendation(build: string, team: string, budget: string): Rec {
  if (build.includes('AI')) return {
    provider: 'Google Cloud (GCP)',
    color: '#34A853',
    reason: 'GCP leads in AI/ML with Vertex AI and TPUs',
    second: 'Azure — strong with OpenAI integration',
  }
  if (build.includes('game')) return {
    provider: 'Vultr or DigitalOcean',
    color: '#0080FF',
    reason: 'Best price-to-performance for game servers globally',
    second: 'AWS — if you need more scale',
  }
  if (budget.includes('$0') && build.includes('storage')) return {
    provider: 'Oracle Cloud',
    color: '#F80000',
    reason: 'Most generous always-free tier — 4 ARM cores + 24GB RAM free forever',
    second: 'GCP — also has a strong free tier',
  }
  if (budget.includes('$0') || budget.includes('Under $50')) return {
    provider: 'DigitalOcean',
    color: '#0080FF',
    reason: 'Simplest and most affordable for individuals and small projects',
    second: 'Linode — similar price, good alternative',
  }
  if (team.includes('50+')) return {
    provider: 'Microsoft Azure',
    color: '#0078D4',
    reason: 'Best for enterprise — deep Microsoft ecosystem integration',
    second: 'AWS — broadest service catalog',
  }
  return {
    provider: 'Amazon Web Services',
    color: '#FF9900',
    reason: 'Most mature platform with the broadest set of services',
    second: 'Azure — great if you use Microsoft tools',
  }
}

const backBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #ffffff30',
  borderRadius: 8,
  padding: '10px 20px',
  color: '#a0a0b0',
  cursor: 'pointer',
  fontSize: 14,
  marginBottom: 24,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: 'fit-content',
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#a0a0b0', fontSize: 13 }}>Step {step} of 3</span>
        <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
          {Math.round((step / 3) * 100)}% complete
        </span>
      </div>
      <div style={{ background: '#1a1a2e', borderRadius: 4, height: 6 }}>
        <div style={{
          background: '#22c55e',
          height: '100%',
          borderRadius: 4,
          width: `${(step / 3) * 100}%`,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}

export default function StartPage() {
  const [step, setStep] = useState(0)
  const [build, setBuild] = useState('')
  const [team, setTeam] = useState('')
  const [budget, setBudget] = useState('')

  const rec = step === 4 ? getRecommendation(build, team, budget) : null

  function startOver() {
    setStep(0)
    setBuild('')
    setTeam('')
    setBudget('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', position: 'relative' }}>
      {step > 0 && step < 4 && (
        <button onClick={startOver} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: 13, textDecoration: 'underline', position: 'absolute', top: 110, right: 24 }}>
          Start Over
        </button>
      )}

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 24px 60px' }}>

        {/* Step 0 — Landing */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>☁️</div>
            <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
              Never Used Cloud Before?
            </h1>
            <p style={{ color: '#a0a0b0', fontSize: 18, marginBottom: 40 }}>
              Answer 3 quick questions and we&apos;ll tell you exactly where to start —
              no jargon, no confusion.
            </p>
            <button
              onClick={() => setStep(1)}
              style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 12, padding: '16px 40px', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
            >
              Start My Cloud Journey →
            </button>
          </div>
        )}

        {/* Step 1 — What to build */}
        {step === 1 && (
          <div>
            <button onClick={() => setStep(s => s - 1)} style={backBtnStyle}>← Back</button>
            <ProgressBar step={step} />
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              What are you trying to build?
            </h2>
            <p style={{ color: '#a0a0b0', marginBottom: 32 }}>
              Pick the one that best describes your project.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {buildOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => { setBuild(opt.label); setStep(2) }}
                  style={{
                    background: build === opt.label ? '#1e3a5f' : '#1a1a2e',
                    border: `2px solid ${build === opt.label ? '#0078D4' : '#ffffff15'}`,
                    borderRadius: 12,
                    padding: '20px 16px',
                    cursor: 'pointer',
                    color: 'white',
                    textAlign: 'left',
                    fontSize: 16,
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{opt.icon}</div>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Team size */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(s => s - 1)} style={backBtnStyle}>← Back</button>
            <ProgressBar step={step} />
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              How big is your team?
            </h2>
            <p style={{ color: '#a0a0b0', marginBottom: 32 }}>
              This helps us match you to the right scale of platform.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {teamOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setTeam(opt); setStep(3) }}
                  style={{ background: '#1a1a2e', border: '2px solid #ffffff15', borderRadius: 12, padding: '18px 24px', cursor: 'pointer', color: 'white', textAlign: 'left', fontSize: 16 }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Budget */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(s => s - 1)} style={backBtnStyle}>← Back</button>
            <ProgressBar step={step} />
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              What&apos;s your monthly cloud budget?
            </h2>
            <p style={{ color: '#a0a0b0', marginBottom: 32 }}>
              Be honest — there are great options at every price point.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {budgetOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setBudget(opt); setStep(4) }}
                  style={{ background: '#1a1a2e', border: '2px solid #ffffff15', borderRadius: 12, padding: '18px 24px', cursor: 'pointer', color: 'white', textAlign: 'left', fontSize: 16 }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Results */}
        {step === 4 && rec && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Your Perfect Match</h2>
            <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 32, borderLeft: `6px solid ${rec.color}`, marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#a0a0b0', marginBottom: 8 }}>RECOMMENDED PROVIDER</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: rec.color, marginBottom: 12 }}>{rec.provider}</div>
              <p style={{ color: '#e0e0e0', fontSize: 16 }}>{rec.reason}</p>
            </div>
            <div style={{ background: '#12121a', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#a0a0b0', marginBottom: 8 }}>RUNNER UP</div>
              <p style={{ color: '#e0e0e0' }}>{rec.second}</p>
            </div>
            <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 20, marginBottom: 32 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Your answers:</div>
              <p style={{ color: '#a0a0b0', fontSize: 14 }}>Building: {build}</p>
              <p style={{ color: '#a0a0b0', fontSize: 14 }}>Team: {team}</p>
              <p style={{ color: '#a0a0b0', fontSize: 14 }}>Budget: {budget}</p>
            </div>
            <button
              onClick={startOver}
              style={{ background: 'transparent', border: '2px solid #ffffff30', borderRadius: 12, padding: '14px 32px', color: 'white', cursor: 'pointer', fontSize: 16 }}
            >
              ← Start Over
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
