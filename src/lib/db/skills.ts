import { createAdminClient } from '@/lib/supabase-server'
import type { Skill } from '@/types'

export async function getSkills(): Promise<Skill[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('skills')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Skill[]
}

export async function createSkill(skill: Omit<Skill, 'id'>): Promise<Skill> {
  const db = createAdminClient()
  const { data, error } = await db.from('skills').insert(skill).select().single()
  if (error) throw error
  return data as Skill
}

export async function updateSkill(id: string, skill: Partial<Skill>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('skills').update(skill).eq('id', id)
  if (error) throw error
}

export async function deleteSkill(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('skills').delete().eq('id', id)
  if (error) throw error
}
