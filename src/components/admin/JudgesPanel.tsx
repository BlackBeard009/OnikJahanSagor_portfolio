'use client'
import { useState } from 'react'
import type { Judge, TrendPoint } from '@/types'

function Toast({ msg }: { msg: string }) {
  return (
    <div className="toast">
      <span className="dot" />
      <span>{msg}</span>
    </div>
  )
}

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

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', mono }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string; mono?: boolean
}) {
  return (
    <FormRow label={label}>
      <input
        type={type}
        className={mono ? 'mono' : ''}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      />
    </FormRow>
  )
}

function TrendEditor({ trend, onChange }: { trend: TrendPoint[]; onChange: (t: TrendPoint[]) => void }) {
  const update = (i: number, field: keyof TrendPoint, val: string) => {
    onChange(trend.map((p, j) => j === i ? { ...p, [field]: field === 'rating' ? (parseInt(val) || 0) : val } : p))
  }
  const add = () => onChange([...trend, { contest: `Contest ${trend.length + 1}`, rating: trend[trend.length - 1]?.rating ?? 1500 }])
  const remove = (i: number) => onChange(trend.filter((_, j) => j !== i))

  const ratings = trend.map(p => p.rating).filter(r => !isNaN(r))
  const min = ratings.length ? Math.min(...ratings) : 0
  const max = ratings.length ? Math.max(...ratings) : 0

  return (
    <div className="form-row">
      <label>Rating history — sparkline</label>
      {ratings.length > 0 && (
        <div style={{ border: '1px solid var(--line)', background: 'var(--bg)', padding: 12, borderRadius: 2, marginBottom: 8 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', marginBottom: 6 }}>
            {ratings.length} points · min {min} · max {max}
          </div>
          <SparklinePreview data={ratings} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {trend.map((pt, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: 6 }}>
            <input value={pt.contest} onChange={e => update(i, 'contest', e.target.value)} placeholder={`Contest ${i + 1}`} style={{ padding: '8px 10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: 13, borderRadius: 2, outline: 'none' }} />
            <input type="number" value={pt.rating} onChange={e => update(i, 'rating', e.target.value)} className="mono" style={{ padding: '8px 10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 12, borderRadius: 2, outline: 'none' }} />
            <button className="btn small danger" onClick={() => remove(i)}>×</button>
          </div>
        ))}
      </div>
      <button className="add-btn" style={{ marginTop: 8 }} onClick={add}>+ add point</button>
    </div>
  )
}

function SparklinePreview({ data }: { data: number[] }) {
  if (!data.length) return null
  const w = 640, h = 60, pad = 4
  const min = Math.min(...data), max = Math.max(...data)
  const range = (max - min) || 1
  const pts = data.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return [x, y]
  })
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 60, display: 'block' }}>
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill="var(--accent)" />)}
    </svg>
  )
}

const EMPTY: Omit<Judge, 'id'> = {
  name: '', handle: '', rating: 0, max_rating: 0,
  title: '', title_color: '#38bdf8',
  contests_count: 0, problems_count: 0, trend: [], order: 0,
}

