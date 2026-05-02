export interface AnalysisSummary {
  headline: string
  verdict_type: 'savings_opportunity' | 'well_optimized' | 'needs_review'
  confidence: 'high' | 'medium' | 'low'
  monthly_spend?: number
  estimated_waste_pct?: number
  estimated_waste_amount?: number
}

export interface KeyMetric {
  label: string
  value: string
  trend?: 'positive' | 'concerning' | 'stable'
}

export interface CostBreakdownItem {
  service: string
  amount: number
  percent?: number
  waste_estimate?: number
  color?: string
}

export interface Recommendation {
  id: number | string
  title: string
  icon?: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  savings_amount?: number
  savings_text?: string
  explanation?: string
  plain_english?: string
  steps?: string[]
  risk_level?: 'high' | 'medium' | 'low'
  implementation_time?: string
}

export interface AlternativeProvider {
  name: string
  logo?: string
  monthly_cost_estimate?: number
  why?: string
  savings_vs_current?: number
  recommended_for?: string
}

export interface QuickWin {
  title: string
  savings: string
  time: string
}

export interface AnalysisResult {
  summary: AnalysisSummary
  key_metrics: KeyMetric[]
  cost_breakdown?: CostBreakdownItem[]
  recommendations: Recommendation[]
  alternative_providers?: AlternativeProvider[]
  quick_wins?: QuickWin[]
}
