import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getPFPeriodo, getPFLancamentos } from '@/lib/supabase/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ month: string }> }) {
  try {
    const { userId } = await requireAuth()
    const { month } = await params

    // Strict validation — only YYYY-MM format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }

    const [periodo, lancamentos] = await Promise.all([
      getPFPeriodo(userId, month),
      getPFLancamentos(userId, month),
    ])

    if (!periodo && lancamentos.length === 0) {
      return NextResponse.json({ error: 'Mês não encontrado' }, { status: 404 })
    }

    const entradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + Number(l.valor), 0)
    const saidas = lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + Number(l.valor), 0)
    const proLabore = lancamentos
      .filter(l => l.categoria?.toLowerCase().includes('pró-labore'))
      .reduce((s, l) => s + Number(l.valor), 0)

    return NextResponse.json({
      mes: month,
      periodo: periodo?.periodo ?? null,
      ultimo_sync: periodo?.ultimo_sync ?? null,
      contas: { pf: { nome: 'Conta Pessoal (PF)', lancamentos } },
      resumo: { total_entradas: entradas, total_saidas: saidas, saldo: entradas - saidas, pro_labore_recebido: proLabore },
      lancamentos_manuais: [],
    })
  } catch {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
}
