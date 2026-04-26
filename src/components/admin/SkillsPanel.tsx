'use client'
import { useState } from 'react'
import type { Skill } from '@/types'

function LevelPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="level-picker" style={{ padding: 0 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" className={n <= value ? 'on' : ''} onClick={() => onChange(n)} aria-label={`Level ${n}`} />
      ))}
      <span className="lbl">{value}/5</span>
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

export default function SkillsPanel({ initial }: { initial: Skill[] }) {
  const [skills, setSkills] = useState(initial)
  const [tab, setTab] = useState(initial[0]?.category ?? '')
  const [newCatName, setNewCatName] = useState('')
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const categories = Array.from(new Set(skills.map(s => s.category))).filter(Boolean)
  const currentCat = tab || categories[0] || ''
  const list = skills.filter(s => s.category === currentCat).sort((a, b) => a.order - b.order)

  const addCategory = () => {
    const name = newCatName.trim()
    if (!name || categories.includes(name)) return
    setTab(name)
    setNewCatName('')
  }

  const renameCategory = async () => {
    const name = prompt('Rename category:', currentCat)?.trim()
    if (!name || name === currentCat || categories.includes(name)) return
    const toRename = skills.filter(s => s.category === currentCat)
    await Promise.all(toRename.map(s =>
      fetch(`/api/admin/skills/${s.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: s.name, level: s.level, category: name, order: s.order }),
      })
    ))
    setSkills(prev => prev.map(s => s.category === currentCat ? { ...s, category: name } : s))
    setTab(name)
    showToast(`Renamed to "${name}"`)
  }

  const deleteCategory = async (cat: string) => {
    const toDelete = skills.filter(s => s.category === cat)
    await Promise.all(toDelete.map(s => fetch(`/api/admin/skills/${s.id}`, { method: 'DELETE' })))
    setSkills(prev => prev.filter(s => s.category !== cat))
    const remaining = categories.filter(c => c !== cat)
    setTab(remaining[0] ?? '')
    setConfirmDeleteCat(null)
    showToast(`Deleted "${cat}"`)
  }

  const addSkill = async () => {
    if (!currentCat) return
    const name = 'New skill'
    const level = 3
    const order = list.length
    const res = await fetch('/api/admin/skills', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, level, category: currentCat, order }),
    })
    if (!res.ok) { showToast('Failed to add skill'); return }
    const created: Skill = await res.json()
    setSkills(prev => [...prev, created])
    showToast('Skill added')
  }

  const updateSkill = async (skill: Skill, name: string, level: number) => {
    setSaving(skill.id)
    const res = await fetch(`/api/admin/skills/${skill.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, level, category: skill.category, order: skill.order }),
    })
    if (!res.ok) { showToast('Failed to save'); setSaving(null); return }
    setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, name, level } : s))
    setSaving(null)
    showToast('Saved')
  }

  const deleteSkill = async (id: string) => {
    await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' })
    setSkills(prev => prev.filter(s => s.id !== id))
    showToast('Deleted')
  }

  const moveSkill = async (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= list.length) return
    const a = [...list]
    ;[a[i], a[j]] = [a[j], a[i]]
    const updates = a.map((s, idx) => ({ ...s, order: idx }))
    setSkills(prev => {
      const map = new Map(updates.map(s => [s.id, s]))
      return prev.map(s => map.get(s.id) ?? s)
    })
    await Promise.all(updates.map(s =>
      fetch(`/api/admin/skills/${s.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: s.name, level: s.level, category: s.category, order: s.order }),
      })
    ))
  }

  return (
    <>
      <div className="main-head">
        <div>
          <div className="eyebrow">§ key skills</div>
          <h1>Skills</h1>
          <p>Group skills by category and set a 1–5 proficiency level.</p>
        </div>
      </div>

      <div className="tabs">
        {categories.map(c => (
          <button key={c} className={c === currentCat ? 'active' : ''} onClick={() => setTab(c)}>
            {c}<span className="n">{skills.filter(s => s.category === c).length}</span>
          </button>
        ))}
      </div>

      <div className="tab-actions">
        <input
          value={newCatName}
          onChange={e => setNewCatName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCategory()}
          placeholder="New category name"
          style={{ padding: '8px 12px', border: '1px solid var(--line)', background: 'var(--bg-elev)', fontFamily: 'var(--font-mono)', fontSize: 12, width: 220, borderRadius: 2, color: 'var(--ink)', outline: 'none' }}
        />
        <button className="btn" onClick={addCategory}>+ add category</button>
        {currentCat && (
          <>
            <button className="btn" onClick={renameCategory}>rename &ldquo;{currentCat}&rdquo;</button>
            <button className="btn danger" onClick={() => setConfirmDeleteCat(currentCat)}>delete &ldquo;{currentCat}&rdquo;</button>
          </>
        )}
        <div style={{ flex: 1 }} />
        <button className="btn primary" onClick={addSkill} disabled={!currentCat}>+ add skill</button>
      </div>

      {!currentCat && (
        <div className="empty">
          <div className="big">No categories</div>
          <div className="sub">Add a category above to get started</div>
        </div>
      )}

      {currentCat && list.length === 0 && (
        <div className="empty">
          <div className="big">Empty category</div>
          <div className="sub">Add skills to &ldquo;{currentCat}&rdquo;</div>
        </div>
      )}

      {list.map((s, i) => (
        <SkillRow
          key={s.id}
          skill={s}
          isFirst={i === 0}
          isLast={i === list.length - 1}
          saving={saving === s.id}
          onSave={(name, level) => updateSkill(s, name, level)}
          onDelete={() => deleteSkill(s.id)}
          onMoveUp={() => moveSkill(i, -1)}
          onMoveDown={() => moveSkill(i, 1)}
        />
      ))}

      {confirmDeleteCat && (
        <ConfirmModal
          title="Delete category?"
          body={`"${confirmDeleteCat}" and all its skills will be removed permanently.`}
          onCancel={() => setConfirmDeleteCat(null)}
          onConfirm={() => deleteCategory(confirmDeleteCat)}
        />
      )}

      {toast && (
        <div className="toast">
          <span className="dot" />
          <span>{toast}</span>
        </div>
      )}
    </>
  )
}

function SkillRow({ skill, isFirst, isLast, saving, onSave, onDelete, onMoveUp, onMoveDown }: {
  skill: Skill
  isFirst: boolean
  isLast: boolean
  saving: boolean
  onSave: (name: string, level: number) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const [name, setName] = useState(skill.name)
  const [level, setLevel] = useState(skill.level)
  const dirty = name !== skill.name || level !== skill.level

  return (
    <div className="row-card">
      <div className="summary" style={{ flex: 1 }}>
        <div className="info">
          <span className="drag-handle">⋮⋮</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--line)', background: 'var(--bg)', fontFamily: 'var(--font-sans)', fontSize: 14, borderRadius: 2, color: 'var(--ink)', outline: 'none', maxWidth: 360 }}
          />
          <LevelPicker value={level} onChange={setLevel} />
        </div>
        <div className="actions">
          {!isFirst && <button className="btn small ghost" onClick={onMoveUp}>↑</button>}
          {!isLast && <button className="btn small ghost" onClick={onMoveDown}>↓</button>}
          {dirty && (
            <button className="btn small primary" onClick={() => onSave(name, level)} disabled={saving}>
              {saving ? '…' : 'save'}
            </button>
          )}
          <button className="btn small danger" onClick={onDelete}>×</button>
        </div>
      </div>
    </div>
  )
}
