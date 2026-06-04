'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/pj')
    })
  }, [router, supabase.auth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message.includes('already registered') ? 'Este e-mail já tem conta.' : 'Erro ao criar conta.')
      } else {
        setSuccess('Conta criada! Verifique seu e-mail para confirmar, ou entre diretamente se a confirmação estiver desativada.')
        setMode('login')
      }
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
    } else {
      router.replace('/pj')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(116,30,49,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(245,203,215,0.04) 0%, transparent 70%)' }} />
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: 20, padding: '40px 44px', width: 400, maxWidth: '90vw',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--rose)', marginBottom: 8, fontWeight: 700 }}>
            CFO Automático
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cream)', letterSpacing: '-0.5px' }}>
            Sistema Financeiro
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
            Acesso restrito · Dados protegidos
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--rose)', display: 'block', marginBottom: 7 }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
              style={{
                width: '100%', padding: '11px 14px',
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 10, color: 'var(--cream)', fontSize: 14, outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--rose)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(196,144,142,0.22)')}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--rose)', display: 'block', marginBottom: 7 }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%', padding: '11px 14px',
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 10, color: 'var(--cream)', fontSize: 14, outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--rose)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(196,144,142,0.22)')}
            />
          </div>

          {error && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red-color)' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(168,255,192,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--green)' }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--cherry)', border: 'none', borderRadius: 10,
              padding: '13px', color: 'var(--cream)', fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              marginTop: 4, transition: 'opacity 0.15s',
            }}
          >
            {loading ? (mode === 'signup' ? 'Criando...' : 'Entrando...') : (mode === 'signup' ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
            style={{ background: 'none', border: 'none', color: 'var(--rose)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
            {mode === 'login' ? 'Primeiro acesso? Criar conta' : 'Já tenho conta — entrar'}
          </button>
        </div>

        <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--surface2)', borderRadius: 10, fontSize: 11, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
          🔒 Dados criptografados · Protegidos no Supabase
        </div>
      </div>
    </div>
  )
}
