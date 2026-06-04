import 'server-only'
import { createClient } from './server'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Não autenticado')
  return { supabase, userId: user.id }
}

// ------- PJ -------

export async function getPJPeriodo(userId: string, mes: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('fin_pj_periodos')
    .select('*')
    .eq('user_id', userId)
    .eq('mes', mes)
    .single()
  return data
}

export async function upsertPJPeriodo(userId: string, mes: string, payload: Record<string, unknown>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('fin_pj_periodos')
    .upsert({ user_id: userId, mes, ...payload }, { onConflict: 'user_id,mes' })
  if (error) throw error
}

export async function getLancamentos(userId: string, mes: string, empresa?: string) {
  const supabase = await createClient()
  let q = supabase
    .from('fin_lancamentos')
    .select('*')
    .eq('user_id', userId)
    .eq('mes', mes)
    .order('data', { ascending: false })
  if (empresa) q = q.eq('empresa', empresa)
  const { data } = await q
  return data ?? []
}

export async function insertLancamento(userId: string, mes: string, item: Record<string, unknown>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fin_lancamentos')
    .insert({ user_id: userId, mes, is_manual: true, ...item })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function updateLancamento(userId: string, id: string, updates: Record<string, unknown>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('fin_lancamentos')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}

export async function deleteLancamento(userId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('fin_lancamentos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}

export async function listPJMeses(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('fin_pj_periodos')
    .select('mes, periodo, agencia_resultado, cursos_resultado, created_at')
    .eq('user_id', userId)
    .order('mes', { ascending: false })
  return data ?? []
}

// ------- PF -------

export async function getPFPeriodo(userId: string, mes: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('fin_pf_periodos')
    .select('*')
    .eq('user_id', userId)
    .eq('mes', mes)
    .single()
  return data
}

export async function upsertPFPeriodo(userId: string, mes: string, payload: Record<string, unknown>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('fin_pf_periodos')
    .upsert({ user_id: userId, mes, ...payload }, { onConflict: 'user_id,mes' })
  if (error) throw error
}

export async function getPFLancamentos(userId: string, mes: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('fin_pf_lancamentos')
    .select('*')
    .eq('user_id', userId)
    .eq('mes', mes)
    .order('data', { ascending: false })
  return data ?? []
}

export async function insertPFLancamento(userId: string, mes: string, item: Record<string, unknown>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fin_pf_lancamentos')
    .insert({ user_id: userId, mes, is_manual: true, ...item })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function updatePFLancamento(userId: string, id: string, updates: Record<string, unknown>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('fin_pf_lancamentos')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}

export async function deletePFLancamento(userId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('fin_pf_lancamentos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}

export async function listPFMeses(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('fin_pf_periodos')
    .select('mes, periodo')
    .eq('user_id', userId)
    .order('mes', { ascending: false })
  return data ?? []
}
