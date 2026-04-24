'use client'
import { useState } from 'react'
import FormField from './FormField'
import type { Judge, TrendPoint } from '@/types'

const EMPTY: Omit<Judge, 'id'> = {
  name: '', handle: '', rating: 0, max_rating: 0,
  title: '', title_color: '#38bdf8',
  contests_count: 0, problems_count: 0, trend: [], order: 0,
}

function TrendEditor({ trend, onChange }: { trend: TrendPoint[]; onChange: (t: TrendPoint[]) => void }) {
  function update(i: number, field: keyof TrendPoint, val: string) {
    const next = trend.map((p, j) =>
      j === i ? { ...p, [field]: field === 'rating' ? parseInt(val) || 0 : val } : p
    )
    onChange(next)
  }
  function add() { onChange([...trend, { contest: '', rating: 0 }]) }
  function remove(i: number) { onChange(trend.filter((_, j) => j !== i)) }

  return (
    <div className="field-group">
      <div className="field-label">Rating history (for sparkline)</div>
      <div className="trend-editor">
        {trend.map((p, i) => (
          <div key={i} className="trend-row">
            <input className="field-input" value={p.contest} placeholder="Contest name"
              onChange={(e) => update(i, 'contest', e.target.value)} />
            <input className="field-input" type="number" value={p.rating} placeholder="Rating"
              onChange={(e) => update(i, 'rating', e.target.value)} />
            <button className="admin-action-btn danger" onClick={() => remove(i)}>×</button>
          </div>
        ))}
        <button className="admin-add-btn" onClick={add}>+ Add point</button>
      </div>
    </div>
  )
}

function JudgeModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Omit<Judge, 'id'>
  onSave: (j: Omit<Judge, 'id'>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  function set(key: keyof Omit<Judge, 'id'>, val: unknown) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function submit() {
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="admin-modal-title">{initial.name ? 'Edit Judge' : 'Add Judge'}</h2>
        <div className="admin-form">
          <div className="field-row">
            <FormField label="Platform name" name="name" value={form.name} onChange={(v) => set('name', v)} />
            <FormField label="Handle" name="handle" value={form.handle} onChange={(v) => set('handle', v)} />
          </div>
          <div className="field-row">
            <FormField label="Current rating" name="rating" value={String(form.rating)} onChange={(v) => set('rating', parseInt(v) || 0)} type="number" />
            <FormField label="Peak rating" name="max_rating" value={String(form.max_rating)} onChange={(v) => set('max_rating', parseInt(v) || 0)} type="number" />
          </div>
          <div className="field-row">
            <FormField label="Title (e.g. Master)" name="title" value={form.title} onChange={(v) => set('title', v)} />
            <FormField label="Title colour" name="title_color" value={form.title_color} onChange={(v) => set('title_color', v)} type="color" />
          </div>
          <div className="field-row">
            <FormField label="Contests count" name="contests_count" value={String(form.contests_count)} onChange={(v) => set('contests_count', parseInt(v) || 0)} type="number" />
            <FormField label="Problems solved" name="problems_count" value={String(form.problems_count)} onChange={(v) => set('problems_count', parseInt(v) || 0)} type="number" />
          </div>
          <FormField label="Display order" name="order" value={String(form.order)} onChange={(v) => set('order', parseInt(v) || 0)} type="number" />
          <TrendEditor trend={form.trend} onChange={(t) => set('trend', t)} />
        </div>
        <div className="admin-modal-actions">
          <button className="admin-save-btn" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="admin-action-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function JudgesPanel({ initial }: { initial: Judge[] }) {
  const [judges, setJudges] = useState(initial)
  const [editing, setEditing] = useState<Judge | null>(null)
  const [adding, setAdding] = useState(false)

  async function handleSave(data: Omit<Judge, 'id'>) {
    if (editing) {
      await fetch(`/api/admin/judges/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setJudges((j) => j.map((jj) => jj.id === editing.id ? { ...jj, ...data } : jj))
    } else {
      const res = await fetch('/api/admin/judges', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const created = await res.json()
      setJudges((j) => [...j, created])
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this judge?')) return
    await fetch(`/api/admin/judges/${id}`, { method: 'DELETE' })
    setJudges((j) => j.filter((jj) => jj.id !== id))
  }

  return (
    <>
      <div className="admin-list">
        {judges.map((j) => (
          <div key={j.id} className="admin-list-item">
            <div className="admin-list-item-info">
              <div className="admin-list-item-title" style={{ color: j.title_color }}>
                {j.name}
              </div>
              <div className="admin-list-item-sub">
                @{j.handle} · Peak {j.max_rating} · Current {j.rating} · {j.title}
              </div>
            </div>
            <div className="admin-list-actions">
              <button className="admin-action-btn" onClick={() => { setEditing(j); setAdding(false) }}>Edit</button>
              <button className="admin-action-btn danger" onClick={() => handleDelete(j.id)}>Delete</button>
            </div>
          </div>
        ))}
        <button className="admin-add-btn" onClick={() => { setAdding(true); setEditing(null) }}>
          + Add judge
        </button>
      </div>

      {(adding || editing) && (
        <JudgeModal
          initial={editing ?? EMPTY}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </>
  )
}
