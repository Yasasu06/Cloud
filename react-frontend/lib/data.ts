export interface Provider {
  name: string
  key: 'aws' | 'azure' | 'gcp'
  color: string
  marketShare: number
  revenue: string
  growth: string
  tag: string
  description: string
}

export interface AiDataPoint {
  quarter: string
  azure: number
  aws: number
  gcp: number
}

export interface MarketMetric {
  label: string
  value: number
  suffix: string
  prefix?: string
  description: string
  color: string
}

export const PROVIDERS: Provider[] = [
  {
    name: 'Amazon Web Services',
    key: 'aws',
    color: '#FF9900',
    marketShare: 30,
    revenue: '$28.8B',
    growth: '18.9% YoY',
    tag: 'Broadest Service Catalog',
    description: 'The undisputed market leader with 200+ cloud services. Dominant in startups, enterprises, and government workloads globally.',
  },
  {
    name: 'Microsoft Azure',
    key: 'azure',
    color: '#0078D4',
    marketShare: 23,
    revenue: '$40.9B',
    growth: '31% YoY',
    tag: 'Fastest Enterprise Growth',
    description: 'Fastest-growing hyperscaler fueled by Microsoft 365 integration, Copilot AI, and deep enterprise relationships worldwide.',
  },
  {
    name: 'Google Cloud Platform',
    key: 'gcp',
    color: '#34A853',
    marketShare: 12,
    revenue: '$11.4B',
    growth: '30% YoY',
    tag: 'AI/ML Leader',
    description: 'The AI-native cloud. Leading in Gemini, TPU infrastructure, BigQuery analytics, and open-source Kubernetes innovation.',
  },
]

export const MARKET_METRICS: MarketMetric[] = [
  {
    label: 'Cloud Market Size',
    value: 855,
    suffix: 'B',
    prefix: '$',
    description: 'Global 2025 estimate',
    color: '#6366f1',
  },
  {
    label: 'Market CAGR',
    value: 19,
    suffix: '%',
    description: '2025–2030 forecast',
    color: '#FF9900',
  },
  {
    label: 'AI Cloud Growth',
    value: 47,
    suffix: '%',
    description: 'Year-over-year',
    color: '#0078D4',
  },
  {
    label: 'Multi-cloud Adoption',
    value: 89,
    suffix: '%',
    description: 'Of enterprises in 2025',
    color: '#34A853',
  },
]

export const AI_GROWTH_DATA: AiDataPoint[] = [
  { quarter: 'Q1 2023', azure: 1.2, aws: 2.1, gcp: 0.8 },
  { quarter: 'Q2 2023', azure: 1.8, aws: 2.4, gcp: 1.0 },
  { quarter: 'Q3 2023', azure: 2.4, aws: 2.8, gcp: 1.3 },
  { quarter: 'Q4 2023', azure: 3.1, aws: 3.2, gcp: 1.6 },
  { quarter: 'Q1 2024', azure: 4.2, aws: 3.8, gcp: 2.0 },
  { quarter: 'Q2 2024', azure: 5.6, aws: 4.4, gcp: 2.5 },
  { quarter: 'Q3 2024', azure: 7.1, aws: 5.1, gcp: 3.1 },
  { quarter: 'Q4 2024', azure: 8.9, aws: 5.9, gcp: 3.8 },
  { quarter: 'Q1 2025', azure: 10.8, aws: 6.8, gcp: 4.6 },
  { quarter: 'Q2 2025', azure: 12.9, aws: 7.8, gcp: 5.5 },
  { quarter: 'Q3 2025', azure: 15.2, aws: 8.9, gcp: 6.5 },
  { quarter: 'Q4 2025', azure: 17.8, aws: 10.1, gcp: 7.6 },
]

export interface AlternativeProvider {
  name: string
  color: string
  logo: string
  tagline: string
  monthlyStarting: string
  strengths: string[]
  weaknesses: string[]
  bestFor: string[]
  freetier: string
  regions: number
  certifications: string[]
  website: string
}

