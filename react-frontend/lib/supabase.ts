import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  plan: 'free' | 'pro' | 'business'
  ai_queries_today: number
  created_at: string
}

export type SavedRecommendation = {
  id: string
  user_id: string
  provider: string
  confidence: number
  workload: string
  team_size: string
  budget: string
  created_at: string
}
