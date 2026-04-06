import { createAdminClient } from '@/lib/supabase-server'
import type { ContactMessage } from '@/types'

export async function getMessages(): Promise<ContactMessage[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function markMessageRead(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db
    .from('contact_messages')
    .update({ read: true })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function createMessage(msg: Omit<ContactMessage, 'id' | 'read' | 'created_at'>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('contact_messages').insert(msg)
  if (error) throw new Error(error.message)
}
