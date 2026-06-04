import fs from 'fs'
import path from 'path'
import { PJData, Lancamento } from './data'
import { parseDRETotais } from './dre-parser'

export function findLatestRun(squadOutputPath: string): string | null {
  try {
    const entries = fs.readdirSync(squadOutputPath)
      .filter(e => /^\d{4}-\d{2}-\d{2}/.test(e))
      .sort()
      .reverse()
    return entries[0] ? path.join(squadOutputPath, entries[0]) : null
  } catch {
    return null
  }
}

export function syncFromSquad(squadOutputPath: string): PJData | null {
  const runDir = findLatestRun(squadOutputPath)
  if (!runDir) return null

  const v1 = path.join(runDir, 'v1')
  const dataDir = fs.existsSync(v1) ? v1 : runDir

  const txFile = path.join(dataDir, 'transacoes-extraidas.json')
  if (!fs.existsSync(txFile)) return null

  const tx = JSON.parse(fs.readFileSync(txFile, 'utf-8'))
  const runId = path.basename(runDir)

  const dreAgencia = tryRead(path.join(dataDir, 'dre-agencia.md'))
  const dreCursos = tryRead(path.join(dataDir, 'dre-cursos.md'))
  const dreConsolidado = tryRead(path.join(dataDir, 'dre-consolidado.md'))

  // Parse authoritative totais from DRE markdown files
  const totaisAgencia = parseDRETotais(dreAgencia, 'agencia')
  const totaisCursos = parseDRETotais(dreCursos, 'cursos')

  return {
    ultimo_sync: new Date().toISOString(),
    periodo: tx.periodo ?? null,
    run_id: runId,
    empresas: {
      agencia: {
        nome: 'Agência Furtacor',
        totais: {
          receita_bruta: totaisAgencia.receita_bruta,
          receita_liquida: totaisAgencia.receita_liquida,
          despesas_operacionais: totaisAgencia.despesas_operacionais,
          resultado_operacional: totaisAgencia.resultado,
          distribuicao_lucro: totaisAgencia.distribuicao_lucro,
        },
        receitas: withIds(toArray(tx.agencia?.receitas)),
        despesas: withIds(toArray(tx.agencia?.despesas)),
        impostos: withIds(toArray(tx.agencia?.impostos)),
        distribuicao_lucro: withIds(toArray(tx.agencia?.distribuicao_lucro)),
      },
      cursos: {
        nome: 'Amanda Diniz Marketing',
        totais: {
          receita_bruta: totaisCursos.receita_bruta,
          receita_liquida: totaisCursos.receita_liquida,
          despesas_operacionais: totaisCursos.despesas_operacionais,
          resultado_operacional: totaisCursos.resultado,
        },
        receitas: normalizeCursosReceitas(tx.cursos, tx.periodo),
        despesas: withIds(toArray(tx.cursos?.despesas)),
      },
    },
    pendencias: tx.pendencias ?? [],
    dre: {
      agencia: dreAgencia,
      cursos: dreCursos,
      consolidado: dreConsolidado,
    },
    lancamentos_manuais: [],
  }
}

function tryRead(filePath: string): string {
  try { return fs.readFileSync(filePath, 'utf-8') } catch { return '' }
}

function toArray<T>(v: T | T[] | null | undefined): T[] {
  if (!v) return []
  return Array.isArray(v) ? v : []
}

let _idSeq = 0
function uid() { return `auto-${++_idSeq}-${Math.random().toString(36).slice(2, 8)}` }

function withIds(items: Lancamento[]): Lancamento[] {
  return items.map(item => ({
    ...item,
    id: item.id ?? uid(),
  }))
}

function normalizeCursosReceitas(cursos: Record<string, unknown>, periodo: string | null): Lancamento[] {
  if (!cursos) return []
  const rl = cursos.receita_lastlink
  const dataRef = periodo?.split(' a ')[1] ?? new Date().toISOString().slice(0, 10)
  const result: Lancamento[] = []

  if (Array.isArray(rl)) return withIds(rl as Lancamento[])

  // receita_lastlink como objeto resumo
  if (rl && typeof rl === 'object') {
    const obj = rl as Record<string, unknown>
    if (typeof obj.comissao_bruta_lastlink === 'number' && obj.comissao_bruta_lastlink > 0) {
      result.push({
        id: 'cursos-receita-lastlink',
        data: dataRef,
        descricao: `Last Link — Comissão Bruta (${obj.vendas_aprovadas ?? '?'} vendas)`,
        valor: obj.comissao_bruta_lastlink as number,
        tipo: 'receita',
        categoria: 'Receita de Produto Digital',
        nota: typeof obj.nota === 'string' ? obj.nota.slice(0, 100) : undefined,
      })
    }
    if (typeof obj.deducao_nicolas_22pct === 'number' && obj.deducao_nicolas_22pct < 0) {
      result.push({
        id: 'cursos-deducao-nicolas',
        data: dataRef,
        descricao: 'Dedução Nicolas Bargiela — 22% (co-produção Last Link)',
        valor: obj.deducao_nicolas_22pct as number,
        tipo: 'despesa',
        categoria: 'Co-produção / Parceria',
      })
    }
    if (typeof obj.taxa_lastlink === 'number' && obj.taxa_lastlink < 0) {
      result.push({
        id: 'cursos-taxa-lastlink',
        data: dataRef,
        descricao: 'Taxa Last Link (plataforma)',
        valor: obj.taxa_lastlink as number,
        tipo: 'despesa',
        categoria: 'Despesa de Plataforma/Taxa',
      })
    }
  }

  // mentorias e consultoria como receitas separadas
  const mentorias = toArray(cursos.mentorias as Lancamento[])
  const consultorias = toArray(cursos.consultorias as Lancamento[])
  result.push(...withIds(mentorias), ...withIds(consultorias))

  return result
}
