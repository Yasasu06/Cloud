import { NextRequest, NextResponse } from 'next/server'
import { rateLimited, readJsonBody } from '@/lib/serverGuard'

export const dynamic = 'force-dynamic'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export async function POST(req: NextRequest) {
  if (rateLimited(req, 'groq', 12)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI service is not configured.' }, { status: 503 })

  let input: unknown
  try { input = await readJsonBody(req, 32_000) }
  catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }) }
  if (!input || typeof input !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  const body = input as Record<string, unknown>
  const messages = body.messages
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 12 ||
      !messages.every(m => m && typeof m === 'object' &&
        ['system', 'user', 'assistant'].includes(m.role) &&
        typeof m.content === 'string' && m.content.length > 0 && m.content.length <= 16_000) ||
      !messages.some(m => m.role === 'user')) {
    return NextResponse.json({ error: 'Invalid messages.' }, { status: 400 })
  }
  if (body.model !== undefined && body.model !== MODEL) {
    return NextResponse.json({ error: 'Unsupported model.' }, { status: 400 })
  }
  const maxTokens = typeof body.max_tokens === 'number' && Number.isInteger(body.max_tokens)
    ? Math.min(Math.max(body.max_tokens, 1), 4000) : 1500
  const payload = {
    model: MODEL,
    messages,
    max_tokens: maxTokens,
    stream: body.stream === true,
    ...(body.response_format && typeof body.response_format === 'object' &&
      (body.response_format as { type?: unknown }).type === 'json_object'
      ? { response_format: { type: 'json_object' } } : {}),
  }
  try {
    const upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
    })
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json({ error: 'Could not reach the AI service.' }, { status: 502 })
  }
}
