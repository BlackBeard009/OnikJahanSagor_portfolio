'use client'
import { useState } from 'react'
import type { Contest } from '@/types'

const EMPTY_TEAM: Omit<Contest, 'id'> = { type: 'team', rank: 0, title: '', sub: '', year: '', position: '', order: 0 }
const EMPTY_IND: Omit<Contest, 'id'> = { ...EMPTY_TEAM, type: 'individual' }

function ContestModal({ initial, onSave, onClose }: {
  initial: Omit<Contest, 'id'>
  onSave: (data: Omit<Contest, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: k === 'rank' || k === 'order' ? Number(e.target.value) : e.target.value }))
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <span>{initial.title ? 'Edit Contest' : 'Add Contest'}</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="admin-form">
          <label className="admin-label">Rank</label>
          <input className="admin-input" type="number" value={form.rank ?? ''} onChange={set('rank')} />
          <label className="admin-label">Title</label>
          <input className="admin-input" value={form.title ?? ''} onChange={set('title')} />
          <label className="admin-label">Sub-label</label>
          <input className="admin-input" value={form.sub ?? ''} onChange={set('sub')} />
          <label className="admin-label">Year</label>
          <input className="admin-input" value={form.year ?? ''} onChange={set('year')} />
          <label className="admin-label">Position / Award</label>
          <input className="admin-input" value={form.position ?? ''} onChange={set('position')} />
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

export default function ContestsPanel({ initial }: { initial: Contest[] }) {
  const [contests, setContests] = useState(initial)
  const [tab, setTab] = useState<'team' | 'individual'>('team')
  const [editing, setEditing] = useState<Contest | null>(null)
  const [adding, setAdding] = useState(false)

  const visible = contests.filter(c => c.type === tab).sort((a, b) => a.order - b.order)

  const handleSave = async (data: Omit<Contest, 'id'>) => {
    const full = { ...data, type: tab }
    if (editing) {
      const res = await fetch(`/api/admin/contests/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(full)
      })
      const updated: Contest = await res.json()
      setContests(prev => prev.map(c => c.id === editing.id ? updated : c))
      setEditing(null)
    } else {
      const res = await fetch('/api/admin/contests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(full)
      })
      const created: Contest = await res.json()
      setContests(prev => [...prev, created])
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contest?')) return
    await fetch(`/api/admin/contests/${id}`, { method: 'DELETE' })
    setContests(prev => prev.filter(c => c.id !== id))
  }

  return (
    <>
      <div className="admin-tabs">
        {(['team', 'individual'] as const).map(t => (
          <button key={t} className={`admin-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'team' ? 'Team' : 'Individual'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn primary" onClick={() => setAdding(true)}>+ Add {tab}</button>
      </div>
      <div className="admin-list">
        {visible.map(c => (
          <div key={c.id} className="admin-list-item">
            <div>
              <span className="admin-list-num">#{c.rank}</span>
              <strong>{c.title}</strong>
              {c.position && <span className="chip" style={{ marginLeft: 8 }}>{c.position}</span>}
              {c.year && <span style={{ color: 'var(--ink-3)', marginLeft: 8, fontSize: 12 }}>{c.year}</span>}
              {c.sub && <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>{c.sub}</div>}
            </div>
            <div className="admin-item-actions">
              <button className="btn ghost" onClick={() => setEditing(c)}>Edit</button>
              <button className="btn ghost" style={{ color: 'var(--red)' }} onClick={() => handleDelete(c.id)}>Delete</button>
            </div>
          </div>
        ))}
        {visible.length === 0 && <div style={{ color: 'var(--ink-3)', padding: '24px 0' }}>No {tab} contests yet.</div>}
      </div>
      {(adding || editing) && (
        <ContestModal
          initial={editing ? { type: editing.type, rank: editing.rank, title: editing.title, sub: editing.sub, year: editing.year, position: editing.position, order: editing.order } : (tab === 'team' ? EMPTY_TEAM : EMPTY_IND)}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </>
  )
}
