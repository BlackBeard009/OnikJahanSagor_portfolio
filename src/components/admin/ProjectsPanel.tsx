'use client'
import { useState, useRef } from 'react'
import type { Project, ProjectBullet } from '@/types'
import ChipsInput from './ChipsInput'

const EMPTY: Omit<Project, 'id'> = {
  num: '', title: '', tagline: '', description: '',
  bullets: [], stack: [], github_url: '', live_url: '', images: [], order: 0
}

function BulletsEditor({ value, onChange }: { value: ProjectBullet[], onChange: (v: ProjectBullet[]) => void }) {
  const [label, setLabel] = useState('')
  const [text, setText] = useState('')

  const add = () => {
    if (!label.trim() && !text.trim()) return
    onChange([...value, { b: label.trim(), t: text.trim() }])
    setLabel('')
    setText('')
  }

  return (
    <div>
      {value.map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
          <span style={{ fontWeight: 600, minWidth: 80 }}>{b.b}:</span>
          <span style={{ flex: 1, color: 'var(--ink-2)' }}>{b.t}</span>
          <button className="btn ghost" style={{ fontSize: 11 }} onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <input className="admin-input" style={{ width: 100 }} placeholder="Label" value={label} onChange={e => setLabel(e.target.value)} />
        <input className="admin-input" style={{ flex: 1 }} placeholder="Text" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <button className="btn ghost" onClick={add}>+</button>
      </div>
    </div>
  )
}

function ImagesEditor({ value, onChange }: { value: string[], onChange: (v: string[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    const newUrls: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload?bucket=project-images', { method: 'POST', body: fd })
      const { url } = await res.json()
      newUrls.push(url)
    }
    onChange([...value, ...newUrls])
    setUploading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {value.map((url, i) => (
          <div key={i} style={{ position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 2, border: '1px solid var(--line)' }} />
            <button onClick={() => onChange(value.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 2, right: 2, background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 2, width: 16, height: 16, cursor: 'pointer', fontSize: 10 }}>×</button>
          </div>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
      <button className="btn ghost" disabled={uploading} onClick={() => fileRef.current?.click()}>
        {uploading ? 'Uploading…' : '+ Add Images'}
      </button>
    </div>
  )
}

function ProjectModal({ initial, onSave, onClose }: {
  initial: Omit<Project, 'id'>
  onSave: (data: Omit<Project, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: k === 'order' ? Number((e.target as HTMLInputElement).value) : e.target.value }))

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 640 }}>
        <div className="admin-modal-header">
          <span>{form.title ? 'Edit Project' : 'Add Project'}</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="admin-form" style={{ overflowY: 'auto', maxHeight: '72vh' }}>
          <label className="admin-label">Number (e.g. "01")</label>
          <input className="admin-input" value={form.num ?? ''} onChange={set('num')} />
          <label className="admin-label">Title</label>
          <input className="admin-input" value={form.title ?? ''} onChange={set('title')} />
          <label className="admin-label">Tagline (serif italic)</label>
          <input className="admin-input" value={form.tagline ?? ''} onChange={set('tagline')} />
          <label className="admin-label">Description</label>
          <textarea className="admin-input" rows={3} value={form.description ?? ''} onChange={set('description')} />
          <label className="admin-label">Bullets (label + text pairs)</label>
          <BulletsEditor value={form.bullets} onChange={bullets => setForm(prev => ({ ...prev, bullets }))} />
          <label className="admin-label" style={{ marginTop: 12 }}>Stack</label>
          <ChipsInput label="" value={form.stack} onChange={stack => setForm(prev => ({ ...prev, stack }))} placeholder="Add tech (Enter)" />
          <label className="admin-label">GitHub URL</label>
          <input className="admin-input" value={form.github_url ?? ''} onChange={set('github_url')} />
          <label className="admin-label">Live URL</label>
          <input className="admin-input" value={form.live_url ?? ''} onChange={set('live_url')} />
          <label className="admin-label">Images</label>
          <ImagesEditor value={form.images} onChange={images => setForm(prev => ({ ...prev, images }))} />
          <label className="admin-label">Order</label>
          <input className="admin-input" type="number" value={form.order} onChange={set('order')} />
        </div>
        <div className="admin-modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function ProjectsPanel({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState(initial)
  const [editing, setEditing] = useState<Project | null>(null)
  const [adding, setAdding] = useState(false)

  const sorted = [...projects].sort((a, b) => a.order - b.order)

  const handleSave = async (data: Omit<Project, 'id'>) => {
    if (editing) {
      const res = await fetch(`/api/admin/projects/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const updated: Project = await res.json()
      setProjects(prev => prev.map(p => p.id === editing.id ? updated : p))
      setEditing(null)
    } else {
      const res = await fetch('/api/admin/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const created: Project = await res.json()
      setProjects(prev => [...prev, created])
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn primary" onClick={() => setAdding(true)}>+ Add Project</button>
      </div>
      <div className="admin-list">
        {sorted.map(p => (
          <div key={p.id} className="admin-list-item">
            <div>
              {p.num && <span className="eyebrow" style={{ marginRight: 8 }}>{p.num}</span>}
              <strong>{p.title}</strong>
              {p.tagline && <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>{p.tagline}</div>}
              {p.images.length > 0 && <div style={{ color: 'var(--ink-4)', fontSize: 11 }}>{p.images.length} image{p.images.length !== 1 ? 's' : ''}</div>}
            </div>
            <div className="admin-item-actions">
              <button className="btn ghost" onClick={() => setEditing(p)}>Edit</button>
              <button className="btn ghost" style={{ color: 'var(--red)' }} onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <div style={{ color: 'var(--ink-3)', padding: '24px 0' }}>No projects yet.</div>}
      </div>
      {(adding || editing) && (
        <ProjectModal
          initial={editing ? { num: editing.num, title: editing.title, tagline: editing.tagline, description: editing.description, bullets: editing.bullets, stack: editing.stack, github_url: editing.github_url, live_url: editing.live_url, images: editing.images, order: editing.order } : EMPTY}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </>
  )
}
