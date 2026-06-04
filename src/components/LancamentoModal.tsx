'use client'
import { useState, useEffect } from 'react'

interface Props {
  secao: 'pj' | 'pf'
  initial?: Record<string, unknown>
  onSave: (data: Record<string, unknown>) => Promise<void>
  onClose: () => void
}

const categoriasPJ = ['Gestão de Redes Sociais', 'Mentorias', 'Consultoria', 'Cursos', 'Assinatura',
  'Pessoal/Freelancers', 'Pró-labore', 'Ferramentas', 'Aluguel', 'Impostos',
  'Contabilidade', 'Telefonia', 'Energia', 'Distribuição de Lucro', 'Outros']

const categoriasPF = ['Pró-labore recebido', 'Distribuição de lucro', 'Alimentação', 'Saúde',
  'Transporte', 'Moradia', 'Lazer', 'Educação', 'Vestuário', 'Assinaturas',
  'Investimentos', 'Outros']

export default function LancamentoModal({ secao, initial, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    data: '',
    descricao: '',
    valor: '',
    tipo: secao === 'pj' ? 'despesa' : 'saida',
    categoria: '',
    nota: '',
    ...initial,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSave({ ...form, valor: parseFloat(String(form.valor).replace(',', '.')) })
    setLoading(false)
  }

  const categorias = secao === 'pj' ? categoriasPJ : categoriasPF
  const tipoOpts = secao === 'pj'
    ? [{ v: 'receita', l: 'Receita' }, { v: 'despesa', l: 'Despesa' }]
    : [{ v: 'entrada', l: 'Entrada' }, { v: 'saida', l: 'Saída' }]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: 16, padding: 32, width: 480, maxWidth: '90vw',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ color: 'var(--cream)', fontSize: 16, fontWeight: 700 }}>
            {initial?.id ? 'Editar lançamento' : 'Novo lançamento'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'data', label: 'Data', type: 'date', required: true },
            { key: 'descricao', label: 'Descrição', type: 'text', required: true },
            { key: 'valor', label: 'Valor (R$)', type: 'number', required: true },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, color: 'var(--rose)', fontWeight: 600, display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input type={f.type} required={f.required}
                value={String(form[f.key as keyof typeof form] ?? '')}
                onChange={e => set(f.key, e.target.value)}
                style={{
                  width: '100%', padding: '9px 14px',
                  background: 'var(--surface2)', border: '1px solid var(--border2)',
                  borderRadius: 8, color: 'var(--cream)', fontSize: 14, outline: 'none',
                }} />
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--rose)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Tipo</label>
              <select value={String(form.tipo)} onChange={e => set('tipo', e.target.value)} style={{
                width: '100%', padding: '9px 14px',
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 8, color: 'var(--cream)', fontSize: 14, outline: 'none',
              }}>
                {tipoOpts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--rose)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Categoria</label>
              <select value={String(form.categoria)} onChange={e => set('categoria', e.target.value)} style={{
                width: '100%', padding: '9px 14px',
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 8, color: 'var(--cream)', fontSize: 14, outline: 'none',
              }}>
                <option value="">Selecionar...</option>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--rose)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Nota (opcional)</label>
            <input type="text" value={String(form.nota ?? '')} onChange={e => set('nota', e.target.value)}
              style={{
                width: '100%', padding: '9px 14px',
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 8, color: 'var(--cream)', fontSize: 14, outline: 'none',
              }} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '10px', background: 'var(--surface2)',
              border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--muted2)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '10px', background: 'var(--cherry)',
              border: 'none', borderRadius: 8,
              color: 'var(--cream)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