export default function JudgesPanel({ initial }: { initial: Judge[] }) {
  const [judges, setJudges] = useState(initial)
  const [open, setOpen] = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<string, Judge>>({})
  const [confirm, setConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const getForm = (j: Judge) => editing[j.id] ?? j

  const setForm = (id: string, patch: Partial<Judge>) =>
    setEditing(prev => ({ ...prev, [id]: { ...(prev[id] ?? judges.find(j => j.id === id)!), ...patch } }))

  const save = async (j: Judge) => {
    const form = getForm(j)
    setSaving(j.id)
    const res = await fetch(`/api/admin/judges/${j.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name, handle: form.handle, rating: form.rating, max_rating: form.max_rating,
        title: form.title, title_color: form.title_color,
        contests_count: form.contests_count, problems_count: form.problems_count,
        trend: form.trend, order: form.order,
      }),
    })
    if (!res.ok) { showToast('Failed to save'); setSaving(null); return }
    setJudges(prev => prev.map(jj => jj.id === j.id ? form : jj))
    setEditing(prev => { const n = { ...prev }; delete n[j.id]; return n })
    setSaving(null)
    setOpen(null)
    showToast('Saved')
  }

  const add = async () => {
    const res = await fetch('/api/admin/judges', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...EMPTY, order: judges.length }),
    })
    if (!res.ok) { showToast('Failed to add judge'); return }
    const created: Judge = await res.json()
    setJudges(prev => [...prev, created])
    setOpen(created.id)
    showToast('Judge added')
  }

  const remove = async (id: string) => {
    await fetch(`/api/admin/judges/${id}`, { method: 'DELETE' })
    setJudges(prev => prev.filter(j => j.id !== id))
    setConfirm(null)
    if (open === id) setOpen(null)
    showToast('Deleted')
  }

  const totalContests = judges.reduce((a, j) => a + (j.contests_count || 0), 0)
  const totalProblems = judges.reduce((a, j) => a + (j.problems_count || 0), 0)
  const highestRating = judges.reduce((a, j) => Math.max(a, j.max_rating || 0), 0)

  return (
    <>
      <div className="main-head">
        <div>
          <div className="eyebrow">§ online judges</div>
          <h1>Judge ratings</h1>
          <p>Online judge handles, current rating, peak, and contest history.</p>
        </div>
        <button className="btn primary" onClick={add}>+ add judge</button>
      </div>

      <div className="stats-grid">
        <div className="stat"><div className="k">Judges</div><div className="v">{judges.length}</div></div>
        <div className="stat"><div className="k">Total contests</div><div className="v">{totalContests}</div></div>
        <div className="stat"><div className="k">Total solved</div><div className="v">{totalProblems.toLocaleString()}</div></div>
        <div className="stat"><div className="k">Highest rating</div><div className="v">{highestRating || '—'}</div></div>
      </div>

      {judges.length === 0 && (
        <div className="empty">
          <div className="big">No judges yet</div>
          <div className="sub">Add one to get started</div>
        </div>
      )}

      {judges.map((j, i) => {
        const form = getForm(j)
        const expanded = open === j.id
        return (
          <div key={j.id} className="row-card">
            <div className="summary">
              <div className="info">
                <span className="drag-handle">⋮⋮</span>
                <div>
                  <div className="title">
                    {j.name}
                    <span className="tag-pill">#{i + 1}</span>
                  </div>
                  <div className="sub">@{j.handle} · {j.rating} (max {j.max_rating}) · {j.title}</div>
                </div>
              </div>
              <div className="actions">
                <button className="btn small" onClick={() => setOpen(expanded ? null : j.id)}>
                  {expanded ? 'close' : 'edit'}
                </button>
                <button className="btn small danger" onClick={() => setConfirm(j.id)}>delete</button>
              </div>
            </div>

            {expanded && (
              <div className="editor">
                <div className="form-grid">
                  <Field label="Platform" value={form.name} onChange={v => setForm(j.id, { name: v })} />
                  <Field label="Handle" mono value={form.handle} onChange={v => setForm(j.id, { handle: v })} />
                  <Field label="Current rating" type="number" value={form.rating} onChange={v => setForm(j.id, { rating: parseInt(v) || 0 })} />
                  <Field label="Peak rating" type="number" value={form.max_rating} onChange={v => setForm(j.id, { max_rating: parseInt(v) || 0 })} />
                  <Field label="Title / rank" value={form.title} onChange={v => setForm(j.id, { title: v })} />
                  <Field label="Title color" mono value={form.title_color} onChange={v => setForm(j.id, { title_color: v })} />
                  <Field label="Contests" type="number" value={form.contests_count} onChange={v => setForm(j.id, { contests_count: parseInt(v) || 0 })} />
                  <Field label="Problems solved" type="number" value={form.problems_count} onChange={v => setForm(j.id, { problems_count: parseInt(v) || 0 })} />
                  <div className="full">
                    <TrendEditor trend={form.trend || []} onChange={t => setForm(j.id, { trend: t })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn primary" onClick={() => save(j)} disabled={saving === j.id}>
                    {saving === j.id ? 'saving…' : 'save'}
                  </button>
                  <button className="btn ghost" onClick={() => { setOpen(null); setEditing(prev => { const n = { ...prev }; delete n[j.id]; return n }) }}>
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
          title="Delete judge?"
          body={`"${judges.find(j => j.id === confirm)?.name}" will be removed.`}
          onCancel={() => setConfirm(null)}
          onConfirm={() => remove(confirm)}
        />
      )}

      {toast && <Toast msg={toast} />}
    </>
  )
}
