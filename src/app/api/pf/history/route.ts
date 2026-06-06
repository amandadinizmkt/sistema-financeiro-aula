import { NextResponse } from 'next/server'
import { requireAuth, listPFMeses, getPFLancamentos } from '@/lib/supabase/db'

const MONTHS_PT = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-')
  return `${MONTHS_PT[parseInt(m)]} ${y}`
}

export async function GET() {
  try {
    const { userId } = await requireAuth()
    const meses = await listPFMeses(userId)

    // Para cada mês, calcular saldo (entradas - saídas) para o card do histórico
    const result = await Promise.all(meses.map(async (m: { mes: string; periodo?: string }) => {
      const lanc = await getPFLancamentos(userId, m.mes)
      const entradas = lanc.filter(l => l.tipo === 'entrada').reduce((s, l) => s + Number(l.valor), 0)
      const saidas = lanc.filter(l => l.tipo === 'saida').reduce((s, l) => s + Number(l.valor), 0)
      return {
        month: m.mes,
        label: formatMonth(m.mes),
        periodo: m.periodo,
        entradas,
        saidas,
        saldo: entradas - saidas,
      }
    }))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
}
