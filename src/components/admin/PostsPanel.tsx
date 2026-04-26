'use client'
import { useState } from 'react'
import type { Post } from '@/types'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

function ConfirmModal({ title, body, onCancel, onConfirm }: {
  title: string; body: string; onCancel: () => void; onConfirm: () => void
}) {
  return (
    <div className="modal-wrap" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="actions">
          <button className="btn ghost" onClick={onCancel}>cancel</button>
          <button className="btn danger" onClick={onConfirm}>delete</button>
        </div>
      </div>
    </div>
  )
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function wordCount(md: string) {
  return md.trim().split(/\s+/).filter(Boolean).length
}

function autoReadTime(md: string) {
  return `${Math.max(1, Math.ceil(wordCount(md) / 200))} min read`
}

const EMPTY: Omit<Post, 'id' | 'created_at'> = {
  slug: '', title: '', excerpt: '', body: '',
  tag: '', read_time: '', date_label: '', published: false
}

export default function PostsPanel({ initial }: { initial: Post[] }) {
  const [posts, setPosts] = useState(initial)
  const [open, setOpen] = useState<string | 'new' | null>(null)
  const [editing, setEditing] = useState<Record<string, Partial<Post>>>({})
  const [newPost, setNewPost] = useState<Omit<Post, 'id' | 'created_at'>>(EMPTY)
  const [slugManual, setSlugManual] = useState(false)
  const [confirm, setConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }
  const sorted = [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const getForm = (p: Post) => ({ ...p, ...(editing[p.id] ?? {}) }) as Post
  const setField = (id: string, patch: Partial<Post>) =>
    setEditing(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }))

  const saveExisting = async (p: Post) => {
    const form = getForm(p)
    setSaving(p.id)
    const res = await fetch(`/api/admin/posts/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { showToast('Failed to save'); setSaving(null); return }
    const updated: Post = await res.json()
    setPosts(prev => prev.map(pp => pp.id === p.id ? updated : pp))
    setEditing(prev => { const n = { ...prev }; delete n[p.id]; return n })
    setSaving(null)
    setOpen(null)
    showToast('Saved')
  }

  const saveNew = async () => {
    setSaving('new')
    const res = await fetch('/api/admin/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost),
    })
    if (!res.ok) { showToast('Failed to create'); setSaving(null); return }
    const created: Post = await res.json()
    setPosts(prev => [created, ...prev])
    setSaving(null)
    setOpen(null)
    setNewPost(EMPTY)
    setSlugManual(false)
    showToast('Post created')
  }

  const remove = async (id: string) => {
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== id))
    setConfirm(null)
    if (open === id) setOpen(null)
    showToast('Deleted')
  }

  const togglePublish = async (p: Post) => {
    const res = await fetch(`/api/admin/posts/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, published: !p.published }),
    })
    const updated: Post = await res.json()
    setPosts(prev => prev.map(pp => pp.id === updated.id ? updated : pp))
    showToast(updated.published ? 'Published' : 'Unpublished')
  }

  const setNewTitle = (title: string) => setNewPost(prev => ({ ...prev, title, slug: slugManual ? prev.slug : slugify(title) }))
  const setNewBody = (body = '') => setNewPost(prev => ({ ...prev, body, read_time: autoReadTime(body) }))

  return (
    <>
      <div className="main-head">
        <div>
          <div className="eyebrow">§ writing</div>
          <h1>Blog posts</h1>
          <p>Write and publish posts shown in the Writing section.</p>
        </div>
        <button className="btn primary" onClick={() => setOpen(open === 'new' ? null : 'new')}>
          {open === 'new' ? 'cancel' : '+ new post'}
        </button>
      </div>

      {open === 'new' && (
        <div className="row-card" style={{ marginBottom: 16 }}>
          <div className="editor" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>New post</div>
            <div className="form-grid">
              <div className="form-row">
                <label>Title</label>
                <input value={newPost.title} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Slug</label>
                <input className="mono" value={newPost.slug} onChange={e => { setSlugManual(true); setNewPost(prev => ({ ...prev, slug: e.target.value })) }} />
              </div>
              <div className="form-row">
                <label>Tag</label>
                <input className="mono" value={newPost.tag} onChange={e => setNewPost(prev => ({ ...prev, tag: e.target.value.toUpperCase() }))} />
              </div>
              <div className="form-row">
                <label>Date label</label>
                <input className="mono" value={newPost.date_label} placeholder="Apr 2026" onChange={e => setNewPost(prev => ({ ...prev, date_label: e.target.value }))} />
              </div>
              <div className="full form-row">
                <label>Excerpt</label>
                <textarea rows={2} value={newPost.excerpt} onChange={e => setNewPost(prev => ({ ...prev, excerpt: e.target.value }))} />
              </div>
              <div className="full form-row">
                <label>Body (Markdown) — {wordCount(newPost.body ?? '')} words · {autoReadTime(newPost.body ?? '')}</label>
                <div data-color-mode="dark">
                  <MDEditor value={newPost.body ?? ''} onChange={setNewBody} height={360} />
                </div>
              </div>
              <div className="form-row" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="new-published" checked={newPost.published} onChange={e => setNewPost(prev => ({ ...prev, published: e.target.checked }))} style={{ width: 'auto' }} />
                <label htmlFor="new-published" style={{ textTransform: 'none', fontSize: 14, color: 'var(--ink)', cursor: 'pointer' }}>Publish immediately</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn primary" onClick={saveNew} disabled={saving === 'new'}>
                {saving === 'new' ? 'saving…' : 'create post'}
              </button>
              <button className="btn ghost" onClick={() => { setOpen(null); setNewPost(EMPTY); setSlugManual(false) }}>discard</button>
            </div>
          </div>
        </div>
      )}

      {posts.length === 0 && open !== 'new' && (
        <div className="empty">
          <div className="big">No posts yet</div>
          <div className="sub">Create your first post above</div>
        </div>
      )}

      {sorted.map(p => {
        const form = getForm(p)
        const expanded = open === p.id
        return (
          <div key={p.id} className="row-card">
            <div className="summary">
              <div className="info">
                <span className="drag-handle">⋮⋮</span>
                <div>
                  <div className="title">
                    {p.title}
                    {p.published
                      ? <span className="tag-pill good">published</span>
                      : <span className="tag-pill">draft</span>}
                    {p.tag && <span className="tag-pill position">{p.tag}</span>}
                  </div>
                  <div className="sub">{p.date_label} · {p.read_time} · /{p.slug}</div>
                </div>
              </div>
              <div className="actions">
                <button className="btn small ghost" onClick={() => togglePublish(p)}>
                  {p.published ? 'unpublish' : 'publish'}
                </button>
                <button className="btn small" onClick={() => setOpen(expanded ? null : p.id)}>
                  {expanded ? 'close' : 'edit'}
                </button>
                <button className="btn small danger" onClick={() => setConfirm(p.id)}>delete</button>
              </div>
            </div>

            {expanded && (
              <div className="editor">
                <div className="form-grid">
                  <div className="form-row">
                    <label>Title</label>
                    <input value={form.title ?? ''} onChange={e => setField(p.id, { title: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Slug</label>
                    <input className="mono" value={form.slug ?? ''} onChange={e => setField(p.id, { slug: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Tag</label>
                    <input className="mono" value={form.tag ?? ''} onChange={e => setField(p.id, { tag: e.target.value.toUpperCase() })} />
                  </div>
                  <div className="form-row">
                    <label>Date label</label>
                    <input className="mono" value={form.date_label ?? ''} placeholder="Apr 2026" onChange={e => setField(p.id, { date_label: e.target.value })} />
                  </div>
                  <div className="full form-row">
                    <label>Excerpt</label>
                    <textarea rows={2} value={form.excerpt ?? ''} onChange={e => setField(p.id, { excerpt: e.target.value })} />
                  </div>
                  <div className="full form-row">
                    <label>Body (Markdown) — {wordCount(form.body ?? '')} words · {autoReadTime(form.body ?? '')}</label>
                    <div data-color-mode="dark">
                      <MDEditor
                        value={form.body ?? ''}
                        onChange={v => setField(p.id, { body: v ?? '', read_time: autoReadTime(v ?? '') })}
                        height={360}
                      />
                    </div>
                  </div>
                  <div className="form-row" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id={`pub-${p.id}`} checked={!!form.published} onChange={e => setField(p.id, { published: e.target.checked })} style={{ width: 'auto' }} />
                    <label htmlFor={`pub-${p.id}`} style={{ textTransform: 'none', fontSize: 14, color: 'var(--ink)', cursor: 'pointer' }}>Published</label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn primary" onClick={() => saveExisting(p)} disabled={saving === p.id}>
                    {saving === p.id ? 'saving…' : 'save'}
                  </button>
                  <button className="btn ghost" onClick={() => { setOpen(null); setEditing(prev => { const n = { ...prev }; delete n[p.id]; return n }) }}>
                    discard
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {confirm && (
        <ConfirmModal
          title="Delete post?"
          body={`"${posts.find(p => p.id === confirm)?.title}" will be permanently deleted.`}
          onCancel={() => setConfirm(null)}
          onConfirm={() => remove(confirm)}
        />
      )}

      {toast && <div className="toast"><span className="dot" /><span>{toast}</span></div>}
    </>
  )
}