export const ALTERNATIVE_PROVIDERS: AlternativeProvider[] = [
  {
    name: 'DigitalOcean',
    color: '#0080FF',
    logo: '🌊',
    tagline: 'Best for developers and small startups',
    monthlyStarting: '$4',
    strengths: ['Simplest UI in the industry', 'Predictable flat pricing', 'Excellent documentation', '1-click app deployments'],
    weaknesses: ['Limited enterprise features', 'Smaller global region count', 'No AI/ML services'],
    bestFor: ['Solo developers', 'Small web apps', 'Startups under 10 people', 'Static sites and APIs'],
    freetier: '$200 credit for 60 days',
    regions: 8,
    certifications: ['SOC 2', 'ISO 27001'],
    website: 'https://digitalocean.com',
  },
  {
    name: 'Oracle Cloud',
    color: '#F80000',
    logo: '🔴',
    tagline: 'Most generous free tier in the industry',
    monthlyStarting: '$0',
    strengths: ['Always-free tier is unmatched', 'Best for Oracle database workloads', 'Strong enterprise contracts', 'Good AI infrastructure'],
    weaknesses: ['Complex pricing', 'Smaller community', 'Less third-party integrations'],
    bestFor: ['Oracle database users', 'Budget-conscious startups', 'Enterprise with Oracle licenses', 'Testing and development'],
    freetier: 'Always free — 2 AMD VMs, 4 ARM cores, 24GB RAM forever',
    regions: 41,
    certifications: ['SOC 1/2', 'ISO 27001', 'FedRAMP', 'HIPAA'],
    website: 'https://oracle.com/cloud',
  },
  {
    name: 'Linode (Akamai)',
    color: '#02B159',
    logo: '🟢',
    tagline: 'Developer-first cloud at fair prices',
    monthlyStarting: '$5',
    strengths: ['Transparent pricing', 'Strong Linux community', 'Good performance per dollar', 'Simple API'],
    weaknesses: ['Limited managed services', 'No serverless options', 'Smaller ecosystem'],
    bestFor: ['Linux developers', 'VPS hosting', 'Game servers', 'Small to mid web apps'],
    freetier: '$100 credit for 60 days',
    regions: 11,
    certifications: ['SOC 2', 'ISO 27001', 'PCI DSS'],
    website: 'https://linode.com',
  },
  {
    name: 'Vultr',
    color: '#007BFC',
    logo: '⚡',
    tagline: 'High performance at the lowest cost',
    monthlyStarting: '$2.50',
    strengths: ['Cheapest entry price', '17 global locations', 'Bare metal options', 'Simple hourly billing'],
    weaknesses: ['Basic managed services', 'Limited compliance certs', 'No enterprise support tier'],
    bestFor: ['Gaming servers', 'Personal projects', 'Budget hosting', 'Global CDN needs'],
    freetier: '$250 credit for 30 days',
    regions: 17,
    certifications: ['SOC 2'],
    website: 'https://vultr.com',
  },
  {
    name: 'Cloudflare',
    color: '#F38020',
    logo: '🌐',
    tagline: 'Edge computing and security leader',
    monthlyStarting: '$0',
    strengths: ['Best-in-class CDN and DDoS protection', 'Workers edge computing is revolutionary', 'Generous free tier', 'Fastest global network'],
    weaknesses: ['Not a full cloud provider', 'No VMs or traditional compute', 'Limited to edge use cases'],
    bestFor: ['Web performance optimization', 'Edge functions', 'DNS and security', 'Serverless at the edge'],
    freetier: 'Generous free tier — Workers, Pages, DNS all free',
    regions: 285,
    certifications: ['SOC 2', 'ISO 27001', 'PCI DSS', 'HIPAA'],
    website: 'https://cloudflare.com',
  },
  {
    name: 'Hetzner',
    color: '#D50C2D',
    logo: '🇩🇪',
    tagline: "Europe's best value cloud",
    monthlyStarting: '$3.29',
    strengths: ['Cheapest European option', 'GDPR compliant by default', 'Excellent hardware specs', 'Green energy powered'],
    weaknesses: ['Europe and US only', 'Limited managed services', 'Smaller ecosystem'],
    bestFor: ['European startups', 'GDPR-sensitive workloads', 'Budget European hosting', 'Environmentally conscious teams'],
    freetier: 'No free tier but cheapest paid option in Europe',
    regions: 5,
    certifications: ['ISO 27001', 'SOC 2', 'GDPR'],
    website: 'https://hetzner.com',
  },
]

export const WHY_FEATURES = [
  {
    icon: 'Shield',
    title: 'Independent Analysis',
    description: 'Not sponsored or affiliated with any cloud provider. Our analysis is objective, data-driven, and built for decision-makers who need the truth.',
  },
  {
    icon: 'TrendingUp',
    title: 'Real Financial Data',
    description: 'All revenue figures, growth rates, and market share data sourced directly from SEC filings, earnings calls, and official investor relations.',
  },
  {
    icon: 'RefreshCw',
    title: 'Always Current',
    description: 'Platform data is updated every quarter following earnings season. You are always working with the most recent publicly available information.',
  },
]
