'use client'
import { useEffect, useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import KPICard from '@/components/KPICard'
import LancamentosTable from '@/components/LancamentosTable'
import LancamentoModal from '@/components/LancamentoModal'
import DRERenderer from '@/components/DRERenderer'
import { PJData, Lancamento, formatBRL } from '@/lib/types'

const toArr = <T,>(v: T[] | unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

interface HistoryEntry {
  month: string
  label: string
  periodo: string
  agencia_resultado: number
  cursos_resultado: number
}

const MONTHS_PT = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export default function PJPage() {
  const [data, setData] = useState<PJData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [tab, setTab] = useState<'agencia' | 'cursos' | 'consolidado' | 'dre'>('agencia')
  const [dreTab, setDreTab] = useState<'agencia' | 'cursos' | 'consolidado'>('agencia')
  const [modal, setModal] = useState<{ open: boolean; item?: Lancamento }>({ open: false })
  const [msg, setMsg] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyTab, setHistoryTab] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [historyData, setHistoryData] = useState<PJData | null>(null)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/pj/data')
    if (res.ok) {
      const json = await res.json()
      // API returns { empty: true } when no data exists for this month
      setData(json.empty ? null : json)
    }
    setLoading(false)
  }, [])

  const loadHistory = useCallback(async () => {
    const res = await fetch('/api/history')
    if (res.ok) setHistory(await res.json())
  }, [])

  useEffect(() => { load(); loadHistory() }, [load, loadHistory])

  const sync = async () => {
    setSyncing(true)
    const res = await fetch('/api/pj/sync', { method: 'POST' })
    const j = await res.json()
    if (res.ok) { setMsg(`✅ Sincronizado: ${j.periodo}`); load() }
    else setMsg(`❌ ${j.error}`)
    setSyncing(false)
    setTimeout(() => setMsg(''), 6000)
  }

  const archiveMonth = async () => {
    setArchiving(true)
    const res = await fetch('/api/archive', { method: 'POST' })
    const j = await res.json()
    if (res.ok) {
      setMsg(`✅ ${j.label} arquivado! Dados limpos para novo mês.`)
      load(); loadHistory()
    } else setMsg(`❌ ${j.error}`)
    setArchiving(false)
    setShowArchiveConfirm(false)
    setTimeout(() => setMsg(''), 8000)
  }

  const loadHistoryMonth = async (month: string) => {
    const res = await fetch(`/api/history/${month}`)
    if (res.ok) { setHistoryData(await res.json()); setSelectedMonth(month) }
  }

  const deleteLancamento = async (id: string) => {
    await fetch('/api/lancamento', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secao: 'pj', id }) })
    load()
  }

  const saveLancamento = async (item: Record<string, unknown>) => {
    const method = item.id ? 'PUT' : 'POST'
    await fetch('/api/lancamento', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secao: 'pj', ...item }) })
    setModal({ open: false }); load()
  }

  const activeData = historyTab && historyData ? historyData : data
  const isReadOnly = historyTab && historyData !== null

  const agencia = activeData?.empresas?.agencia
  const cursos = activeData?.empresas?.cursos

  const consolidado = agencia && cursos ? {
    receita_bruta: (agencia.totais?.receita_bruta ?? 0) + (cursos.totais?.receita_bruta ?? 0),
    receita_liquida: (agencia.totais?.receita_liquida ?? 0) + (cursos.totais?.receita_liquida ?? 0),
    despesas: (agencia.totais?.despesas_operacionais ?? 0) + (cursos.totais?.despesas_operacionais ?? 0),
    resultado: (agencia.totais?.resultado_operacional ?? 0) + (cursos.totais?.resultado_operacional ?? 0),
  } : null

  const empresa = tab === 'agencia' ? agencia : tab === 'cursos' ? cursos : null

  const allLancamentos: Lancamento[] = tab === 'agencia' ? [
    ...toArr<Lancamento>(empresa?.receitas), ...toArr<Lancamento>(empresa?.despesas),
    ...toArr<Lancamento>(empresa?.impostos), ...toArr<Lancamento>(empresa?.distribuicao_lucro),
    ...(!isReadOnly ? toArr<Lancamento>(activeData?.lancamentos_manuais) : []),
  ] : tab === 'cursos' ? [
    ...toArr<Lancamento>(empresa?.receitas), ...toArr<Lancamento>(empresa?.despesas),
  ] : []

  const margemPct = (res: number, liq: number) => liq > 0 ? (res / liq) * 100 : 0
  const margemStatus = (pct: number) => pct > 20 ? 'green' : pct > 0 ? 'yellow' : 'red'

  const periodoLabel = activeData?.periodo
    ? (() => {
        const m = activeData.periodo.slice(5, 7)
        const y = activeData.periodo.slice(0, 4)
        return `${MONTHS_PT[parseInt(m)]} ${y}`
      })()
    : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1, padding: '28px 36px', background: 'var(--bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--rose)', marginBottom: 5, fontWeight: 600 }}>
              Conta PJ
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--cream)', letterSpacing: '-0.5px' }}>
              Gestão Financeira PJ
            </h1>
            {periodoLabel && (
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
                {isReadOnly ? `📦 Histórico — ` : ''}{periodoLabel}
                {!isReadOnly && activeData?.run_id && (
                  <span style={{ marginLeft: 10, fontSize: 11, opacity: 0.6 }}>run {activeData.run_id?.slice(0, 10)}</span>
                )}
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
                <button onClick={() => setShowArchiveConfirm(true)} disabled={!activeData?.periodo} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border2)',
                  borderRadius: 8, padding: '8px 16px', color: 'var(--yellow)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }} title="Arquiva o mês atual e abre espaço para o próximo">
                  📁 Fechar Mês
                </button>

                <button onClick={sync} disabled={syncing} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border2)',
                  borderRadius: 8, padding: '8px 16px', color: 'var(--rose)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  {syncing ? '⏳ Sincronizando...' : '🔄 Extrair do Squad'}
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
              <div style={{ fontSize: 12, color: 'var(--muted2)' }}>Os dados serão salvos no histórico e o mês atual será limpo para junho.</div>
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
                Nenhum mês arquivado ainda. Use "Fechar Mês" ao final do mês.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {history.map(h => {
                  const consolidadoRes = h.agencia_resultado + h.cursos_resultado
                  const isPos = consolidadoRes >= 0
                  const isActive = selectedMonth === h.month
                  return (
                    <button key={h.month} onClick={() => loadHistoryMonth(h.month)} style={{
                      background: isActive ? 'var(--cherry-dim)' : 'var(--surface2)',
                      border: `1px solid ${isActive ? 'rgba(116,30,49,0.5)' : 'var(--border)'}`,
                      borderRadius: 10, padding: '12px 18px', cursor: 'pointer', textAlign: 'left', minWidth: 160,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cream)', marginBottom: 4 }}>{h.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: isPos ? 'var(--green)' : 'var(--red-color)' }}>
                        {formatBRL(consolidadoRes)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>resultado consolidado</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {loading && !historyTab && (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 60 }}>Carregando dados...</div>
        )}

        {!loading && !activeData && !historyTab && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
            <div style={{ color: 'var(--cream)', fontWeight: 600, marginBottom: 8 }}>Sem dados no mês atual</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Clique em "Extrair do Squad" para carregar os dados do último run.</div>
            <button onClick={sync} style={{ background: 'var(--cherry)', border: 'none', borderRadius: 8, padding: '10px 24px', color: 'var(--cream)', fontWeight: 600, cursor: 'pointer' }}>
              🔄 Extrair do Squad
            </button>
          </div>
        )}

        {activeData && (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 22, background: 'var(--surface)', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid var(--border)' }}>
              {([
                { key: 'agencia', label: '🏢 Agência Furtacor' },
                { key: 'cursos', label: '📚 Amanda Diniz Marketing' },
                { key: 'consolidado', label: '📊 Consolidado' },
                { key: 'dre', label: '📋 DRE' },
              ] as const).map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  padding: '8px 16px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: tab === t.key ? 'var(--cherry)' : 'transparent',
                  color: tab === t.key ? 'var(--cream)' : 'var(--muted)',
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* KPI Cards */}
            {tab !== 'dre' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
                {tab === 'consolidado' && consolidado ? <>
                  <KPICard icon="💰" label="Receita Bruta Total" value={formatBRL(consolidado.receita_bruta)} status="neutral" />
                  <KPICard icon="✅" label="Receita Líquida Total" value={formatBRL(consolidado.receita_liquida)} status="neutral" />
                  <KPICard icon="📉" label="Total Despesas" value={formatBRL(Math.abs(consolidado.despesas))} status="neutral" />
                  <KPICard icon="🎯" label="Resultado Consolidado" value={formatBRL(consolidado.resultado)}
                    status={margemStatus(margemPct(consolidado.resultado, consolidado.receita_liquida))}
                    sub={`Margem ${margemPct(consolidado.resultado, consolidado.receita_liquida).toFixed(1)}%`} />
                </> : empresa ? <>
                  <KPICard icon="💰" label="Receita Bruta" value={formatBRL(empresa.totais?.receita_bruta ?? 0)} status="neutral" />
                  <KPICard icon="✅" label="Receita Líquida" value={formatBRL(empresa.totais?.receita_liquida ?? 0)} status="neutral" />
                  <KPICard icon="📉" label="Despesas Operacionais" value={formatBRL(Math.abs(empresa.totais?.despesas_operacionais ?? 0))} status="neutral" />
                  <KPICard icon="🎯" label="Resultado" value={formatBRL(empresa.totais?.resultado_operacional ?? 0)}
                    status={margemStatus(margemPct(empresa.totais?.resultado_operacional ?? 0, empresa.totais?.receita_liquida ?? 0))}
                    sub={`Margem ${margemPct(empresa.totais?.resultado_operacional ?? 0, empresa.totais?.receita_liquida ?? 0).toFixed(1)}%`} />
                </> : null}
              </div>
            )}

            {/* Lançamentos */}
            {(tab === 'agencia' || tab === 'cursos') && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--cream)' }}>Lançamentos do Período</h2>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{allLancamentos.length} registros</span>
                </div>
                <LancamentosTable items={allLancamentos} secao="pj"
                  onDelete={!isReadOnly ? deleteLancamento : undefined}
                  onEdit={!isReadOnly ? item => setModal({ open: true, item: item as Lancamento }) : undefined}
                  readonly={isReadOnly} />
              </div>
            )}

            {/* Consolidado side-by-side */}
            {tab === 'consolidado' && activeData?.empresas && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {(['agencia', 'cursos'] as const).map(k => {
                  const emp = activeData.empresas?.[k]
                  const items = [...toArr<Lancamento>(emp?.receitas), ...toArr<Lancamento>(emp?.despesas), ...toArr<Lancamento>(emp?.impostos)]
                  const label = k === 'agencia' ? 'Agência Furtacor' : 'Amanda Diniz Marketing'
                  return (
                    <div key={k} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--rose)', marginBottom: 14 }}>{label}</h3>
                      <LancamentosTable items={items} secao="pj" readonly />
                    </div>
                  )
                })}
              </div>
            )}

            {/* DRE bonito */}
            {tab === 'dre' && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 28 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 22, background: 'var(--surface2)', padding: 4, borderRadius: 8, width: 'fit-content', border: '1px solid var(--border)' }}>
                  {([
                    { key: 'agencia', label: 'Agência Furtacor' },
                    { key: 'cursos', label: 'Amanda Diniz Marketing' },
                    { key: 'consolidado', label: 'Consolidado' },
                  ] as const).map(d => (
                    <button key={d.key} onClick={() => setDreTab(d.key)} style={{
                      padding: '7px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: dreTab === d.key ? 'var(--cherry)' : 'transparent',
                      color: dreTab === d.key ? 'var(--cream)' : 'var(--muted)',
                    }}>
                      {d.label}
                    </button>
                  ))}
                </div>
                <DRERenderer
                  markdown={activeData.dre?.[dreTab] ?? ''}
                  title={dreTab === 'agencia' ? 'Agência Furtacor' : dreTab === 'cursos' ? 'Amanda Diniz Marketing' : 'Consolidado'}
                />
              </div>
            )}

            {/* Pendências */}
            {!isReadOnly && toArr(activeData.pendencias).length > 0 && (
              <div style={{ background: 'var(--cherry-dim)', border: '1px solid rgba(116,30,49,0.3)', borderRadius: 12, padding: 14, marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blush)', marginBottom: 6 }}>
                  ⚠️ {toArr(activeData.pendencias).length} pendência(s) do squad
                </div>
                {toArr(activeData.pendencias).map((p: unknown, i: number) => (
                  <div key={i} style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 3 }}>
                    • {typeof p === 'string' ? p : JSON.stringify(p)}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {modal.open && (
        <LancamentoModal secao="pj" initial={modal.item as unknown as Record<string, unknown>}
          onSave={saveLancamento} onClose={() => setModal({ open: false })} />
      )}
    </div>
  )
}
