'use client'
import { useState } from 'react'
import type { Contest } from '@/types'

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

export default function ContestsPanel({ initial }: { initial: Contest[] }) {
  const [contests, setContests] = useState(initial)
  const [tab, setTab] = useState<'team' | 'individual'>('team')
  const [open, setOpen] = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<string, Partial<Contest>>>({})
  const [confirm, setConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const visible = contests.filter(c => c.type === tab).sort((a, b) => a.order - b.order)
  const getForm = (c: Contest) => ({ ...c, ...(editing[c.id] ?? {}) })

  const setField = (id: string, patch: Partial<Contest>) =>
    setEditing(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }))

  const save = async (c: Contest) => {
    const form = getForm(c)
    setSaving(c.id)
    const res = await fetch(`/api/admin/contests/${c.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { showToast('Failed to save'); setSaving(null); return }
    setContests(prev => prev.map(cc => cc.id === c.id ? { ...cc, ...form } as Contest : cc))
    setEditing(prev => { const n = { ...prev }; delete n[c.id]; return n })
    setSaving(null)
    setOpen(null)
    showToast('Saved')
  }

  const add = async () => {
    const res = await fetch('/api/admin/contests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: tab, rank: 1, title: 'New contest', sub: '', year: '', position: '', order: visible.length }),
    })
    if (!res.ok) { showToast('Failed to add'); return }
    const created: Contest = await res.json()
    setContests(prev => [...prev, created])
    setOpen(created.id)
    showToast('Contest added')
  }

  const remove = async (id: string) => {
    await fetch(`/api/admin/contests/${id}`, { method: 'DELETE' })
    setContests(prev => prev.filter(c => c.id !== id))
    setConfirm(null)
    if (open === id) setOpen(null)
    showToast('Deleted')
  }

  const teamCount = contests.filter(c => c.type === 'team').length
  const indCount = contests.filter(c => c.type === 'individual').length

  return (
    <>
      <div className="main-head">
        <div>
          <div className="eyebrow">§ contests</div>
          <h1>Contest achievements</h1>
          <p>ICPC, hackathons, and online rounds — team and individual.</p>
        </div>
        <button className="btn primary" onClick={add}>+ add contest</button>
      </div>

      <div className="tabs">
        <button className={tab === 'team' ? 'active' : ''} onClick={() => { setTab('team'); setOpen(null) }}>
          Team<span className="n">{teamCount}</span>
        </button>
        <button className={tab === 'individual' ? 'active' : ''} onClick={() => { setTab('individual'); setOpen(null) }}>
          Individual<span className="n">{indCount}</span>
        </button>
      </div>

      {visible.length === 0 && (
        <div className="empty">
          <div className="big">No {tab} contests yet</div>
          <div className="sub">Add your first result</div>
        </div>
      )}

      {visible.map(c => {
        const form = getForm(c)
        const expanded = open === c.id
        return (
          <div key={c.id} className="row-card">
            <div className="summary">
              <div className="info">
                <span className="drag-handle">⋮⋮</span>
                <div>
                  <div className="title">
                    {c.title}
                    {c.position && <span className="tag-pill position">{c.position}</span>}
                  </div>
                  <div className="sub">#{c.rank} · {c.year} · {c.sub || '—'}</div>
                </div>
              </div>
              <div className="actions">
                <button className="btn small" onClick={() => setOpen(expanded ? null : c.id)}>
                  {expanded ? 'close' : 'edit'}
                </button>
                <button className="btn small danger" onClick={() => setConfirm(c.id)}>delete</button>
              </div>
            </div>

            {expanded && (
              <div className="editor">
                <div className="form-grid">
                  <div className="form-row">
                    <label>Rank</label>
                    <input type="number" value={form.rank ?? ''} onChange={e => setField(c.id, { rank: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="form-row">
                    <label>Year</label>
                    <input className="mono" value={form.year ?? ''} onChange={e => setField(c.id, { year: e.target.value })} />
                  </div>
                  <div className="full form-row">
                    <label>Title</label>
                    <input value={form.title ?? ''} onChange={e => setField(c.id, { title: e.target.value })} />
                  </div>
                  <div className="full form-row">
                    <label>Subtitle / team / detail</label>
                    <input value={form.sub ?? ''} onChange={e => setField(c.id, { sub: e.target.value })} />
                  </div>
                  <div className="full form-row">
                    <label>Position / accolade</label>
                    <input value={form.position ?? ''} placeholder='e.g. "Champion", "Silver medal", "Top 10"' onChange={e => setField(c.id, { position: e.target.value })} />
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
          title="Delete contest?"
          body={`"${contests.find(c => c.id === confirm)?.title}" will be removed.`}
          onCancel={() => setConfirm(null)}
          onConfirm={() => remove(confirm)}
        />
      )}

      {toast && (
        <div className="toast"><span className="dot" /><span>{toast}</span></div>
      )}
    </>
  )
}
