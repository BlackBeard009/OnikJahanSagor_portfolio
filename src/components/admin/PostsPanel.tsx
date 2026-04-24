'use client'
import { useState } from 'react'
import type { Post } from '@/types'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const EMPTY: Omit<Post, 'id' | 'created_at'> = {
  slug: '', title: '', excerpt: '', body: '',
  tag: '', read_time: '', date_label: '', published: false
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function wordCount(md: string): number {
  return md.trim().split(/\s+/).filter(Boolean).length
}

function autoReadTime(md: string): string {
  const wpm = 200
  const mins = Math.max(1, Math.ceil(wordCount(md) / wpm))
  return `${mins} min read`
}

function PostEditor({ initial, onSave, onClose }: {
  initial: Omit<Post, 'id' | 'created_at'>
  onSave: (data: Omit<Post, 'id' | 'created_at'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const [slugManual, setSlugManual] = useState(!!initial.slug)

  const setTitle = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: slugManual ? prev.slug : slugify(title)
    }))
  }

  const setBody = (body: string = '') => {
    setForm(prev => ({
      ...prev,
      body,
      read_time: autoReadTime(body)
    }))
  }

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 800, width: '90vw' }}>
        <div className="admin-modal-header">
          <span>{form.title ? 'Edit Post' : 'New Post'}</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="admin-form" style={{ overflowY: 'auto', maxHeight: '78vh' }}>
          <label className="admin-label">Title</label>
          <input className="admin-input" value={form.title ?? ''} onChange={e => setTitle(e.target.value)} />
          <label className="admin-label">Slug</label>
          <input className="admin-input" value={form.slug} onChange={e => { setSlugManual(true); setForm(prev => ({ ...prev, slug: e.target.value })) }} />
          <label className="admin-label">Excerpt</label>
          <textarea className="admin-input" rows={2} value={form.excerpt ?? ''} onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))} />
          <label className="admin-label">Tag</label>
          <input className="admin-input" value={form.tag ?? ''} onChange={e => setForm(prev => ({ ...prev, tag: e.target.value }))} />
          <label className="admin-label">Date Label (e.g. "Apr 2026")</label>
          <input className="admin-input" value={form.date_label ?? ''} onChange={e => setForm(prev => ({ ...prev, date_label: e.target.value }))} />
          <label className="admin-label">Read Time (auto: {autoReadTime(form.body ?? '')})</label>
          <input className="admin-input" value={form.read_time ?? ''} onChange={e => setForm(prev => ({ ...prev, read_time: e.target.value }))} placeholder={autoReadTime(form.body ?? '')} />
          <label className="admin-label">Body (Markdown) — {wordCount(form.body ?? '')} words</label>
          <div data-color-mode="dark" style={{ marginBottom: 8 }}>
            <MDEditor value={form.body ?? ''} onChange={setBody} height={380} />
          </div>
          <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.published} onChange={e => setForm(prev => ({ ...prev, published: e.target.checked }))} />
            Published
          </label>
        </div>
        <div className="admin-modal-footer">
          <span style={{ color: 'var(--ink-4)', fontSize: 12 }}>{wordCount(form.body ?? '')} words · {autoReadTime(form.body ?? '')}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={() => onSave(form)}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PostsPanel({ initial }: { initial: Post[] }) {
  const [posts, setPosts] = useState(initial)
  const [editing, setEditing] = useState<Post | null>(null)
  const [adding, setAdding] = useState(false)

  const sorted = [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleSave = async (data: Omit<Post, 'id' | 'created_at'>) => {
    if (editing) {
      const res = await fetch(`/api/admin/posts/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const updated: Post = await res.json()
      setPosts(prev => prev.map(p => p.id === editing.id ? updated : p))
      setEditing(null)
    } else {
      const res = await fetch('/api/admin/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const created: Post = await res.json()
      setPosts(prev => [created, ...prev])
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const togglePublish = async (post: Post) => {
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, published: !post.published })
    })
    const updated: Post = await res.json()
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn primary" onClick={() => setAdding(true)}>+ New Post</button>
      </div>
      <div className="admin-list">
        {sorted.map(p => (
          <div key={p.id} className="admin-list-item">
            <div>
              <span style={{ marginRight: 8, color: p.published ? 'var(--good)' : 'var(--ink-4)' }}>
                {p.published ? 'Published' : 'Draft'}
              </span>
              {p.tag && <span className="chip" style={{ marginRight: 8, color: 'var(--accent)' }}>{p.tag}</span>}
              <strong>{p.title}</strong>
              <div style={{ color: 'var(--ink-4)', fontSize: 12 }}>
                {p.date_label} · {p.read_time} · /{p.slug}
              </div>
            </div>
            <div className="admin-item-actions">
              <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => togglePublish(p)}>
                {p.published ? 'Unpublish' : 'Publish'}
              </button>
              <button className="btn ghost" onClick={() => setEditing(p)}>Edit</button>
              <button className="btn ghost" style={{ color: 'var(--red)' }} onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <div style={{ color: 'var(--ink-3)', padding: '24px 0' }}>No posts yet.</div>}
      </div>
      {(adding || editing) && (
        <PostEditor
          initial={editing ? { slug: editing.slug, title: editing.title, excerpt: editing.excerpt, body: editing.body, tag: editing.tag, read_time: editing.read_time, date_label: editing.date_label, published: editing.published } : EMPTY}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </>
  )
}
