'use client'
import { useState, useRef } from 'react'
import type { Project, ProjectBullet } from '@/types'
import ChipsInput from './ChipsInput'

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

function BulletsEditor({ values, onChange }: { values: ProjectBullet[]; onChange: (v: ProjectBullet[]) => void }) {
  const set = (i: number, k: keyof ProjectBullet, v: string) => {
    const next = [...values]; next[i] = { ...next[i], [k]: v }; onChange(next)
  }
  const add = () => onChange([...values, { b: '', t: '' }])
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i))

  return (
    <div className="form-row">
      <label>Tech details</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {values.map((b, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 6 }}>
            <input value={b.b || ''} onChange={e => set(i, 'b', e.target.value)} placeholder="Label" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '8px 10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', borderRadius: 2, outline: 'none' }} />
            <input value={b.t || ''} onChange={e => set(i, 't', e.target.value)} placeholder="Detail" style={{ padding: '8px 10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', borderRadius: 2, outline: 'none' }} />
            <button className="btn small danger" onClick={() => remove(i)}>×</button>
          </div>
        ))}
      </div>
      <button className="add-btn" style={{ marginTop: 8 }} onClick={add}>+ add detail</button>
    </div>
  )
}

function ImagesEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
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
    <div className="form-row">
      <label>Images</label>
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
        {uploading ? 'Uploading…' : '+ add images'}
      </button>
    </div>
  )
}

const EMPTY: Omit<Project, 'id'> = {
  num: '', title: '', tagline: '', description: '',
  bullets: [], stack: [], github_url: '', live_url: '', images: [], order: 0
}

export default function ProjectsPanel({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState(initial)
  const [open, setOpen] = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<string, Partial<Project>>>({})
  const [confirm, setConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const sorted = [...projects].sort((a, b) => a.order - b.order)
  const getForm = (p: Project) => ({ ...p, ...(editing[p.id] ?? {}) }) as Project

  const setField = (id: string, patch: Partial<Project>) =>
    setEditing(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }))

  const save = async (p: Project) => {
    const form = getForm(p)
    setSaving(p.id)
    const res = await fetch(`/api/admin/projects/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { showToast('Failed to save'); setSaving(null); return }
    setProjects(prev => prev.map(pp => pp.id === p.id ? form : pp))
    setEditing(prev => { const n = { ...prev }; delete n[p.id]; return n })
    setSaving(null)
    setOpen(null)
    showToast('Saved')
  }

  const add = async () => {
    const num = String(projects.length + 1).padStart(2, '0')
    const res = await fetch('/api/admin/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...EMPTY, num, order: projects.length }),
    })
    if (!res.ok) { showToast('Failed to add'); return }
    const created: Project = await res.json()
    setProjects(prev => [...prev, created])
    setOpen(created.id)
    showToast('Project added')
  }

  const remove = async (id: string) => {
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    setProjects(prev => prev.filter(p => p.id !== id))
    setConfirm(null)
    if (open === id) setOpen(null)
    showToast('Deleted')
  }

  return (
    <>
      <div className="main-head">
        <div>
          <div className="eyebrow">§ projects</div>
          <h1>Personal projects</h1>
          <p>Each project shows a description, stack chips, GitHub link, and image gallery.</p>
        </div>
        <button className="btn primary" onClick={add}>+ add project</button>
      </div>

      {sorted.length === 0 && (
        <div className="empty">
          <div className="big">No projects yet</div>
          <div className="sub">Add your first project</div>
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
                    {p.num ? `${p.num} · ` : ''}{p.title}
                    {p.github_url && <span className="tag-pill good">repo</span>}
                    <span className="tag-pill">{(p.stack || []).length} tech</span>
                  </div>
                  <div className="sub">{p.tagline || '—'}</div>
                </div>
              </div>
              <div className="actions">
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
                    <label>Number</label>
                    <input className="mono" value={form.num ?? ''} placeholder="01" onChange={e => setField(p.id, { num: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Title</label>
                    <input value={form.title ?? ''} onChange={e => setField(p.id, { title: e.target.value })} />
                  </div>
                  <div className="full form-row">
                    <label>Tagline</label>
                    <input value={form.tagline ?? ''} placeholder="One-line pitch" onChange={e => setField(p.id, { tagline: e.target.value })} />
                  </div>
                  <div className="full form-row">
                    <label>Description</label>
                    <textarea rows={4} value={form.description ?? ''} onChange={e => setField(p.id, { description: e.target.value })} />
                  </div>
                  <div className="full">
                    <BulletsEditor values={form.bullets || []} onChange={v => setField(p.id, { bullets: v })} />
                  </div>
                  <div className="full">
                    <ChipsInput label="Tech stack" value={form.stack || []} onChange={v => setField(p.id, { stack: v })} />
                  </div>
                  <div className="form-row">
                    <label>GitHub URL</label>
                    <input className="mono" value={form.github_url ?? ''} onChange={e => setField(p.id, { github_url: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Live URL</label>
                    <input className="mono" value={form.live_url ?? ''} onChange={e => setField(p.id, { live_url: e.target.value })} />
                  </div>
                  <div className="full">
                    <ImagesEditor value={form.images || []} onChange={v => setField(p.id, { images: v })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn primary" onClick={() => save(p)} disabled={saving === p.id}>
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
          title="Delete project?"
          body={`"${projects.find(p => p.id === confirm)?.title}" will be removed.`}
          onCancel={() => setConfirm(null)}
          onConfirm={() => remove(confirm)}
        />
      )}

      {toast && <div className="toast"><span className="dot" /><span>{toast}</span></div>}
    </>
  )
}
