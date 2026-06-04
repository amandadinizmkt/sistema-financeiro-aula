import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, insertLancamento, updateLancamento, deleteLancamento, insertPFLancamento, updatePFLancamento, deletePFLancamento } from '@/lib/supabase/db'
import { z } from 'zod'

// Schema validation — only allow known safe fields
const lancamentoPJSchema = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/),
  empresa: z.enum(['agencia', 'cursos']),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  descricao: z.string().min(1).max(500),
  valor: z.number().finite(),
  tipo: z.enum(['receita', 'despesa']),
  categoria: z.string().max(100).optional().nullable(),
  nota: z.string().max(300).optional().nullable(),
})

const lancamentoPFSchema = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  descricao: z.string().min(1).max(500),
  valor: z.number().finite(),
  tipo: z.enum(['entrada', 'saida']),
  categoria: z.string().max(100).optional().nullable(),
  nota: z.string().max(300).optional().nullable(),
  conta: z.enum(['pf', 'pj']).optional(),
})

const deleteSchema = z.object({
  secao: z.enum(['pj', 'pf']),
  id: z.string().uuid(),
})

const updateSchema = z.object({
  secao: z.enum(['pj', 'pf']),
  id: z.string().uuid(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  descricao: z.string().min(1).max(500).optional(),
  valor: z.number().finite().optional(),
  tipo: z.string().optional(),
  categoria: z.string().max(100).optional().nullable(),
  nota: z.string().max(300).optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth()
    const body = await req.json()
    const { secao, ...rest } = body

    if (secao === 'pj') {
      const validated = lancamentoPJSchema.parse(rest)
      const id = await insertLancamento(userId, validated.mes, validated)
      return NextResponse.json({ ok: true, id })
    }

    if (secao === 'pf') {
      const validated = lancamentoPFSchema.parse(rest)
      const id = await insertPFLancamento(userId, validated.mes, validated)
      return NextResponse.json({ ok: true, id })
    }

    return NextResponse.json({ error: 'Secão inválida' }, { status: 400 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Dados inválidos', details: err.issues }, { status: 422 })
    if (err instanceof Error && err.message === 'Não autenticado') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await requireAuth()
    const body = await req.json()
    const { secao, id, ...rest } = updateSchema.parse(body)

    // Build safe update object with only allowed fields
    const allowed = ['data', 'descricao', 'valor', 'tipo', 'categoria', 'nota']
    const updates = Object.fromEntries(Object.entries(rest).filter(([k]) => allowed.includes(k)))

    if (secao === 'pj') await updateLancamento(userId, id, updates)
    else await updatePFLancamento(userId, id, updates)

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
    if (err instanceof Error && err.message === 'Não autenticado') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await requireAuth()
    const body = deleteSchema.parse(await req.json())

    if (body.secao === 'pj') await deleteLancamento(userId, body.id)
    else await deletePFLancamento(userId, body.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
    if (err instanceof Error && err.message === 'Não autenticado') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
