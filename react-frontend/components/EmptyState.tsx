import Link from 'next/link'

interface Props {
  icon: string
  title: string
  subtitle?: string
  cta?: { label: string; href?: string; onClick?: () => void }
}

export default function EmptyState({ icon, title, subtitle, cta }: Props) {
  return (
    <div style={{
      padding: '56px 32px', textAlign: 'center',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 16,
    }}>
      <div style={{ fontSize: 56, opacity: 0.3, marginBottom: 18 }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: '0 0 6px' }}>{title}</h3>
      {subtitle && <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>{subtitle}</p>}
      {cta && (cta.href ? (
        <Link href={cta.href} style={{ display: 'inline-block', background: '#6366f1', borderRadius: 10, padding: '10px 22px', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
          {cta.label} →
        </Link>
      ) : (
        <button onClick={cta.onClick} style={{ background: '#6366f1', borderRadius: 10, padding: '10px 22px', color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
          {cta.label} →
        </button>
      ))}
    </div>
  )
}
