export interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
  color: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_analysis',    title: 'First Analysis',      desc: 'Ran your first cloud analysis',               icon: '🔍', color: '#6366f1' },
  { id: 'savings_hunter',    title: 'Savings Hunter',       desc: 'Identified $1,000+ in potential savings',     icon: '💰', color: '#22c55e' },
  { id: 'implementation_pro',title: 'Implementation Pro',   desc: 'Marked 3 recommendations as implemented',     icon: '⚡', color: '#f59e0b' },
  { id: 'cloud_optimizer',   title: 'Cloud Optimizer',      desc: 'Used 5 or more different tools',              icon: '🏆', color: '#a855f7' },
  { id: 'vendor_neutral',    title: 'Vendor Neutral',       desc: 'Compared 3 or more cloud providers',          icon: '🌐', color: '#0ea5e9' },
]

export function checkAchievements(stats: {
  analysisCount: number
  toolsUsed: number
  implementedCount: number
  providersCompared: number
}): string[] {
  const unlocked: string[] = []
  if (stats.analysisCount >= 1)        unlocked.push('first_analysis')
  if (stats.toolsUsed >= 5)            unlocked.push('cloud_optimizer')
  if (stats.implementedCount >= 3)     unlocked.push('implementation_pro')
  if (stats.providersCompared >= 3)    unlocked.push('vendor_neutral')
  return unlocked
}
