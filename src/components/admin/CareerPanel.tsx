'use client'
import { useState } from 'react'
import type { CareerEntry } from '@/types'
import ChipsInput from './ChipsInput'

const EMPTY: Omit<CareerEntry, 'id'> = {
  role: '', company: '', company_url: '', date_label: '',
  location: '', is_current: false, bullets: [], stack: [], order: 0
}

function CareerModal({ initial, onSave, onClose }: {
  initial: Omit<CareerEntry, 'id'>
  onSave: (data: Omit<CareerEntry, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const [bulletInput, setBulletInput] = useState('')

  const set = <K extends keyof typeof form>(k: K) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: k === 'order' ? Number(e.target.value) : e.target.value }))

  const addBullet = () => {
    if (!bulletInput.trim()) return
    setForm(prev => ({ ...prev, bullets: [...prev.bullets, bulletInput.trim()] }))
    setBulletInput('')
  }

  const removeBullet = (i: number) =>
    setForm(prev => ({ ...prev, bullets: prev.bullets.filter((_, j) => j !== i) }))

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 600 }}>
        <div className="admin-modal-header">
          <span>{form.role ? 'Edit Role' : 'Add Role'}</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="admin-form" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
          <label className="admin-label">Role / Title</label>
          <input className="admin-input" value={form.role ?? ''} onChange={set('role')} />
          <label className="admin-label">Company</label>
          <input className="admin-input" value={form.company ?? ''} onChange={set('company')} />
          <label className="admin-label">Company URL</label>
          <input className="admin-input" value={form.company_url ?? ''} onChange={set('company_url')} />
          <label className="admin-label">Date Label (e.g. "Jan 2024 – Present")</label>
          <input className="admin-input" value={form.date_label ?? ''} onChange={set('date_label')} />
          <label className="admin-label">Location</label>
          <input className="admin-input" value={form.location ?? ''} onChange={set('location')} />
          <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.is_current} onChange={e => setForm(prev => ({ ...prev, is_current: e.target.checked }))} />
            Current role
          </label>
          <label className="admin-label">Bullets</label>
          <div style={{ marginBottom: 8 }}>
            {form.bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <span style={{ flex: 1, fontSize: 13 }}>{b}</span>
                <button className="btn ghost" style={{ fontSize: 11 }} onClick={() => removeBullet(i)}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="admin-input" style={{ flex: 1 }} placeholder="Add bullet point" value={bulletInput} onChange={e => setBulletInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBullet()} />
            <button className="btn ghost" onClick={addBullet}>+</button>
          </div>
          <label className="admin-label" style={{ marginTop: 12 }}>Stack</label>
          <ChipsInput label="" value={form.stack} onChange={stack => setForm(prev => ({ ...prev, stack }))} placeholder="Add tech (Enter)" />
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

export default function CareerPanel({ initial }: { initial: CareerEntry[] }) {
  const [entries, setEntries] = useState(initial)
  const [editing, setEditing] = useState<CareerEntry | null>(null)
  const [adding, setAdding] = useState(false)

  const sorted = [...entries].sort((a, b) => a.order - b.order)

  const handleSave = async (data: Omit<CareerEntry, 'id'>) => {
    if (editing) {
      const res = await fetch(`/api/admin/career/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const updated: CareerEntry = await res.json()
      setEntries(prev => prev.map(e => e.id === editing.id ? updated : e))
      setEditing(null)
    } else {
      const res = await fetch('/api/admin/career', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const created: CareerEntry = await res.json()
      setEntries(prev => [...prev, created])
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this career entry?')) return
    await fetch(`/api/admin/career/${id}`, { method: 'DELETE' })
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn primary" onClick={() => setAdding(true)}>+ Add Role</button>
      </div>
      <div className="admin-list">
        {sorted.map(e => (
          <div key={e.id} className="admin-list-item">
            <div>
              {e.is_current && <span className="chip" style={{ marginRight: 8, color: 'var(--accent)' }}>Current</span>}
              <strong>{e.role}</strong>
              {e.company && <span style={{ color: 'var(--ink-3)', marginLeft: 8 }}>@ {e.company}</span>}
              {e.date_label && <div style={{ color: 'var(--ink-4)', fontSize: 12 }}>{e.date_label}</div>}
              {e.location && <div style={{ color: 'var(--ink-4)', fontSize: 12 }}>{e.location}</div>}
            </div>
            <div className="admin-item-actions">
              <button className="btn ghost" onClick={() => setEditing(e)}>Edit</button>
              <button className="btn ghost" style={{ color: 'var(--red)' }} onClick={() => handleDelete(e.id)}>Delete</button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <div style={{ color: 'var(--ink-3)', padding: '24px 0' }}>No career entries yet.</div>}
      </div>
      {(adding || editing) && (
        <CareerModal
          initial={editing ? { role: editing.role, company: editing.company, company_url: editing.company_url, date_label: editing.date_label, location: editing.location, is_current: editing.is_current, bullets: editing.bullets, stack: editing.stack, order: editing.order } : EMPTY}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </>
  )
}
