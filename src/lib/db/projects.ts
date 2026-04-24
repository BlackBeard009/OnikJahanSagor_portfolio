import { createAdminClient } from '@/lib/supabase-server'
import type { Project } from '@/types'

export async function getProjects(): Promise<Project[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('projects')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Project[]
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const db = createAdminClient()
  const { data, error } = await db.from('projects').insert(project).select().single()
  if (error) throw error
  return data as Project
}

export async function updateProject(id: string, project: Partial<Project>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('projects').update(project).eq('id', id)
  if (error) throw error
}

export async function deleteProject(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('projects').delete().eq('id', id)
  if (error) throw error
}
