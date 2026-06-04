import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getPJPeriodo, getLancamentos } from '@/lib/supabase/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ month: string }> }) {
  try {
    const { userId } = await requireAuth()
    const { month } = await params

    // C-2 fix: strict validation — only YYYY-MM format allowed
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }

    const [periodo, agenciaLanc, cursosLanc] = await Promise.all([
      getPJPeriodo(userId, month),
      getLancamentos(userId, month, 'agencia'),
      getLancamentos(userId, month, 'cursos'),
    ])

    if (!periodo) return NextResponse.json({ error: 'Mês não encontrado' }, { status: 404 })

    return NextResponse.json({
      periodo: periodo.periodo,
      mes: periodo.mes,
      run_id: periodo.run_id,
      empresas: {
        agencia: {
          nome: periodo.agencia_nome,
          totais: {
            receita_bruta: periodo.agencia_receita_bruta,
            receita_liquida: periodo.agencia_receita_liquida,
            despesas_operacionais: periodo.agencia_despesas,
            resultado_operacional: periodo.agencia_resultado,
          },
          receitas: agenciaLanc.filter(l => l.tipo === 'receita'),
          despesas: agenciaLanc.filter(l => l.tipo === 'despesa'),
        },
        cursos: {
          nome: periodo.cursos_nome,
          totais: {
            receita_bruta: periodo.cursos_receita_bruta,
            receita_liquida: periodo.cursos_receita_liquida,
            despesas_operacionais: periodo.cursos_despesas,
            resultado_operacional: periodo.cursos_resultado,
          },
          receitas: cursosLanc.filter(l => l.tipo === 'receita'),
          despesas: cursosLanc.filter(l => l.tipo === 'despesa'),
        },
      },
      dre: {
        agencia: periodo.dre_agencia,
        cursos: periodo.dre_cursos,
        consolidado: periodo.dre_consolidado,
      },
      pendencias: periodo.pendencias ?? [],
    })
  } catch {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
}
