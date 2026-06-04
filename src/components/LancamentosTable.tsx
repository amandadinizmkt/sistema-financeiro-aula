'use client'
import { useState } from 'react'
import { Lancamento, LancamentoPF, formatBRL } from '@/lib/types'

type Item = Lancamento | LancamentoPF

interface Props {
  items: Item[]
  secao: 'pj' | 'pf'
  onDelete?: (id: string) => void
  onEdit?: (item: Item) => void
  readonly?: boolean
}

export default function LancamentosTable({ items, secao, onDelete, onEdit, readonly }: Props) {
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState<'data' | 'valor' | 'descricao'>('data')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = items
    .filter(i => {
      const q = filter.toLowerCase()
      return i.descricao?.toLowerCase().includes(q) || i.categoria?.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === 'data') cmp = (a.data ?? '').localeCompare(b.data ?? '')
      if (sortBy === 'valor') cmp = a.valor - b.valor
      if (sortBy === 'descricao') cmp = a.descricao.localeCompare(b.descricao)
      return sortDir === 'asc' ? cmp : -cmp
    })

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const isReceita = (i: Item) => ('tipo' in i) && (i.tipo === 'receita' || i.tipo === 'entrada')

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Filtrar por descrição ou categoria..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            width: '100%', padding: '8px 14px',
            background: 'var(--surface3)', border: '1px solid var(--border2)',
            borderRadius: 8, color: 'var(--cream)', fontSize: 13, outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface2)' }}>
              {[
                { key: 'data', label: 'Data' },
                { key: 'descricao', label: 'Descrição' },
                { key: null, label: 'Categoria' },
                { key: 'valor', label: 'Valor' },
                { key: null, label: 'Tipo' },
                ...(!readonly ? [{ key: null, label: 'Ações' }] : []),
              ].map((col, i) => (
                <th key={i}
                  onClick={() => col.key && toggleSort(col.key as typeof sortBy)}
                  style={{
                    padding: '10px 14px', textAlign: 'left', fontWeight: 600,
                    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px',
                    color: 'var(--rose)', borderBottom: '1px solid var(--border)',
                    cursor: col.key ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                  }}>
                  {col.label}
                  {col.key === sortBy && <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                  Nenhum lançamento encontrado
                </td>
              </tr>
            )}
            {filtered.map((item, i) => {
              const receita = isReceita(item)
              return (
                <tr key={`${item.id ?? ''}-${i}`} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '10px 14px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{item.data}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--cream)', maxWidth: 280 }}>
                    <div style={{ fontWeight: 500 }}>{item.descricao}</div>
                    {item.nota && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.nota}</div>}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      background: 'var(--surface3)', borderRadius: 20, padding: '3px 10px',
                      fontSize: 11, color: 'var(--muted2)',
                    }}>{item.categoria}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap',
                    color: receita ? 'var(--green)' : 'var(--red-color)' }}>
                    {receita ? '+' : '-'} {formatBRL(Math.abs(item.valor))}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '3px 10px',
                      background: receita ? 'var(--green-dim)' : 'var(--red-dim)',
                      color: receita ? 'var(--green)' : 'var(--red-color)',
                    }}>
                      {receita ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  {!readonly && (
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {onEdit && (
                          <button onClick={() => onEdit(item)} style={{
                            background: 'var(--surface3)', border: '1px solid var(--border)',
                            borderRadius: 6, padding: '4px 10px', fontSize: 12,
                            color: 'var(--rose)', cursor: 'pointer',
                          }}>Editar</button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item.id!)} style={{
                            background: 'var(--red-dim)', border: '1px solid rgba(255,107,107,0.2)',
                            borderRadius: 6, padding: '4px 10px', fontSize: 12,
                            color: 'var(--red-color)', cursor: 'pointer',
                          }}>Excluir</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
        {filtered.length} de {items.length} lançamentos
      </div>
    </div>
  )
}
