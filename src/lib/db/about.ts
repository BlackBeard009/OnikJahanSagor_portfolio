import { createAdminClient } from '@/lib/supabase-server'
import type { About } from '@/types'

export async function getAbout(): Promise<About | null> {
  const db = createAdminClient()
  const { data, error } = await db.from('about').select('*').limit(1).single()
  if (error) return null
  return data
}

export async function updateAbout(id: string, updates: Partial<Omit<About, 'id'>>): Promise<About> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('about')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}
