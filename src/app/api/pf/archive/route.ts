import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getPFPeriodo, getPFLancamentos, listPFMeses, upsertPFPeriodo } from '@/lib/supabase/db'

// Arquivar mês PF: confirma o fechamento do mês que o usuário está vendo.
// Os lançamentos PF ficam salvos no banco com mes='YYYY-MM' — então só
// confirmamos que tem dados e retornamos o label formatado.
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth()
    let mes: string | undefined
    try {
      const body = await req.json()
      if (typeof body?.mes === 'string' && /^\d{4}-\d{2}$/.test(body.mes)) {
        mes = body.mes
      }
    } catch { /* body opcional */ }

    if (!mes) {
      // Fallback: mês mais recente com dados
      const meses = await listPFMeses(userId)
      mes = meses[0]?.mes
    }

    if (!mes) return NextResponse.json({ error: 'Sem dados para arquivar' }, { status: 400 })

    // Verifica que tem pelo menos 1 lançamento OU já tem registro de período
    const [periodo, lanc] = await Promise.all([
      getPFPeriodo(userId, mes),
      getPFLancamentos(userId, mes),
    ])
    if (!periodo && lanc.length === 0) {
      return NextResponse.json({ error: 'Mês informado não tem dados' }, { status: 400 })
    }

    // Garante que existe um registro em fin_pf_periodos para o mês (necessário pra aparecer no histórico)
    if (!periodo) {
      await upsertPFPeriodo(userId, mes, {
        periodo: `${mes}-01 a ${mes}-31`,
        ultimo_sync: new Date().toISOString(),
      })
    }

    const months = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const [y, m] = mes.split('-')
    return NextResponse.json({ ok: true, month: mes, label: `${months[parseInt(m)]} ${y}` })
  } catch {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
}
