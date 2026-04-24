import { createAdminClient } from '@/lib/supabase-server'
import type { Certification } from '@/types'

export async function getCertifications(): Promise<Certification[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('certifications')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Certification[]
}

export async function createCertification(cert: Omit<Certification, 'id'>): Promise<Certification> {
  const db = createAdminClient()
  const { data, error } = await db.from('certifications').insert(cert).select().single()
  if (error) throw error
  return data as Certification
}

export async function updateCertification(id: string, cert: Partial<Certification>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('certifications').update(cert).eq('id', id)
  if (error) throw error
}

export async function deleteCertification(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('certifications').delete().eq('id', id)
  if (error) throw error
}
