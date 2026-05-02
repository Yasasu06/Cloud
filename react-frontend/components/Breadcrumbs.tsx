'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PATH_LABELS: Record<string, string> = {
  analyze:            'AI Analyze',
  'instant-audit':    'Instant Audit',
  architecture:       'Architecture',
  'bill-upload':      'Bill Upload',
  savings:            'Savings Calculator',
  'migration-cost':   'Egress Calculator',
  forecast:           'Cost Forecast',
  'multi-cloud':      'Multi-Cloud View',
  'terraform-estimator': 'Infrastructure Estimator',
  'cost-per-user':    'Cost Per User',
  'ai-cost-tracker':  'AI Costs',
  alternatives:       'All Providers',
  advisor:            'Cloud Advisor',
  'report-card':      'Report Card',
  'cloud-score':      'Cloud Score',
  'ai-advisor':       'AI Strategy',
  'roi-calculator':   'ROI Calculator',
  compliance:         'Compliance',
  'reserved-instances': 'Reserved Instances',
  'credits-tracker':  'Credits Tracker',
  'sanity-check':     'Sanity Check',
  'vendor-alerts':    'Price Alerts',
  'provider-news':    'Cloud Updates',
  benchmark:          'Industry Benchmarks',
  'cloud-glossary':   'Glossary',
  'waste-report':     'Waste Report',
  replaces:           'What We Replace',
  dashboard:          'Dashboard',
  pricing:            'Pricing',
  experts:            'Experts',
  auth:               'Sign In',
  'track-results':    'Track Results',
  'weekly-digest':    'Weekly Digest',
  changelog:          'Changelog',
  'white-label':      'White Label',
  'case-studies':     'Case Studies',
  'for-you':          'Find Your Toolkit',
  'pricing-explorer': 'Pricing Explorer',
  stats:              'Live Stats',
  terms:              'Terms',
  privacy:            'Privacy',
}

const SECTION_LABELS: Record<string, string> = {
  analyze:            'Analyze',
  'instant-audit':    'Analyze',
  architecture:       'Analyze',
  'bill-upload':      'Analyze',
  savings:            'Analyze',
  'migration-cost':   'Analyze',
  forecast:           'Analyze',
  'multi-cloud':      'Analyze',
  'terraform-estimator': 'Analyze',
  'cost-per-user':    'Analyze',
  'ai-cost-tracker':  'Analyze',
  alternatives:       'Analyze',
  advisor:            'Advise',
  'report-card':      'Advise',
  'cloud-score':      'Advise',
  'ai-advisor':       'Advise',
  'roi-calculator':   'Advise',
  compliance:         'Advise',
  'reserved-instances': 'Advise',
  'credits-tracker':  'Advise',
  'sanity-check':     'Advise',
  'vendor-alerts':    'Intelligence',
  'provider-news':    'Intelligence',
  benchmark:          'Intelligence',
  'cloud-glossary':   'Intelligence',
  'waste-report':     'Intelligence',
  replaces:           'Intelligence',
  'pricing-explorer': 'Intelligence',
  stats:              'Intelligence',
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  if (!pathname || pathname === '/') return null

  const segment = pathname.replace(/^\//, '').split('/')[0]
  const label = PATH_LABELS[segment]
  if (!label) return null

  const section = SECTION_LABELS[segment]

  return (
    <nav style={{
      maxWidth: 900, margin: '0 auto',
      padding: '12px 24px 0',
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 12, color: '#555',
    }}>
      <Link href="/" style={{ color: '#555', textDecoration: 'none', transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#a0a0b0')}
        onMouseLeave={e => (e.currentTarget.style.color = '#555')}
      >
        Home
      </Link>
      {section && (
        <>
          <span style={{ color: '#333' }}>›</span>
          <span style={{ color: '#555' }}>{section}</span>
        </>
      )}
      <span style={{ color: '#333' }}>›</span>
      <span style={{ color: '#a0a0b0', fontWeight: 600 }}>{label}</span>
    </nav>
  )
}
