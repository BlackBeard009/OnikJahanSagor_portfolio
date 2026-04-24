import { createAdminClient } from '@/lib/supabase-server'
import type { Judge } from '@/types'

export async function getJudges(): Promise<Judge[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('judges')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Judge[]
}

export async function createJudge(judge: Omit<Judge, 'id'>): Promise<Judge> {
  const db = createAdminClient()
  const { data, error } = await db.from('judges').insert(judge).select().single()
  if (error) throw error
  return data as Judge
}

export async function updateJudge(id: string, judge: Partial<Judge>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('judges').update(judge).eq('id', id)
  if (error) throw error
}

export async function deleteJudge(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('judges').delete().eq('id', id)
  if (error) throw error
}
