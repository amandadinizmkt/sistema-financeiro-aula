import { NextResponse } from 'next/server'
import { requireAuth, upsertPJPeriodo, insertLancamento, deleteLancamento, getLancamentos } from '@/lib/supabase/db'
import { readConfig } from '@/lib/data'
import { syncFromSquad } from '@/lib/sync'
import path from 'path'

export async function POST() {
  try {
    const { userId } = await requireAuth()
    const config = readConfig()
    if (!config) return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 500 })

    const rawPath = config.squad_output_path as string

    // C-3 fix: validate path is safe.
    // Allowed: any absolute path inside $HOME or any relative path resolved
    // inside the project directory. This is a local-only system — the config
    // file is on the user's own machine, and auth/middleware blocks external
    // access. We still block /etc/, /var/, /System/ etc.
    const resolved = path.resolve(process.cwd(), rawPath)
    const home = process.env.HOME || process.env.USERPROFILE || ''
    const insideHome = home && resolved.startsWith(home + path.sep)
    const insideCwd = resolved.startsWith(process.cwd() + path.sep)
    if (!insideHome && !insideCwd) {
      return NextResponse.json({ error: 'Caminho de squad não permitido (fora de $HOME)' }, { status: 403 })
    }

    const squadData = syncFromSquad(resolved)
    if (!squadData) {
      return NextResponse.json({ error: 'Nenhum output do squad encontrado' }, { status: 404 })
    }

    const mes = squadData.periodo?.slice(0, 7) ?? new Date().toISOString().slice(0, 7)
    const ag = squadData.empresas.agencia
    const cu = squadData.empresas.cursos

    // Persist period data to Supabase
    await upsertPJPeriodo(userId, mes, {
      periodo: squadData.periodo,
      run_id: squadData.run_id,
      ultimo_sync: new Date().toISOString(),
      agencia_nome: ag.nome,
      agencia_receita_bruta: ag.totais.receita_bruta ?? 0,
      agencia_receita_liquida: ag.totais.receita_liquida ?? 0,
      agencia_despesas: ag.totais.despesas_operacionais ?? 0,
      agencia_resultado: ag.totais.resultado_operacional ?? 0,
      agencia_distribuicao_lucro: ag.totais.distribuicao_lucro ?? 0,
      cursos_nome: cu.nome,
      cursos_receita_bruta: cu.totais.receita_bruta ?? 0,
      cursos_receita_liquida: cu.totais.receita_liquida ?? 0,
      cursos_despesas: cu.totais.despesas_operacionais ?? 0,
      cursos_resultado: cu.totais.resultado_operacional ?? 0,
      dre_agencia: squadData.dre.agencia,
      dre_cursos: squadData.dre.cursos,
      dre_consolidado: squadData.dre.consolidado,
      pendencias: squadData.pendencias,
    })

    // Replace non-manual lancamentos for this month
    const existing = await getLancamentos(userId, mes)
    const toDelete = existing.filter(l => !l.is_manual)
    await Promise.all(toDelete.map(l => deleteLancamento(userId, l.id)))

    const allLancamentos = [
      ...(ag.receitas ?? []).map(l => ({ ...l, empresa: 'agencia' })),
      ...(ag.despesas ?? []).map(l => ({ ...l, empresa: 'agencia' })),
      ...(ag.impostos ?? []).map(l => ({ ...l, empresa: 'agencia' })),
      ...(ag.distribuicao_lucro ?? []).map(l => ({ ...l, empresa: 'agencia' })),
      ...(cu.receitas ?? []).map(l => ({ ...l, empresa: 'cursos' })),
      ...(cu.despesas ?? []).map(l => ({ ...l, empresa: 'cursos' })),
    ]

    const safeDate = (d: unknown, fallback: string) =>
      typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : `${fallback}-01`

    await Promise.all(
      allLancamentos.map(l => insertLancamento(userId, mes, {
        empresa: l.empresa,
        data: safeDate(l.data, mes),
        descricao: l.descricao?.slice(0, 500) ?? '',
        valor: typeof l.valor === 'number' ? l.valor : 0,
        tipo: l.tipo === 'receita' ? 'receita' : 'despesa',
        categoria: l.categoria?.slice(0, 100) ?? null,
        nota: l.nota?.slice(0, 300) ?? null,
        fonte: l.fonte?.slice(0, 100) ?? null,
        is_manual: false,
      }))
    )

    return NextResponse.json({ ok: true, periodo: squadData.periodo, run_id: squadData.run_id, mes })
  } catch (err) {
    if (err instanceof Error && err.message === 'Não autenticado') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    console.error('Sync error:', msg, err)
    return NextResponse.json({ error: 'Erro interno no sync', detail: msg }, { status: 500 })
  }
}
