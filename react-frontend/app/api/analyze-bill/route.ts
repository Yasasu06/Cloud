import { NextRequest, NextResponse } from 'next/server'
import { rateLimited, readJsonBody } from '@/lib/serverGuard'

export const dynamic = 'force-dynamic'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const SYSTEM_PROMPT = 'You are a FinOps expert. Analyze cloud bills in plain English for non-technical founders. Explain that suggested cuts and savings are hypotheses requiring resource and utilization checks.'

export async function POST(req: NextRequest) {
  if (rateLimited(req, 'analyze-bill', 8)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Bill analysis is not configured.' }, { status: 503 })
  let input: unknown
  try { input = await readJsonBody(req, 16_000) }
  catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }) }
  const content = input && typeof input === 'object' && 'content' in input ? input.content : null
  if (typeof content !== 'string' || !content.trim() || content.length > 12_000) {
    return NextResponse.json({ error: 'Provide bill text under 12,000 characters.' }, { status: 400 })
  }
  try {
    const upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', max_tokens: 1500, stream: true,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content }],
      }),
    })
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: 'The analysis service returned an error.' }, { status: 502 })
    }
    return new Response(upstream.body, {
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json({ error: 'Could not reach the analysis service.' }, { status: 502 })
  }
}
