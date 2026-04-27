'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
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
          options: {
            data: { full_name: name },
          },
        })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: '#1a1a2e',
    border: '1px solid #ffffff15',
    borderRadius: 8,
    padding: '12px 16px',
    color: 'white',
    fontSize: 15,
    outline: 'none',
    marginBottom: 16,
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '120px 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>☁️</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ color: '#a0a0b0' }}>
            {mode === 'login'
              ? 'Sign in to access your saved recommendations'
              : 'Start making smarter cloud decisions today'}
          </p>
        </div>

        <div style={{
          background: '#1a1a2e',
          borderRadius: 16,
          padding: 32,
          border: '1px solid #ffffff08',
        }}>
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            style={inputStyle}
          />

          {error && (
            <div style={{
              background: '#ef444420',
              border: '1px solid #ef4444',
              borderRadius: 8,
              padding: '12px 16px',
              color: '#ef4444',
              fontSize: 14,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#22c55e20',
              border: '1px solid #22c55e',
              borderRadius: 8,
              padding: '12px 16px',
              color: '#22c55e',
              fontSize: 14,
              marginBottom: 16,
            }}>
              {success}
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            style={{
              width: '100%',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '14px',
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: 16,
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center', color: '#a0a0b0', fontSize: 14 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              style={{
                background: 'none',
                border: 'none',
                color: '#6366f1',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#666', fontSize: 12, marginTop: 24 }}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
