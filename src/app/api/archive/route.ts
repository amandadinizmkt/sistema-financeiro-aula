import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getPJPeriodo, listPJMeses } from '@/lib/supabase/db'

// Arquivar mês no Supabase é automático — o período já fica salvo por mes.
// Esta rota recebe o mês que o usuário quer fechar (body.mes) ou,
// se não vier nada, pega o mês mais recente que tem dados.
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
      // Fallback: mês mais recente do banco
      const meses = await listPJMeses(userId)
      mes = meses[0]?.mes
    }

    if (!mes) return NextResponse.json({ error: 'Sem dados para arquivar' }, { status: 400 })

    const existing = await getPJPeriodo(userId, mes)
    if (!existing) return NextResponse.json({ error: 'Mês informado não tem dados' }, { status: 400 })

    const months = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const [y, m] = mes.split('-')
    return NextResponse.json({ ok: true, month: mes, label: `${months[parseInt(m)]} ${y}` })
  } catch {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
}
