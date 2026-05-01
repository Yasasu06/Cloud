'use client'

export default function LiveTicker() {
  const items = [
    { label: 'Cloud Market 2026', value: '$855B' },
    { label: 'Azure YoY Growth', value: '31%' },
    { label: 'AWS Market Share', value: '30%' },
    { label: 'AI Cloud Growth', value: '47% YoY' },
    { label: 'GCP Revenue Q4 2025', value: '$11.4B' },
    { label: 'Multi-cloud Adoption', value: '89%' },
    { label: 'Azure Revenue Q4 2025', value: '$40.9B' },
    { label: 'Market CAGR through 2029', value: '19%' },
    { label: 'AWS Revenue Q4 2025', value: '$28.8B' },
    { label: 'Cloud Jobs Growth', value: '+34% YoY' },
  ]

  const doubled = [...items, ...items]

  return (
    <div className="ticker-wrap">
      <div className="ticker-content">
        {doubled.map((item, i) => (
          <div key={i} className="ticker-item">
            <span>{item.value}</span>
            {item.label}
            <span style={{ marginLeft: 48, color: '#ffffff20' }}>•</span>
          </div>
        ))}
      </div>
    </div>
  )
}
