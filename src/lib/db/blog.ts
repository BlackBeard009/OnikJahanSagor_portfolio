import { createAdminClient } from '@/lib/supabase-server'
import type { BlogPost } from '@/types'

export async function getBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
  const db = createAdminClient()
  let query = db.from('blog_posts').select('*').order('published_at', { ascending: false })
  if (publishedOnly) query = query.eq('published', true)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) {
    if ((error as { code?: string }).code === 'PGRST116') return null  // no rows found
    throw new Error(error.message)
  }
  return data
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'created_at'>): Promise<BlogPost> {
  const db = createAdminClient()
  const { data, error } = await db.from('blog_posts').insert(post).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateBlogPost(id: string, updates: Partial<Omit<BlogPost, 'id' | 'created_at'>>): Promise<BlogPost> {
  const db = createAdminClient()
  const payload = { ...updates }
  if (updates.published && !updates.published_at) {
    payload.published_at = new Date().toISOString()
  }
  const { data, error } = await db
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteBlogPost(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('blog_posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
