'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const nav = [
  { href: '/pj', label: 'Conta PJ', icon: '🏢', sub: 'Agência + Cursos' },
  { href: '/pf', label: 'Conta PF', icon: '👤', sub: 'Pessoal' },
]

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0, top: 0,
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--rose)', marginBottom: 4, fontWeight: 600 }}>
          CFO Automático
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--cream)', lineHeight: 1.3 }}>
          Sistema Financeiro
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Amanda Diniz</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', padding: '8px 12px 4px', fontWeight: 600 }}>
          Contas
        </div>
        {nav.map(item => {
          const active = path.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                background: active ? 'var(--cherry-dim)' : 'transparent',
                borderLeft: active ? '3px solid var(--cherry)' : '3px solid transparent',
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--cream)' : 'var(--muted2)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.sub}</div>
                </div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 12px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
          Squad Financeiro Pessoal<br />
          <span style={{ color: 'var(--rose)' }}>● </span>OpenSQUAD · Supabase
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '8px 12px',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--muted2)', fontSize: 12,
          cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>🚪</span> Sair
        </button>
      </div>
    </aside>
  )
}
