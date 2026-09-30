'use client'
import { useState } from 'react'
import ChipsInput from './ChipsInput'
import { STATUS_LABELS } from '@/lib/publications'
import type { Publication, PublicationStatus } from '@/types'

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

const EMPTY: Omit<Publication, 'id'> = {
  title: '', authors: [], venue: '', year: '', status: 'preprint', abstract: '',
  highlights: [], tags: [], pdf_url: '', arxiv_url: '', doi_url: '', code_url: '',
  bibtex: '', featured: false, order: 0,
}

export default function PublicationsPanel({ initial }: { initial: Publication[] }) {
  const [pubs, setPubs] = useState(initial)
  const [open, setOpen] = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<string, Partial<Publication>>>({})
  const [confirm, setConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const sorted = [...pubs].sort((a, b) => a.order - b.order)
  const getForm = (p: Publication) => ({ ...p, ...(editing[p.id] ?? {}) }) as Publication
  const setField = (id: string, patch: Partial<Publication>) =>
    setEditing(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }))

  const save = async (p: Publication) => {
    const form = getForm(p)
    setSaving(p.id)
    const res = await fetch(`/api/admin/publications/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { showToast('Failed to save'); setSaving(null); return }
    setPubs(prev => prev.map(pp => pp.id === p.id ? form : pp))
    setEditing(prev => { const n = { ...prev }; delete n[p.id]; return n })
    setSaving(null)
    setOpen(null)
    showToast('Saved')
  }

  const add = async () => {
    const res = await fetch('/api/admin/publications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...EMPTY, title: 'Untitled paper', order: pubs.length }),
    })
    if (!res.ok) { showToast('Failed to add'); return }
    const created: Publication = await res.json()
    setPubs(prev => [...prev, created])
    setOpen(created.id)
    showToast('Publication added')
  }

  const remove = async (id: string) => {
    await fetch(`/api/admin/publications/${id}`, { method: 'DELETE' })
    setPubs(prev => prev.filter(p => p.id !== id))
    setConfirm(null)
    if (open === id) setOpen(null)
    showToast('Deleted')
  }

  return (
    <>
      <div className="main-head">
        <div>
          <div className="eyebrow">§ research</div>
          <h1>Publications</h1>
          <p>Papers, preprints and theses. Research summary and interests live on the Profile page.</p>
        </div>
        <button className="btn primary" onClick={add}>+ add publication</button>
      </div>

      {sorted.length === 0 && (
        <div className="empty">
          <div className="big">No publications yet</div>
          <div className="sub">Add your first paper or preprint</div>
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
                  <div className="title">{p.featured ? '★ ' : ''}{p.title}</div>
                  <div className="sub">{STATUS_LABELS[p.status] ?? p.status} · {p.venue || '—'} · {p.year || ''}</div>
                </div>
              </div>
              <div className="actions">
                {p.pdf_url && (
                  <a className="btn small ghost" href={p.pdf_url} target="_blank" rel="noreferrer">pdf</a>
                )}
                <button className="btn small" onClick={() => setOpen(expanded ? null : p.id)}>
                  {expanded ? 'close' : 'edit'}
                </button>
                <button className="btn small danger" onClick={() => setConfirm(p.id)}>delete</button>
              </div>
            </div>

            {expanded && (
              <div className="editor">
                <div className="form-grid">
                  <div className="full form-row">
                    <label>Title</label>
                    <input value={form.title ?? ''} onChange={e => setField(p.id, { title: e.target.value })} />
                  </div>
                  <div className="full">
                    <ChipsInput
                      label="Authors (in order — your name is highlighted automatically)"
                      value={form.authors ?? []}
                      onChange={v => setField(p.id, { authors: v })}
                      placeholder="Add author and press Enter"
                    />
                  </div>
                  <div className="form-row">
                    <label>Venue</label>
                    <input value={form.venue ?? ''} placeholder="arXiv / ACL 2026 / B.Sc. thesis, RUET" onChange={e => setField(p.id, { venue: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Year</label>
                    <input className="mono" value={form.year ?? ''} placeholder="2026" onChange={e => setField(p.id, { year: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setField(p.id, { status: e.target.value as PublicationStatus })}>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-row">
                    <label>Featured</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 0 }}>
                      <input type="checkbox" style={{ width: 'auto' }} checked={!!form.featured} onChange={e => setField(p.id, { featured: e.target.checked })} />
                      Show expanded with key findings
                    </label>
                  </div>
                  <div className="full form-row">
                    <label>Abstract</label>
                    <textarea rows={5} value={form.abstract ?? ''} onChange={e => setField(p.id, { abstract: e.target.value })} />
                  </div>
                  <div className="full">
                    <ChipsInput
                      label="Key findings (one-liners a reviewer can skim)"
                      value={form.highlights ?? []}
                      onChange={v => setField(p.id, { highlights: v })}
                      placeholder="Add finding and press Enter"
                    />
                  </div>
                  <div className="full">
                    <ChipsInput
                      label="Tags"
                      value={form.tags ?? []}
                      onChange={v => setField(p.id, { tags: v })}
                      placeholder="Vision-Language, Low-resource NLP…"
                    />
                  </div>
                  <div className="form-row">
                    <label>PDF URL</label>
                    <input className="mono" value={form.pdf_url ?? ''} onChange={e => setField(p.id, { pdf_url: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>arXiv URL</label>
                    <input className="mono" value={form.arxiv_url ?? ''} onChange={e => setField(p.id, { arxiv_url: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>DOI URL</label>
                    <input className="mono" value={form.doi_url ?? ''} onChange={e => setField(p.id, { doi_url: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Code URL</label>
                    <input className="mono" value={form.code_url ?? ''} onChange={e => setField(p.id, { code_url: e.target.value })} />
                  </div>
                  <div className="full form-row">
                    <label>BibTeX</label>
                    <textarea className="mono" rows={5} value={form.bibtex ?? ''} onChange={e => setField(p.id, { bibtex: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Order</label>
                    <input type="number" className="mono" value={form.order ?? 0} onChange={e => setField(p.id, { order: parseInt(e.target.value) || 0 })} />
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
          title="Delete publication?"
          body={`"${pubs.find(p => p.id === confirm)?.title}" will be removed.`}
          onCancel={() => setConfirm(null)}
          onConfirm={() => remove(confirm)}
        />
      )}

      {toast && <div className="toast"><span className="dot" /><span>{toast}</span></div>}
    </>
  )
}
