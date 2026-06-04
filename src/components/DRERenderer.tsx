'use client'

interface Props {
  markdown: string
  title?: string
}

function parseBRL(s: string): number {
  const isNeg = s.includes('(')
  const n = parseFloat(s.replace(/\*/g, '').replace(/[()R$\s]/g, '').replace(/\./g, '').replace(',', '.'))
  return isNaN(n) ? NaN : isNeg ? -Math.abs(n) : n
}

function formatBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

function fmtCell(raw: string): { text: string; value: number | null; isBold: boolean; isNeg: boolean } {
  const isBold = raw.includes('**')
  const clean = raw.replace(/\*\*/g, '').replace(/\*/g, '').replace(/&nbsp;/g, '').trim()
  const isNeg = clean.startsWith('(') || clean.startsWith('-')
  const numVal = parseBRL(clean)
  const value = /[\d,]/.test(clean) && !isNaN(numVal) ? numVal : null
  const text = value !== null ? formatBRL(numVal) : clean
  return { text, value, isBold, isNeg }
}

function isSeparator(line: string) {
  return /^\|[-| ]+\|$/.test(line.trim())
}

function isTableRow(line: string) {
  return line.trim().startsWith('|') && line.trim().endsWith('|') && !isSeparator(line)
}

// C-4 fix: escape HTML before inline rendering
function escapeHtml(s: string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, (_,g) => `<strong>${escapeHtml(g)}</strong>`)
    .replace(/\*(.*?)\*/g, (_,g) => `<em>${escapeHtml(g)}</em>`)
    .replace(/&nbsp;/g, ' ')
}

export default function DRERenderer({ markdown, title }: Props) {
  if (!markdown) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
      DRE não disponível — execute o squad e sincronize.
    </div>
  )

  const lines = markdown.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  let tableBuffer: string[] = []

  const flushTable = (idx: number) => {
    if (tableBuffer.length === 0) return
    const rows = tableBuffer.filter(l => !isSeparator(l))
    const header = rows[0]
    const body = rows.slice(1)
    const headerCells = header.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim())

    elements.push(
      <div key={`tbl-${idx}`} style={{ overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {headerCells.map((h, hi) => (
                <th key={hi} style={{
                  padding: '8px 14px', textAlign: hi === 0 ? 'left' : 'right',
                  fontWeight: 700, fontSize: 11, textTransform: 'uppercase',
                  letterSpacing: '0.6px', color: 'var(--rose)',
                  borderBottom: '1px solid var(--border2)',
                  background: 'var(--surface2)',
                }}>
                  <span dangerouslySetInnerHTML={{ __html: renderInline(h) }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => {
              const cells = row.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim())
              const first = cells[0] ?? ''
              const isBoldRow = first.includes('**')
              const isTotal = first.toLowerCase().includes('(=)') || first.toLowerCase().includes('lucro líquido') || first.toLowerCase().includes('receita líquida')
              const isNegRow = cells[1]?.includes('(') || cells[1]?.trim().startsWith('-')

              return (
                <tr key={ri} style={{
                  borderBottom: '1px solid var(--border)',
                  background: isBoldRow ? 'var(--surface2)' : 'transparent',
                }}>
                  {cells.map((cell, ci) => {
                    const { text, value, isBold } = fmtCell(cell)
                    const isRight = ci > 0
                    const isNeg = value !== null && value < 0
                    const isPos = value !== null && value > 0 && isTotal && ci === 1

                    return (
                      <td key={ci} style={{
                        padding: '9px 14px',
                        textAlign: isRight ? 'right' : 'left',
                        fontWeight: (isBold || isBoldRow) ? 700 : 400,
                        color: isPos ? 'var(--green)' : isNeg && isTotal ? 'var(--red-color)' : 'var(--cream)',
                        whiteSpace: ci === 0 ? 'normal' : 'nowrap',
                        fontSize: isBoldRow ? 13 : 13,
                        paddingLeft: ci === 0 && !first.includes('**') ? '28px' : '14px',
                      }}>
                        <span dangerouslySetInnerHTML={{ __html: renderInline(text) }} />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
    tableBuffer = []
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (isTableRow(trimmed) || isSeparator(trimmed)) {
      tableBuffer.push(trimmed)
      i++
      continue
    } else {
      flushTable(i)
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={i} style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)', marginBottom: 4, letterSpacing: '-0.3px' }}>
          <span dangerouslySetInnerHTML={{ __html: renderInline(trimmed.slice(2)) }} />
        </h1>
      )
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={i} style={{ fontSize: 14, fontWeight: 700, color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '28px 0 14px' }}>
          {trimmed.slice(3)}
        </h2>
      )
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={i} style={{ fontSize: 13, fontWeight: 700, color: 'var(--blush)', margin: '18px 0 10px' }}>
          {trimmed.slice(4)}
        </h3>
      )
    } else if (trimmed.startsWith('> ')) {
      const text = trimmed.slice(2)
      const isOk = text.includes('✅')
      const isWarn = text.includes('⚠️')
      elements.push(
        <div key={i} style={{
          background: isOk ? 'var(--green-dim)' : isWarn ? 'var(--yellow-dim)' : 'var(--cherry-dim)',
          border: `1px solid ${isOk ? 'rgba(168,255,192,0.2)' : isWarn ? 'rgba(255,232,115,0.2)' : 'rgba(116,30,49,0.3)'}`,
          borderLeft: `3px solid ${isOk ? 'var(--green)' : isWarn ? 'var(--yellow)' : 'var(--cherry)'}`,
          borderRadius: 8, padding: '10px 14px', marginBottom: 10, fontSize: 12,
          color: 'var(--muted2)', lineHeight: 1.6,
        }}>
          <span dangerouslySetInnerHTML={{ __html: renderInline(text) }} />
        </div>
      )
    } else if (trimmed === '---') {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />)
    } else if (trimmed === '') {
      // skip
    } else {
      elements.push(
        <p key={i} style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 8, lineHeight: 1.7 }}>
          <span dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }} />
        </p>
      )
    }
    i++
  }
  flushTable(i)

  return (
    <div style={{ maxWidth: 900 }}>
      {title && (
        <div style={{ marginBottom: 20, fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {title}
        </div>
      )}
      {elements}
    </div>
  )
}
