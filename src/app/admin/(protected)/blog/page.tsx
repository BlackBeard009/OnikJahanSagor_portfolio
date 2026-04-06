'use client'
import { useState, useEffect, useCallback } from 'react'
import { BlogPost } from '@/types'
import { DataTable } from '@/components/admin/DataTable'
import { BlogEditor } from '@/components/admin/BlogEditor'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/blog')
    setPosts(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(data: Partial<BlogPost>) {
    if (editing) {
      await fetch(`/api/admin/blog/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    } else {
      await fetch('/api/admin/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setEditing(null)
    setCreating(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
        <Button onClick={() => { setCreating(true); setEditing(null) }}>+ New Post</Button>
      </div>

      {(creating || editing) && (
        <GlassCard className="mb-8">
          <h2 className="text-white font-semibold mb-4">{editing ? 'Edit Post' : 'New Post'}</h2>
          <BlogEditor initial={editing ?? undefined} onSubmit={handleSave} onCancel={() => { setEditing(null); setCreating(false) }} />
        </GlassCard>
      )}

      <DataTable
        data={posts}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'slug', label: 'Slug' },
          {
            key: 'published',
            label: 'Status',
            render: (v) => <Badge variant={v ? 'green' : 'gray'}>{v ? 'Published' : 'Draft'}</Badge>,
          },
          {
            key: 'published_at',
            label: 'Published At',
            render: (v) => v ? new Date(v as string).toLocaleDateString() : '–',
          },
        ]}
        onEdit={(row) => { setEditing(row); setCreating(false) }}
        onDelete={handleDelete}
      />
    </div>
  )
}
