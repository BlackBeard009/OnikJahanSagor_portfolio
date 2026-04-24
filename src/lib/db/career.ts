import { createAdminClient } from '@/lib/supabase-server'
import type { CareerEntry } from '@/types'

export async function getCareer(): Promise<CareerEntry[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('career')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as CareerEntry[]
}

export async function createCareerEntry(entry: Omit<CareerEntry, 'id'>): Promise<CareerEntry> {
  const db = createAdminClient()
  const { data, error } = await db.from('career').insert(entry).select().single()
  if (error) throw error
  return data as CareerEntry
}

export async function updateCareerEntry(id: string, entry: Partial<CareerEntry>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('career').update(entry).eq('id', id)
  if (error) throw error
}

export async function deleteCareerEntry(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('career').delete().eq('id', id)
  if (error) throw error
}
