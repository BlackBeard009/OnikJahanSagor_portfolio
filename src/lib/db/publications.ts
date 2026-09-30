import { createAdminClient } from '@/lib/supabase-server'
import type { Publication } from '@/types'

export async function getPublications(): Promise<Publication[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('publications')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Publication[]
}

export async function createPublication(pub: Omit<Publication, 'id'>): Promise<Publication> {
  const db = createAdminClient()
  const { data, error } = await db.from('publications').insert(pub).select().single()
  if (error) throw error
  return data as Publication
}

export async function updatePublication(id: string, pub: Partial<Publication>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('publications').update(pub).eq('id', id)
  if (error) throw error
}

export async function deletePublication(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('publications').delete().eq('id', id)
  if (error) throw error
}
