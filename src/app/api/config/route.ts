import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/db'
import { readConfig } from '@/lib/data'

export async function GET() {
  try {
    await requireAuth()
    const config = readConfig()
    if (!config) {
      return NextResponse.json({
        configured: false,
        message: 'Config não encontrada. Crie config/sistema.json a partir de sistema.example.json.',
      })
    }
    return NextResponse.json({
      configured: true,
      nome: config.nome,
      empresas: config.empresas,
      // intencionalmente não retornamos os paths absolutos pro frontend
    })
  } catch {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
}
