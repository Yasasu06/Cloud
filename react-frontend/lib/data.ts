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

// ─────────────────────────────────────────────────────────────────────────────
// CLOUD SEGMENT REVENUE — quarterly time series
//
// Series definition (what each value means):
//   aws        = Amazon 8-K segment sales (verified).
//   gcp        = Alphabet 8-K segment-results table (verified, closed-loop
//                validated against published annual totals — FY2024 quarters
//                sum to reported FY2024 segment total).
//   azureLow,
//   azureHigh  = Modeled band. Microsoft discloses no Azure dollar figure.
//                Band is anchored to the CEO statement in Microsoft's FY2025
//                Q4 8-K ("Azure surpassed $75 billion in revenue, up 34
//                percent" for the fiscal year ended June 30, 2025),
//                calendar-normalized. Band width reflects (a) "Azure and
//                other cloud services" bundling and (b) Microsoft's 2025
//                re-scoping of what counts as Azure (AI-inference inclusion
//                plus an accounting-estimate change).
// ─────────────────────────────────────────────────────────────────────────────

export interface QuarterlyRevenuePoint {
  quarter: string
  aws: number | null        // USD billions, reported (Amazon 8-K)
  gcp: number | null        // USD billions, reported (Alphabet 8-K)
  azureLow: number | null   // USD billions, low bound of modeled Azure band
  azureHigh: number | null  // USD billions, high bound of modeled Azure band
}

// Legacy alias — kept temporarily so any stragglers importing the old name
// don't break. Remove once unused.
export type AiDataPoint = QuarterlyRevenuePoint

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

export const CLOUD_SEGMENT_REVENUE: QuarterlyRevenuePoint[] = [
  { quarter: 'Q1 2023', aws: 21.4, gcp: 7.45,  azureLow: 13.5, azureHigh: 16.5 },
  { quarter: 'Q2 2023', aws: 22.1, gcp: 8.03,  azureLow: 14.5, azureHigh: 17.5 },
  { quarter: 'Q3 2023', aws: 23.1, gcp: 8.41,  azureLow: 15.5, azureHigh: 18.5 },
  { quarter: 'Q4 2023', aws: 24.0, gcp: 9.19,  azureLow: 16.5, azureHigh: 20.0 },
  { quarter: 'Q1 2024', aws: 25.0, gcp: 9.57,  azureLow: 17.5, azureHigh: 21.5 },
  { quarter: 'Q2 2024', aws: 26.3, gcp: 10.35, azureLow: 19.0, azureHigh: 23.0 },
  { quarter: 'Q3 2024', aws: 27.5, gcp: 11.35, azureLow: 20.5, azureHigh: 25.0 },
  { quarter: 'Q4 2024', aws: 28.8, gcp: 11.96, azureLow: 22.0, azureHigh: 27.0 },
  { quarter: 'Q1 2025', aws: 29.3, gcp: 12.26, azureLow: 24.0, azureHigh: 29.0 },
  { quarter: 'Q2 2025', aws: 30.9, gcp: 13.62, azureLow: 26.0, azureHigh: 31.5 },
  { quarter: 'Q3 2025', aws: 33.0, gcp: 15.16, azureLow: 28.5, azureHigh: 34.5 },
  { quarter: 'Q4 2025', aws: 35.6, gcp: 17.70, azureLow: 30.0, azureHigh: 36.5 },
]

// Legacy alias — kept temporarily so AiGrowthChart-style callers don't break.
// Prefer CLOUD_SEGMENT_REVENUE in new code.
export const AI_GROWTH_DATA = CLOUD_SEGMENT_REVENUE

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

export interface JargonTerm {
  term: string
  explanation: string
}

export const JARGON_TERMS: JargonTerm[] = [
  { term: 'EC2', explanation: 'Elastic Compute Cloud - Amazon\'s virtual server service for running applications in the cloud.' },
  { term: 'S3', explanation: 'Simple Storage Service - Amazon\'s object storage service for storing and retrieving any amount of data.' },
  { term: 'RDS', explanation: 'Relational Database Service - Amazon\'s managed database service supporting multiple database engines.' },
  { term: 'Lambda', explanation: 'Serverless compute service that runs code in response to events without managing servers.' },
  { term: 'EBS', explanation: 'Elastic Block Store - Persistent block storage volumes for EC2 instances.' },
  { term: 'VPC', explanation: 'Virtual Private Cloud - Isolated network environment in the cloud.' },
  { term: 'IAM', explanation: 'Identity and Access Management - Service for controlling access to AWS resources.' },
  { term: 'CloudFormation', explanation: 'Infrastructure as Code service for provisioning AWS resources.' },
  { term: 'Azure VM', explanation: 'Azure Virtual Machines - Microsoft\'s service for running virtual servers in the cloud.' },
  { term: 'Blob Storage', explanation: 'Azure\'s object storage service for unstructured data.' },
  { term: 'Azure SQL Database', explanation: 'Microsoft\'s managed relational database service.' },
  { term: 'Functions', explanation: 'Azure\'s serverless compute service for event-driven code execution.' },
  { term: 'GCP Compute Engine', explanation: 'Google Cloud\'s virtual machine service.' },
  { term: 'Cloud Storage', explanation: 'Google\'s object storage service.' },
  { term: 'BigQuery', explanation: 'Google\'s fully-managed, serverless data warehouse.' },
  { term: 'Cloud Functions', explanation: 'Google\'s serverless execution environment for building and connecting cloud services.' },
  { term: 'Kubernetes', explanation: 'Open-source container orchestration platform for automating deployment, scaling, and management of containerized applications.' },
  { term: 'Docker', explanation: 'Platform for developing, shipping, and running applications in containers.' },
  { term: 'Serverless', explanation: 'Cloud computing model where the cloud provider manages the infrastructure, allowing developers to focus on code.' },
  { term: 'Microservices', explanation: 'Architectural style that structures an application as a collection of small, independent services.' },
  { term: 'CDN', explanation: 'Content Delivery Network - Distributed network of servers that deliver web content to users based on their geographic location.' },
  { term: 'DDoS', explanation: 'Distributed Denial of Service - Cyber attack that attempts to make a service unavailable by overwhelming it with traffic.' },
  { term: 'HIPAA', explanation: 'Health Insurance Portability and Accountability Act - US law that protects patient health information.' },
  { term: 'GDPR', explanation: 'General Data Protection Regulation - EU regulation on data protection and privacy.' },
  { term: 'SOC 2', explanation: 'System and Organization Controls 2 - Framework for managing data security and privacy.' },
  { term: 'ISO 27001', explanation: 'International standard for information security management systems.' },
]
