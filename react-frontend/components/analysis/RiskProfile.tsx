export interface RiskProfileData {
  reversibility: 'easy' | 'medium' | 'hard'
  blast_radius: 'low' | 'medium' | 'high'
  time_to_implement: 'minutes' | 'hours' | 'days' | 'weeks'
  risk_level: 'low' | 'medium' | 'high'
  recommended_approach: 'Just do it' | 'Test first' | 'Phase rollout' | 'Get expert review'
  rationale: string
}

const REVERSIBILITY_COLOR = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }
const BLAST_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
const RISK_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
const TIME_ICON = { minutes: '⚡', hours: '⏱', days: '📅', weeks: '🗓' }
const APPROACH_COLOR: Record<RiskProfileData['recommended_approach'], string> = {
  'Just do it': '#22c55e',
  'Test first': '#818cf8',
  'Phase rollout': '#f59e0b',
  'Get expert review': '#ef4444',
}

function Pill({ label, value, color, icon }: { label: string; value: string; color: string; icon?: string }) {
  return (
    <div style={{
      flex: '1 1 140px', minWidth: 140,
      padding: '14px 16px', borderRadius: 12,
      background: `${color}10`,
      border: `1px solid ${color}30`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#666', letterSpacing: 1.5, marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color, textTransform: 'capitalize' }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}{value}
      </div>
    </div>
  )
}

export default function RiskProfile({ data }: { data: RiskProfileData }) {
  const approachColor = APPROACH_COLOR[data.recommended_approach] ?? '#818cf8'
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, padding: '22px 24px', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: 2 }}>🎯 DECISION RISK PROFILE</span>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <Pill label="Reversibility" value={data.reversibility} color={REVERSIBILITY_COLOR[data.reversibility]} />
        <Pill label="Blast Radius" value={data.blast_radius} color={BLAST_COLOR[data.blast_radius]} />
        <Pill label="Time" value={data.time_to_implement} color="#818cf8" icon={TIME_ICON[data.time_to_implement]} />
        <Pill label="Risk Level" value={data.risk_level} color={RISK_COLOR[data.risk_level]} />
      </div>

      <div style={{
        padding: '16px 20px', borderRadius: 12,
        background: `${approachColor}08`,
        border: `1px solid ${approachColor}25`,
        borderLeft: `3px solid ${approachColor}`,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: approachColor, letterSpacing: 1.5, marginBottom: 6 }}>
          RECOMMENDED APPROACH
        </div>
        <div style={{ fontSize: 19, fontWeight: 800, color: 'white', marginBottom: 8 }}>
          {data.recommended_approach}
        </div>
        <p style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.6, margin: 0 }}>
          {data.rationale}
        </p>
      </div>
    </div>
  )
}
