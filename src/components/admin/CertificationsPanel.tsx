'use client'
import { useState } from 'react'
import type { Certification } from '@/types'

const EMPTY: Omit<Certification, 'id'> = {
  title: '', issuer: '', date_label: '', credential_url: '', description: '', order: 0
}

function CertModal({ initial, onSave, onClose }: {
  initial: Omit<Certification, 'id'>
  onSave: (data: Omit<Certification, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: k === 'order' ? Number((e.target as HTMLInputElement).value) : e.target.value }))

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <span>{form.title ? 'Edit Certification' : 'Add Certification'}</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="admin-form">
          <label className="admin-label">Title</label>
          <input className="admin-input" value={form.title} onChange={set('title')} />
          <label className="admin-label">Issuer</label>
          <input className="admin-input" value={form.issuer ?? ''} onChange={set('issuer')} />
          <label className="admin-label">Date Label (e.g. "Mar 2025")</label>
          <input className="admin-input" value={form.date_label ?? ''} onChange={set('date_label')} />
          <label className="admin-label">Credential URL</label>
          <input className="admin-input" value={form.credential_url ?? ''} onChange={set('credential_url')} />
          <label className="admin-label">Description</label>
          <textarea className="admin-input" rows={3} value={form.description ?? ''} onChange={set('description')} />
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

export default function CertificationsPanel({ initial }: { initial: Certification[] }) {
  const [certs, setCerts] = useState(initial)
  const [editing, setEditing] = useState<Certification | null>(null)
  const [adding, setAdding] = useState(false)

  const sorted = [...certs].sort((a, b) => a.order - b.order)

  const handleSave = async (data: Omit<Certification, 'id'>) => {
    if (editing) {
      const res = await fetch(`/api/admin/certifications/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const updated: Certification = await res.json()
      setCerts(prev => prev.map(c => c.id === editing.id ? updated : c))
      setEditing(null)
    } else {
      const res = await fetch('/api/admin/certifications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const created: Certification = await res.json()
      setCerts(prev => [...prev, created])
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certification?')) return
    await fetch(`/api/admin/certifications/${id}`, { method: 'DELETE' })
    setCerts(prev => prev.filter(c => c.id !== id))
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn primary" onClick={() => setAdding(true)}>+ Add Certification</button>
      </div>
      <div className="admin-list">
        {sorted.map(c => (
          <div key={c.id} className="admin-list-item">
            <div>
              <strong>{c.title}</strong>
              {c.issuer && <span style={{ color: 'var(--ink-3)', marginLeft: 8 }}>{c.issuer}</span>}
              {c.date_label && <div style={{ color: 'var(--ink-4)', fontSize: 12 }}>{c.date_label}</div>}
              {c.description && <div style={{ color: 'var(--ink-3)', fontSize: 12, marginTop: 2 }}>{c.description}</div>}
            </div>
            <div className="admin-item-actions">
              {c.credential_url && (
                <a className="btn ghost" href={c.credential_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>View</a>
              )}
              <button className="btn ghost" onClick={() => setEditing(c)}>Edit</button>
              <button className="btn ghost" style={{ color: 'var(--red)' }} onClick={() => handleDelete(c.id)}>Delete</button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <div style={{ color: 'var(--ink-3)', padding: '24px 0' }}>No certifications yet.</div>}
      </div>
      {(adding || editing) && (
        <CertModal
          initial={editing ? { title: editing.title, issuer: editing.issuer, date_label: editing.date_label, credential_url: editing.credential_url, description: editing.description, order: editing.order } : EMPTY}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </>
  )
}
