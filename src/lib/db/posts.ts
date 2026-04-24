import { createAdminClient } from '@/lib/supabase-server'
import type { Post } from '@/types'

export async function getPublishedPosts(): Promise<Post[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Post[]
}

export async function getAllPosts(): Promise<Post[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Post[]
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) return null
  return data as Post
}

export async function createPost(post: Omit<Post, 'id' | 'created_at'>): Promise<Post> {
  const db = createAdminClient()
  const { data, error } = await db.from('posts').insert(post).select().single()
  if (error) throw error
  return data as Post
}

export async function updatePost(id: string, post: Partial<Post>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('posts').update(post).eq('id', id)
  if (error) throw error
}

export async function deletePost(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('posts').delete().eq('id', id)
  if (error) throw error
}
