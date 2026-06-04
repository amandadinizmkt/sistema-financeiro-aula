import { NextResponse } from 'next/server'
import { requireAuth, getPJPeriodo } from '@/lib/supabase/db'

// Arquivar mês no Supabase é automático — o período já fica salvo por mes
// Esta rota apenas confirma o fechamento e retorna o label formatado
export async function POST() {
  try {
    const { userId } = await requireAuth()
    // Mês atual = mês com dados mais recentes
    // O dado já está no Supabase; "fechar mês" aqui apenas retorna confirmação
    // A UI deve criar um novo mês vazio via sync do próximo período
    const now = new Date()
    const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const existing = await getPJPeriodo(userId, mes)
    if (!existing) return NextResponse.json({ error: 'Sem dados para arquivar' }, { status: 400 })

    const months = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const [y, m] = mes.split('-')
    return NextResponse.json({ ok: true, month: mes, label: `${months[parseInt(m)]} ${y}` })
  } catch {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
}
