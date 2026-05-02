'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [advisoryAccepted, setAdvisoryAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleAuth() {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm.')
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'welcome', email }),
        }).catch(() => {})
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '120px 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>☁️</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
        </div>

        <Card className="bg-[#1a1a2e] border-[#ffffff08]">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </CardTitle>
            <CardDescription className="text-[#a0a0b0]">
              {mode === 'login'
                ? 'Sign in to access your saved recommendations'
                : 'Start making smarter cloud decisions today'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label className="text-[#a0a0b0]">Full name</Label>
                <Input
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-[#0a0a0f] border-[#ffffff15] text-white"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-[#a0a0b0]">Email address</Label>
              <Input
                type="email"
                placeholder="john@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-[#0a0a0f] border-[#ffffff15] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#a0a0b0]">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                className="bg-[#0a0a0f] border-[#ffffff15] text-white"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-3 text-green-400 text-sm">
                {success}
              </div>
            )}

            {mode === 'signup' && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={advisoryAccepted}
                  onChange={e => setAdvisoryAccepted(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#6366f1', flexShrink: 0 }}
                />
                <span style={{ fontSize: 12, color: '#a0a0b0', lineHeight: 1.5 }}>
                  I understand recommendations are advisory information, not professional advice
                </span>
              </label>
            )}

            <Button
              onClick={handleAuth}
              disabled={loading || (mode === 'signup' && !advisoryAccepted)}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold"
              style={{ opacity: mode === 'signup' && !advisoryAccepted ? 0.5 : 1 } as React.CSSProperties}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="text-center text-[#a0a0b0] text-sm">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
                className="text-[#6366f1] font-semibold hover:underline bg-transparent border-none cursor-pointer"
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>

        <p style={{ textAlign: 'center', color: '#666', fontSize: 12, marginTop: 24 }}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
