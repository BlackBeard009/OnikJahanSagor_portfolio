import { createAdminClient } from '@/lib/supabase-server'
import type { Contest } from '@/types'

export async function getContests(): Promise<Contest[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('contests')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Contest[]
}

export async function createContest(contest: Omit<Contest, 'id'>): Promise<Contest> {
  const db = createAdminClient()
  const { data, error } = await db.from('contests').insert(contest).select().single()
  if (error) throw error
  return data as Contest
}

export async function updateContest(id: string, contest: Partial<Contest>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('contests').update(contest).eq('id', id)
  if (error) throw error
}

export async function deleteContest(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('contests').delete().eq('id', id)
  if (error) throw error
}
