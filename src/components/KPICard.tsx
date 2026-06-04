'use client'

interface KPICardProps {
  label: string
  value: string
  sub?: string
  status?: 'green' | 'yellow' | 'red' | 'neutral'
  icon?: string
}

const statusColors = {
  green: { bg: 'var(--green-dim)', border: 'rgba(168,255,192,0.2)', label: 'var(--green)' },
  yellow: { bg: 'var(--yellow-dim)', border: 'rgba(255,232,115,0.2)', label: 'var(--yellow)' },
  red: { bg: 'var(--red-dim)', border: 'rgba(255,107,107,0.2)', label: 'var(--red-color)' },
  neutral: { bg: 'var(--surface2)', border: 'var(--border)', label: 'var(--rose)' },
}

export default function KPICard({ label, value, sub, status = 'neutral', icon }: KPICardProps) {
  const colors = statusColors[status]
  return (
    <div style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: colors.label, fontWeight: 600 }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.5px' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>
      )}
    </div>
  )
}
