import { createAdminClient } from '@/lib/supabase-server'
import type { Project } from '@/types'

export async function getProjects(): Promise<Project[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('projects')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('featured', true)
    .order('order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function createProject(project: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('projects')
    .insert(project)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'created_at'>>): Promise<Project> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteProject(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
