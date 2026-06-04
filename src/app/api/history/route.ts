import { NextResponse } from 'next/server'
import { requireAuth, listPJMeses } from '@/lib/supabase/db'

const MONTHS_PT = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-')
  return `${MONTHS_PT[parseInt(m)]} ${y}`
}

export async function GET() {
  try {
    const { userId } = await requireAuth()
    const meses = await listPJMeses(userId)

    return NextResponse.json(
      meses.map(m => ({
        month: m.mes,
        label: formatMonth(m.mes),
        periodo: m.periodo,
        agencia_resultado: m.agencia_resultado ?? 0,
        cursos_resultado: m.cursos_resultado ?? 0,
      }))
    )
  } catch {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
}
