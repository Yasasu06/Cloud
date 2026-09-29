import Link from 'next/link'

interface Props { embedded?: boolean }

const TOOLS = [
  { label: 'Service-level cost questions', href: '/bill-upload' },
  { label: 'Selected compute price comparisons', href: '/pricing-explorer' },
  { label: 'Architecture suggestions', href: '/architecture' },
  { label: 'Migration planning scenarios', href: '/migrate' },
]

export default function ReplacesTool({ embedded = false }: Props) {
  const content = (
    <div style={{ maxWidth: 720, margin: '0 auto', color: 'white' }}>
      <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>TOOL DIRECTORY</p>
      <h2 style={{ fontSize: 32, margin: '16px 0' }}>Explore specific cloud decisions</h2>
      <p style={{ color: '#a0a0b0', lineHeight: 1.7 }}>
        These tools organize inputs and suggest next steps. They do not replace cloud engineers,
        consultants, security reviewers, or independent verification of savings.
      </p>
      <ul style={{ display: 'grid', gap: 14, padding: 0, listStyle: 'none' }}>
        {TOOLS.map(tool => <li key={tool.href} className="glass-card" style={{ padding: 20 }}>
          <Link href={tool.href} style={{ color: '#818cf8', fontWeight: 700 }}>{tool.label} →</Link>
        </li>)}
      </ul>
    </div>
  )
  return embedded ? content : <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '100px 24px' }}>{content}</div>
}
