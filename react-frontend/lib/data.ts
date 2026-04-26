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
