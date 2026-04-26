'use client'
import { useState } from 'react'
import type { CareerEntry } from '@/types'
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

const EMPTY: Omit<CareerEntry, 'id'> = {
  role: '', company: '', company_url: '', date_label: '',
  location: '', is_current: false, bullets: [], stack: [], order: 0
}

export default function CareerPanel({ initial }: { initial: CareerEntry[] }) {
  const [entries, setEntries] = useState(initial)
  const [open, setOpen] = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<string, Partial<CareerEntry>>>({})
  const [confirm, setConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const sorted = [...entries].sort((a, b) => a.order - b.order)
  const getForm = (e: CareerEntry) => ({ ...e, ...(editing[e.id] ?? {}) }) as CareerEntry

  const setField = (id: string, patch: Partial<CareerEntry>) =>
    setEditing(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }))

  const save = async (entry: CareerEntry) => {
    const form = getForm(entry)
    setSaving(entry.id)
    const res = await fetch(`/api/admin/career/${entry.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { showToast('Failed to save'); setSaving(null); return }
    setEntries(prev => prev.map(e => e.id === entry.id ? form : e))
    setEditing(prev => { const n = { ...prev }; delete n[entry.id]; return n })
    setSaving(null)
    setOpen(null)
    showToast('Saved')
  }

  const add = async () => {
    const res = await fetch('/api/admin/career', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...EMPTY, order: entries.length }),
    })
    if (!res.ok) { showToast('Failed to add'); return }
    const created: CareerEntry = await res.json()
    setEntries(prev => [...prev, created])
    setOpen(created.id)
    showToast('Role added')
  }

  const remove = async (id: string) => {
    await fetch(`/api/admin/career/${id}`, { method: 'DELETE' })
    setEntries(prev => prev.filter(e => e.id !== id))
    setConfirm(null)
    if (open === id) setOpen(null)
    showToast('Deleted')
  }

  return (
    <>
      <div className="main-head">
        <div>
          <div className="eyebrow">§ career</div>
          <h1>Career timeline</h1>
          <p>Roles, companies, dates, and accomplishments.</p>
        </div>
        <button className="btn primary" onClick={add}>+ add role</button>
      </div>

      {sorted.length === 0 && (
        <div className="empty">
          <div className="big">No roles yet</div>
          <div className="sub">Add your first job</div>
        </div>
      )}

      {sorted.map(entry => {
        const form = getForm(entry)
        const expanded = open === entry.id
        return (
          <div key={entry.id} className="row-card">
            <div className="summary">
              <div className="info">
                <span className="drag-handle">⋮⋮</span>
                <div>
                  <div className="title">
                    {entry.role}
                    {entry.is_current && <span className="tag-pill good">current</span>}
                  </div>
                  <div className="sub">{entry.company || '—'} · {entry.date_label || ''} · {entry.location || ''}</div>
                </div>
              </div>
              <div className="actions">
                <button className="btn small" onClick={() => setOpen(expanded ? null : entry.id)}>
                  {expanded ? 'close' : 'edit'}
                </button>
                <button className="btn small danger" onClick={() => setConfirm(entry.id)}>delete</button>
              </div>
            </div>

            {expanded && (
              <div className="editor">
                <div className="form-grid">
                  <div className="form-row">
                    <label>Role</label>
                    <input value={form.role ?? ''} onChange={e => setField(entry.id, { role: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Company</label>
                    <input value={form.company ?? ''} onChange={e => setField(entry.id, { company: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Company URL</label>
                    <input className="mono" value={form.company_url ?? ''} onChange={e => setField(entry.id, { company_url: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Dates</label>
                    <input className="mono" value={form.date_label ?? ''} placeholder="Aug 2024 — Present" onChange={e => setField(entry.id, { date_label: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Location</label>
                    <input value={form.location ?? ''} placeholder="Remote" onChange={e => setField(entry.id, { location: e.target.value })} />
                  </div>
                  <div className="form-row" style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
                    <input type="checkbox" id={`current-${entry.id}`} checked={!!form.is_current} onChange={e => setField(entry.id, { is_current: e.target.checked })} style={{ width: 'auto' }} />
                    <label htmlFor={`current-${entry.id}`} style={{ textTransform: 'none', fontSize: 14, color: 'var(--ink)', cursor: 'pointer' }}>Current role</label>
                  </div>
                  <div className="full">
                    <BulletsEditor
                      label="Accomplishments"
                      values={form.bullets || []}
                      onChange={v => setField(entry.id, { bullets: v })}
                    />
                  </div>
                  <div className="full">
                    <ChipsInput
                      label="Tech stack"
                      value={form.stack || []}
                      onChange={v => setField(entry.id, { stack: v })}
                      placeholder="Add technology and press Enter"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn primary" onClick={() => save(entry)} disabled={saving === entry.id}>
                    {saving === entry.id ? 'saving…' : 'save'}
                  </button>
                  <button className="btn ghost" onClick={() => { setOpen(null); setEditing(prev => { const n = { ...prev }; delete n[entry.id]; return n }) }}>
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
          title="Delete role?"
          body={`"${entries.find(e => e.id === confirm)?.role}" will be removed.`}
          onCancel={() => setConfirm(null)}
          onConfirm={() => remove(confirm)}
        />
      )}

      {toast && <div className="toast"><span className="dot" /><span>{toast}</span></div>}
    </>
  )
}

function BulletsEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const set = (i: number, v: string) => { const next = [...values]; next[i] = v; onChange(next) }
  const add = () => onChange([...values, ''])
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i))

  return (
    <div className="form-row">
      <label>{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {values.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: 6 }}>
            <input value={b} onChange={e => set(i, e.target.value)} placeholder="Accomplishment" style={{ flex: 1 }} />
            <button className="btn small danger" onClick={() => remove(i)}>×</button>
          </div>
        ))}
      </div>
      <button className="add-btn" style={{ marginTop: 8 }} onClick={add}>+ add bullet</button>
    </div>
  )
}
