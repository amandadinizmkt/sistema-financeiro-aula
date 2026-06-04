'use client'
import { useEffect, useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import KPICard from '@/components/KPICard'
import LancamentosTable from '@/components/LancamentosTable'
import LancamentoModal from '@/components/LancamentoModal'
import { PFData, LancamentoPF, formatBRL } from '@/lib/types'

export default function PFPage() {
  const [data, setData] = useState<PFData | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; item?: LancamentoPF }>({ open: false })
  const [showGuia, setShowGuia] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/pf/data')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const deleteLancamento = async (id: string) => {
    await fetch('/api/lancamento', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secao: 'pf', id }) })
    load()
  }

  const saveLancamento = async (item: Record<string, unknown>) => {
    const method = item.id ? 'PUT' : 'POST'
    await fetch('/api/lancamento', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secao: 'pf', conta: 'pf', ...item }) })
    setModal({ open: false })
    load()
  }

  const allLancamentos: LancamentoPF[] = data ? [
    ...(data.contas?.pf?.lancamentos ?? []),
    ...(data.lancamentos_manuais ?? []),
  ] : []

  const totalEntradas = allLancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
  const totalSaidas = allLancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)
  const saldo = totalEntradas - totalSaidas
  const proLabore = allLancamentos.filter(l => l.categoria?.toLowerCase().includes('pró-labore')).reduce((s, l) => s + l.valor, 0)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1, padding: '32px 36px', minHeight: '100vh', background: 'var(--bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--rose)', marginBottom: 6, fontWeight: 600 }}>
              Conta PF
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--cream)', letterSpacing: '-0.5px' }}>
              Finanças Pessoais
            </h1>
            {data?.periodo && (
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{data.periodo}</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowGuia(!showGuia)} style={{
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: 8, padding: '9px 18px', color: 'var(--rose)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              📂 Como processar imports
            </button>
            <button onClick={() => setModal({ open: true })} style={{
              background: 'var(--cherry)', border: 'none',
              borderRadius: 8, padding: '9px 18px', color: 'var(--cream)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              + Novo Lançamento
            </button>
          </div>
        </div>

        {/* Guia de imports */}
        {showGuia && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h3 style={{ color: 'var(--blush)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              📂 Como processar extratos e prints PF
            </h3>
            <ol style={{ color: 'var(--muted2)', fontSize: 13, lineHeight: 2, paddingLeft: 20 }}>
              <li>Coloque seus prints, extratos ou CSVs na pasta: <code style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: 4, color: 'var(--rose)', fontSize: 12 }}>pf-imports/</code></li>
              <li>Abra o Claude Code nessa pasta do sistema</li>
              <li>Digite: <code style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: 4, color: 'var(--rose)', fontSize: 12 }}>processar imports PF</code></li>
              <li>O Claude vai ler os arquivos, extrair os lançamentos e atualizar o <code style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: 4, color: 'var(--rose)', fontSize: 12 }}>data/pf-data.json</code></li>
              <li>Recarregue esta página para ver os dados atualizados</li>
            </ol>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
              Formatos aceitos: PNG, JPG (prints de tela), CSV (extratos exportados), PDF (extratos bancários)
            </div>
          </div>
        )}

        {loading && <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 60 }}>Carregando dados...</div>}

        {!loading && (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
              <KPICard icon="💵" label="Total Entradas" value={formatBRL(totalEntradas)} status="green" />
              <KPICard icon="💸" label="Total Saídas" value={formatBRL(totalSaidas)} status={totalSaidas > totalEntradas ? 'red' : 'neutral'} />
              <KPICard icon="💰" label="Saldo" value={formatBRL(saldo)} status={saldo >= 0 ? 'green' : 'red'} />
              <KPICard icon="🏦" label="Pró-labore Recebido" value={formatBRL(proLabore)} status="neutral" sub="Do PJ para o PF" />
            </div>

            {/* Lançamentos */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--cream)' }}>Lançamentos PF</h2>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{allLancamentos.length} registros</span>
              </div>

              {allLancamentos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--cream)' }}>Sem lançamentos PF ainda</div>
                  <div style={{ fontSize: 13 }}>Adicione manualmente ou processe seus imports na pasta <code style={{ color: 'var(--rose)' }}>pf-imports/</code></div>
                </div>
              ) : (
                <LancamentosTable
                  items={allLancamentos}
                  secao="pf"
                  onDelete={deleteLancamento}
                  onEdit={item => setModal({ open: true, item: item as LancamentoPF })}
                />
              )}
            </div>

            {/* Categorias breakdown */}
            {allLancamentos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
                {(['entrada', 'saida'] as const).map(tipo => {
                  const filtrados = allLancamentos.filter(l => l.tipo === tipo)
                  const porCategoria = filtrados.reduce((acc, l) => {
                    const cat = l.categoria || 'Outros'
                    acc[cat] = (acc[cat] ?? 0) + l.valor
                    return acc
                  }, {} as Record<string, number>)
                  const sorted = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])
                  const total = filtrados.reduce((s, l) => s + l.valor, 0)

                  return (
                    <div key={tipo} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: tipo === 'entrada' ? 'var(--green)' : 'var(--red-color)', marginBottom: 16 }}>
                        {tipo === 'entrada' ? '↑ Entradas por categoria' : '↓ Saídas por categoria'}
                      </h3>
                      {sorted.map(([cat, val]) => (
                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>{cat}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{((val / total) * 100).toFixed(1)}% do total</div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: tipo === 'entrada' ? 'var(--green)' : 'var(--red-color)' }}>
                            {formatBRL(val)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>

      {modal.open && (
        <LancamentoModal
          secao="pf"
          initial={modal.item as Record<string, unknown>}
          onSave={saveLancamento}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}
