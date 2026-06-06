import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getPFPeriodo, getPFLancamentos, listPFMeses } from '@/lib/supabase/db'
import { z } from 'zod'

const querySchema = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth()
    const { mes } = querySchema.parse(Object.fromEntries(req.nextUrl.searchParams))

    let targetMes = mes ?? new Date().toISOString().slice(0, 7)
    let periodo = await getPFPeriodo(userId, targetMes)
    let lancamentos = await getPFLancamentos(userId, targetMes)

    if (lancamentos.length === 0 && !periodo && !mes) {
      // No data for current month — load the most recent available period
      const allMeses = await listPFMeses(userId)
      if (allMeses.length > 0) {
        targetMes = allMeses[0].mes
        ;[periodo, lancamentos] = await Promise.all([
          getPFPeriodo(userId, targetMes),
          getPFLancamentos(userId, targetMes),
        ])
      }
    }

    if (lancamentos.length === 0 && !periodo) {
      return NextResponse.json({ empty: true, mes: targetMes })
    }

    const entradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + Number(l.valor), 0)
    const saidas = lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + Number(l.valor), 0)
    const proLabore = lancamentos
      .filter(l => l.categoria?.toLowerCase().includes('pró-labore'))
      .reduce((s, l) => s + Number(l.valor), 0)

    return NextResponse.json({
      mes: targetMes,
      periodo: periodo?.periodo ?? null,
      ultimo_sync: periodo?.ultimo_sync ?? null,
      contas: { pf: { nome: 'Conta Pessoal (PF)', lancamentos } },
      resumo: { total_entradas: entradas, total_saidas: saidas, saldo: entradas - saidas, pro_labore_recebido: proLabore },
      lancamentos_manuais: [],
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'Não autenticado') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
