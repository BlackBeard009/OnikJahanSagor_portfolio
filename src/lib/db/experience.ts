import { createAdminClient } from '@/lib/supabase-server'
import type { Experience } from '@/types'

export async function getExperience(): Promise<Experience[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('experience')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createExperience(entry: Omit<Experience, 'id'>): Promise<Experience> {
  const db = createAdminClient()
  const { data, error } = await db.from('experience').insert(entry).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateExperience(id: string, updates: Partial<Omit<Experience, 'id'>>): Promise<Experience> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('experience')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteExperience(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('experience').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
