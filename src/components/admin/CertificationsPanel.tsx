'use client'
import { useState } from 'react'
import type { Certification } from '@/types'

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

const EMPTY: Omit<Certification, 'id'> = {
  title: '', issuer: '', date_label: '', credential_url: '', description: '', order: 0
}

export default function CertificationsPanel({ initial }: { initial: Certification[] }) {
  const [certs, setCerts] = useState(initial)
  const [open, setOpen] = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<string, Partial<Certification>>>({})
  const [confirm, setConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const sorted = [...certs].sort((a, b) => a.order - b.order)
  const getForm = (c: Certification) => ({ ...c, ...(editing[c.id] ?? {}) }) as Certification
  const setField = (id: string, patch: Partial<Certification>) =>
    setEditing(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }))

  const save = async (c: Certification) => {
    const form = getForm(c)
    setSaving(c.id)
    const res = await fetch(`/api/admin/certifications/${c.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { showToast('Failed to save'); setSaving(null); return }
    setCerts(prev => prev.map(cc => cc.id === c.id ? form : cc))
    setEditing(prev => { const n = { ...prev }; delete n[c.id]; return n })
    setSaving(null)
    setOpen(null)
    showToast('Saved')
  }

  const add = async () => {
    const res = await fetch('/api/admin/certifications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...EMPTY, order: certs.length }),
    })
    if (!res.ok) { showToast('Failed to add'); return }
    const created: Certification = await res.json()
    setCerts(prev => [...prev, created])
    setOpen(created.id)
    showToast('Certification added')
  }

  const remove = async (id: string) => {
    await fetch(`/api/admin/certifications/${id}`, { method: 'DELETE' })
    setCerts(prev => prev.filter(c => c.id !== id))
    setConfirm(null)
    if (open === id) setOpen(null)
    showToast('Deleted')
  }

  return (
    <>
      <div className="main-head">
        <div>
          <div className="eyebrow">§ certifications</div>
          <h1>Certifications</h1>
          <p>Professional credentials and course completions.</p>
        </div>
        <button className="btn primary" onClick={add}>+ add certification</button>
      </div>

      {sorted.length === 0 && (
        <div className="empty">
          <div className="big">No certifications yet</div>
          <div className="sub">Add your first credential</div>
        </div>
      )}

      {sorted.map(c => {
        const form = getForm(c)
        const expanded = open === c.id
        return (
          <div key={c.id} className="row-card">
            <div className="summary">
              <div className="info">
                <span className="drag-handle">⋮⋮</span>
                <div>
                  <div className="title">{c.title}</div>
                  <div className="sub">{c.issuer || '—'} · {c.date_label || ''}</div>
                </div>
              </div>
              <div className="actions">
                {c.credential_url && (
                  <a className="btn small ghost" href={c.credential_url} target="_blank" rel="noreferrer">view</a>
                )}
                <button className="btn small" onClick={() => setOpen(expanded ? null : c.id)}>
                  {expanded ? 'close' : 'edit'}
                </button>
                <button className="btn small danger" onClick={() => setConfirm(c.id)}>delete</button>
              </div>
            </div>

            {expanded && (
              <div className="editor">
                <div className="form-grid">
                  <div className="full form-row">
                    <label>Title</label>
                    <input value={form.title ?? ''} onChange={e => setField(c.id, { title: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Issuer</label>
                    <input value={form.issuer ?? ''} onChange={e => setField(c.id, { issuer: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Date</label>
                    <input className="mono" value={form.date_label ?? ''} placeholder="Mar 2025" onChange={e => setField(c.id, { date_label: e.target.value })} />
                  </div>
                  <div className="full form-row">
                    <label>Credential URL</label>
                    <input className="mono" value={form.credential_url ?? ''} onChange={e => setField(c.id, { credential_url: e.target.value })} />
                  </div>
                  <div className="full form-row">
                    <label>Description</label>
                    <textarea rows={3} value={form.description ?? ''} onChange={e => setField(c.id, { description: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn primary" onClick={() => save(c)} disabled={saving === c.id}>
                    {saving === c.id ? 'saving…' : 'save'}
                  </button>
                  <button className="btn ghost" onClick={() => { setOpen(null); setEditing(prev => { const n = { ...prev }; delete n[c.id]; return n }) }}>
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
          title="Delete certification?"
          body={`"${certs.find(c => c.id === confirm)?.title}" will be removed.`}
          onCancel={() => setConfirm(null)}
          onConfirm={() => remove(confirm)}
        />
      )}

      {toast && <div className="toast"><span className="dot" /><span>{toast}</span></div>}
    </>
  )
}
