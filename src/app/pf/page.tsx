'use client'
import { useEffect, useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import KPICard from '@/components/KPICard'
import LancamentosTable from '@/components/LancamentosTable'
import LancamentoModal from '@/components/LancamentoModal'
import { PFData, LancamentoPF, formatBRL } from '@/lib/types'

interface PFHistoryEntry {
  month: string
  label: string
  periodo: string
  entradas: number
  saidas: number
  saldo: number
}

const MONTHS_PT = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export default function PFPage() {
  const [data, setData] = useState<PFData | null>(null)
  const [loading, setLoading] = useState(true)
  const [archiving, setArchiving] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; item?: LancamentoPF }>({ open: false })
  const [showGuia, setShowGuia] = useState(false)
  const [msg, setMsg] = useState('')
  const [history, setHistory] = useState<PFHistoryEntry[]>([])
  const [historyTab, setHistoryTab] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [historyData, setHistoryData] = useState<PFData | null>(null)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/pf/data')
    if (res.ok) {
      const json = await res.json()
      setData(json.empty ? null : json)
    }
    setLoading(false)
  }, [])

  const loadHistory = useCallback(async () => {
    const res = await fetch('/api/pf/history')
    if (res.ok) setHistory(await res.json())
  }, [])

  useEffect(() => { load(); loadHistory() }, [load, loadHistory])

  const archiveMonth = async () => {
    setArchiving(true)
    const mesAtual = activeData?.mes ?? activeData?.periodo?.slice(0, 7)
    const res = await fetch('/api/pf/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mes: mesAtual }),
    })
    const j = await res.json()
    if (res.ok) {
      setMsg(`✅ ${j.label} arquivado! Pronto para receber o próximo mês.`)
      load(); loadHistory()
    } else setMsg(`❌ ${j.error}`)
    setArchiving(false)
    setShowArchiveConfirm(false)
    setTimeout(() => setMsg(''), 8000)
  }

  const loadHistoryMonth = async (month: string) => {
    const res = await fetch(`/api/pf/history/${month}`)
    if (res.ok) { setHistoryData(await res.json()); setSelectedMonth(month) }
  }

  const deleteLancamento = async (id: string) => {
    await fetch('/api/lancamento', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secao: 'pf', id }) })
    load(); loadHistory()
  }

  const saveLancamento = async (item: Record<string, unknown>) => {
    const method = item.id ? 'PUT' : 'POST'
    const mesAlvo = item.mes ?? activeData?.mes ?? new Date().toISOString().slice(0, 7)
    await fetch('/api/lancamento', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secao: 'pf', conta: 'pf', mes: mesAlvo, ...item }) })
    setModal({ open: false })
    load(); loadHistory()
  }

  const activeData = historyTab && historyData ? historyData : data
  const isReadOnly = historyTab && historyData !== null

  const allLancamentos: LancamentoPF[] = activeData ? [
    ...(activeData.contas?.pf?.lancamentos ?? []),
    ...(!isReadOnly ? (activeData.lancamentos_manuais ?? []) : []),
  ] : []

  const totalEntradas = allLancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + Number(l.valor), 0)
  const totalSaidas = allLancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + Number(l.valor), 0)
  const saldo = totalEntradas - totalSaidas
  const proLabore = allLancamentos.filter(l => l.categoria?.toLowerCase().includes('pró-labore')).reduce((s, l) => s + Number(l.valor), 0)

  const periodoLabel = activeData?.mes
    ? (() => {
        const [y, m] = activeData.mes.split('-')
        return `${MONTHS_PT[parseInt(m)]} ${y}`
      })()
    : activeData?.periodo

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1, padding: '28px 36px', background: 'var(--bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--rose)', marginBottom: 5, fontWeight: 600 }}>
              Conta PF
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--cream)', letterSpacing: '-0.5px' }}>
              Finanças Pessoais
            </h1>
            {periodoLabel && (
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
                {isReadOnly ? `📦 Histórico — ` : ''}{periodoLabel}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {msg && <span style={{ fontSize: 12, color: msg.startsWith('✅') ? 'var(--green)' : 'var(--red-color)', fontWeight: 600, maxWidth: 300 }}>{msg}</span>}

            {/* History toggle */}
            <button onClick={() => { setHistoryTab(!historyTab); if (historyTab) setHistoryData(null) }} style={{
              background: historyTab ? 'var(--cherry-dim)' : 'var(--surface2)',
              border: `1px solid ${historyTab ? 'rgba(116,30,49,0.4)' : 'var(--border2)'}`,
              borderRadius: 8, padding: '8px 16px', color: historyTab ? 'var(--blush)' : 'var(--muted2)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              📦 Histórico {history.length > 0 && `(${history.length})`}
            </button>

            {!isReadOnly && (
              <>
                <button onClick={() => setShowArchiveConfirm(true)} disabled={!activeData?.mes && !activeData?.periodo} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border2)',
                  borderRadius: 8, padding: '8px 16px', color: 'var(--yellow)',
                  fontSize: 13, fontWeight: 600, cursor: (!activeData?.mes && !activeData?.periodo) ? 'not-allowed' : 'pointer',
                  opacity: (!activeData?.mes && !activeData?.periodo) ? 0.5 : 1,
                }}>
                  📁 Fechar Mês
                </button>

                <button onClick={() => setShowGuia(!showGuia)} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border2)',
                  borderRadius: 8, padding: '8px 16px', color: 'var(--rose)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  📂 Como processar imports
                </button>

                <button onClick={() => setModal({ open: true })} style={{
                  background: 'var(--cherry)', border: 'none',
                  borderRadius: 8, padding: '8px 16px', color: 'var(--cream)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  + Lançamento
                </button>
              </>
            )}

            {isReadOnly && (
              <button onClick={() => { setHistoryTab(false); setHistoryData(null); setSelectedMonth(null) }} style={{
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 8, padding: '8px 16px', color: 'var(--cream)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                ← Mês Atual
              </button>
            )}
          </div>
        </div>

        {/* Archive confirm */}
        {showArchiveConfirm && (
          <div style={{ background: 'var(--cherry-dim)', border: '1px solid rgba(116,30,49,0.5)', borderRadius: 12, padding: 20, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--blush)', marginBottom: 4 }}>Fechar {periodoLabel}?</div>
              <div style={{ fontSize: 12, color: 'var(--muted2)' }}>Os dados serão salvos no histórico e o sistema fica pronto pra receber o próximo mês.</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowArchiveConfirm(false)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', color: 'var(--muted2)', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
              <button onClick={archiveMonth} disabled={archiving} style={{ background: 'var(--cherry)', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'var(--cream)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                {archiving ? 'Arquivando...' : '✅ Confirmar'}
              </button>
            </div>
          </div>
        )}

        {/* History panel */}
        {historyTab && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rose)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              📦 Meses Arquivados
            </div>
            {history.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                Nenhum mês arquivado ainda. Use &quot;Fechar Mês&quot; ao final do mês.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {history.map(h => {
                  const isPos = h.saldo >= 0
                  const isActive = selectedMonth === h.month
                  return (
                    <button key={h.month} onClick={() => loadHistoryMonth(h.month)} style={{
                      background: isActive ? 'var(--cherry-dim)' : 'var(--surface2)',
                      border: `1px solid ${isActive ? 'rgba(116,30,49,0.5)' : 'var(--border)'}`,
                      borderRadius: 10, padding: '12px 18px', cursor: 'pointer', textAlign: 'left', minWidth: 160,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cream)', marginBottom: 4 }}>{h.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: isPos ? 'var(--green)' : 'var(--red-color)' }}>
                        {formatBRL(h.saldo)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>saldo do mês</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Guia de imports */}
        {showGuia && !isReadOnly && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h3 style={{ color: 'var(--blush)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              📂 Como processar extratos e prints PF
            </h3>
            <ol style={{ color: 'var(--muted2)', fontSize: 13, lineHeight: 2, paddingLeft: 20 }}>
              <li>Coloque seus prints, extratos ou CSVs na pasta: <code style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: 4, color: 'var(--rose)', fontSize: 12 }}>pf-imports/</code></li>
              <li>Abra o Claude Code na pasta do projeto</li>
              <li>Digite: <code style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: 4, color: 'var(--rose)', fontSize: 12 }}>processar imports PF e subir pro sistema</code></li>
              <li>O Claude vai ler os arquivos, extrair os lançamentos e salvar no Supabase</li>
              <li>Recarregue esta página para ver os dados atualizados</li>
            </ol>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
              Formatos aceitos: PNG, JPG (prints de tela), CSV (extratos exportados), PDF (extratos bancários)
            </div>
          </div>
        )}

        {loading && !historyTab && (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 60 }}>Carregando dados...</div>
        )}

        {!loading && !activeData && !historyTab && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
            <div style={{ color: 'var(--cream)', fontWeight: 600, marginBottom: 8 }}>Sem dados no mês atual</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Adicione manualmente ou processe seus imports na pasta <code style={{ color: 'var(--rose)' }}>pf-imports/</code></div>
            <button onClick={() => setModal({ open: true })} style={{ background: 'var(--cherry)', border: 'none', borderRadius: 8, padding: '10px 24px', color: 'var(--cream)', fontWeight: 600, cursor: 'pointer' }}>
              + Adicionar primeiro lançamento
            </button>
          </div>
        )}

        {activeData && (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
              <KPICard icon="💵" label="Total Entradas" value={formatBRL(totalEntradas)} status="green" />
              <KPICard icon="💸" label="Total Saídas" value={formatBRL(totalSaidas)} status={totalSaidas > totalEntradas ? 'red' : 'neutral'} />
              <KPICard icon="💰" label="Saldo" value={formatBRL(saldo)} status={saldo >= 0 ? 'green' : 'red'} />
              <KPICard icon="🏦" label="Pró-labore Recebido" value={formatBRL(proLabore)} status="neutral" sub="Do PJ para o PF" />
            </div>

            {/* Lançamentos */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--cream)' }}>Lançamentos PF</h2>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{allLancamentos.length} registros</span>
              </div>

              {allLancamentos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--cream)' }}>Sem lançamentos neste mês</div>
                </div>
              ) : (
                <LancamentosTable
                  items={allLancamentos}
                  secao="pf"
                  onDelete={!isReadOnly ? deleteLancamento : undefined}
                  onEdit={!isReadOnly ? item => setModal({ open: true, item: item as LancamentoPF }) : undefined}
                  readonly={isReadOnly}
                />
              )}
            </div>

            {/* Categorias breakdown */}
            {allLancamentos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
                {(['entrada', 'saida'] as const).map(tipo => {
                  const filtrados = allLancamentos.filter(l => l.tipo === tipo)
                  const porCategoria = filtrados.reduce((acc, l) => {
                    const cat = l.categoria || 'Outros'
                    acc[cat] = (acc[cat] ?? 0) + Number(l.valor)
                    return acc
                  }, {} as Record<string, number>)
                  const sorted = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])
                  const total = filtrados.reduce((s, l) => s + Number(l.valor), 0)

                  return (
                    <div key={tipo} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: tipo === 'entrada' ? 'var(--green)' : 'var(--red-color)', marginBottom: 14 }}>
                        {tipo === 'entrada' ? '↑ Entradas por categoria' : '↓ Saídas por categoria'}
                      </h3>
                      {sorted.length === 0 ? (
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Nenhum registro</div>
                      ) : sorted.map(([cat, val]) => (
                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                          <div>
                            <div style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>{cat}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{((val / total) * 100).toFixed(1)}% do total</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: tipo === 'entrada' ? 'var(--green)' : 'var(--red-color)' }}>
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
          initial={modal.item as unknown as Record<string, unknown>}
          onSave={saveLancamento}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}
