import { createAdminClient } from '@/lib/supabase-server'
import type { Achievement } from '@/types'

export async function getAchievements(): Promise<Achievement[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('achievements')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createAchievement(entry: Omit<Achievement, 'id'>): Promise<Achievement> {
  const db = createAdminClient()
  const { data, error } = await db.from('achievements').insert(entry).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateAchievement(id: string, updates: Partial<Omit<Achievement, 'id'>>): Promise<Achievement> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('achievements')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteAchievement(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('achievements').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
