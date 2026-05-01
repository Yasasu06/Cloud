'use client'

const STEPS = ['Discover', 'Analyze', 'Plan', 'Optimize']

interface Props {
  currentStep: 0 | 1 | 2 | 3
}

export default function JourneyProgress({ currentStep }: Props) {
  return (
    <div style={{
      position: 'fixed',
      top: 64,
      left: 0,
      right: 0,
      zIndex: 40,
      background: 'rgba(5,5,8,0.92)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '10px 24px',
    }}>
      <div style={{ maxWidth: 440, margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
        {STEPS.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <div style={{
                width: 44,
                height: 2,
                background: i <= currentStep ? '#6366f1' : 'rgba(255,255,255,0.08)',
                margin: '4px 4px 0',
                transition: 'background 0.3s ease',
              }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i <= currentStep ? '#6366f1' : 'rgba(255,255,255,0.12)',
                boxShadow: i === currentStep ? '0 0 0 3px rgba(99,102,241,0.25)' : 'none',
                transition: 'all 0.3s ease',
              }} />
              <span style={{
                fontSize: 9,
                fontWeight: i === currentStep ? 700 : 400,
                color: i === currentStep ? '#ffffff' : i < currentStep ? '#6366f1' : 'rgba(255,255,255,0.2)',
                letterSpacing: 0.8,
                whiteSpace: 'nowrap',
              }}>
                {step.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
