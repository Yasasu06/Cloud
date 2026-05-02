import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://cloud-psx9.vercel.app'

interface SavedRec {
  id: string
  user_id: string
  provider: string
  workload: string
  created_at: string
  raw_analysis?: string
}

interface ProfileRow {
  id: string
  email: string | null
  full_name: string | null
  weekly_digest_enabled: boolean | null
}

export async function POST(request: Request) {
  // Auth: require either user-self or admin token
  const url = new URL(request.url)
  const adminToken = url.searchParams.get('admin_token')
  const userIdParam = url.searchParams.get('user_id')

  const isAdmin = adminToken && adminToken === process.env.DIGEST_ADMIN_TOKEN
  if (!isAdmin && !userIdParam) {
    return NextResponse.json({ error: 'admin_token or user_id required' }, { status: 401 })
  }

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supaUrl || !serviceKey) {
    return NextResponse.json({ error: 'Supabase env vars not configured' }, { status: 500 })
  }
  const supabase = createClient(supaUrl, serviceKey)

  // Pick recipients: a single user (self-trigger) or all users with digest enabled (admin trigger)
  const profileQuery = supabase.from('profiles').select('id, email, full_name, weekly_digest_enabled')
  const { data: profiles, error: profErr } = isAdmin
    ? await profileQuery.eq('weekly_digest_enabled', true)
    : await profileQuery.eq('id', userIdParam!).limit(1)

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 })
  if (!profiles?.length) return NextResponse.json({ sent: 0, message: 'No recipients' })

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 })
  }

  let sent = 0
  const failures: Array<{ user_id: string; reason: string }> = []

  for (const p of profiles as ProfileRow[]) {
    if (!p.email) continue

    // Pull last 3 saved analyses
    const { data: recs } = await supabase
      .from('saved_recommendations')
      .select('*')
      .eq('user_id', p.id)
      .order('created_at', { ascending: false })
      .limit(3)

    const recsArr = (recs as SavedRec[] | null) ?? []
    if (recsArr.length === 0) continue  // skip users with no analyses yet

    const html = buildDigestHtml(p.full_name ?? null, recsArr)

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: 'Cloud Intelligence <digest@cloudintelligence.app>',
          to: p.email,
          subject: 'Your Cloud Intelligence Weekly Digest',
          html,
        }),
      })
      if (res.ok) sent++
      else failures.push({ user_id: p.id, reason: `Resend ${res.status}` })
    } catch (e) {
      failures.push({ user_id: p.id, reason: e instanceof Error ? e.message : 'unknown' })
    }
  }

  return NextResponse.json({ sent, failures, total_eligible: profiles.length })
}

function buildDigestHtml(name: string | null, recs: SavedRec[]): string {
  const recList = recs.map(r => `
    <li style="padding:12px 0;border-bottom:1px solid #eee">
      <strong style="color:#1a1a2e">${escapeHtml(r.provider)}</strong>
      <span style="color:#888;font-size:13px"> · ${escapeHtml(r.workload)}</span>
      <div style="font-size:12px;color:#999;margin-top:4px">${new Date(r.created_at).toLocaleDateString()}</div>
    </li>
  `).join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#6366f1;padding:24px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:24px">☁️ Cloud Intelligence</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Your Weekly Digest</p>
      </div>
      <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px">
        <h2 style="color:#1a1a2e;margin-top:0">Hi ${escapeHtml(name || 'there')},</h2>
        <p style="color:#444;line-height:1.6">Here's a quick recap of your recent cloud analyses:</p>

        <h3 style="color:#1a1a2e;margin-top:24px">Recent analyses</h3>
        <ul style="list-style:none;padding:0;margin:0">${recList}</ul>

        <h3 style="color:#1a1a2e;margin-top:32px">Pricing changes worth reviewing</h3>
        <p style="color:#666;font-size:13px;line-height:1.6">
          Hetzner reduced ARM instance pricing by ~8%. AWS Reserved Instance rates updated for c6i family.
          Visit <a href="${BASE_URL}/pricing-explorer" style="color:#6366f1">Pricing Explorer</a> for live comparisons.
        </p>

        <h3 style="color:#1a1a2e;margin-top:32px">Try next</h3>
        <p style="color:#666;font-size:13px">
          Based on your activity: <a href="${BASE_URL}/sanity-check" style="color:#6366f1">Sanity Check</a> before your next migration.
        </p>

        <div style="text-align:center;margin-top:32px">
          <a href="${BASE_URL}/dashboard" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">
            Open Dashboard →
          </a>
        </div>

        <p style="color:#999;font-size:11px;text-align:center;margin-top:32px">
          Don't want these emails? Toggle digest off in your <a href="${BASE_URL}/dashboard" style="color:#999">dashboard settings</a>.
        </p>
      </div>
    </div>
  `
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c))
}
