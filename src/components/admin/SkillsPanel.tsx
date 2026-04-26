'use client'
import { useState } from 'react'
import type { Skill } from '@/types'

function SkillRow({ skill, onUpdate, onDelete }: {
  skill: Skill
  onUpdate: (s: Skill) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(skill.name)
  const [level, setLevel] = useState(skill.level)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/skills/${skill.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, level, category: skill.category, order: skill.order }),
      })
      if (!res.ok) throw new Error('Failed to save')
      onUpdate({ ...skill, name, level })
      setEditing(false)
    } catch {
      alert('Failed to save skill.')
    } finally {
      setSaving(false)
    }
  }

  if (editing) return (
    <div className="admin-skill-row editing">
      <input
        className="admin-input"
        style={{ flex: 1 }}
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && save()}
        autoFocus
      />
      <div style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4,5].map(d => (
          <button key={d} className={`skill-dot-btn${level >= d ? ' filled' : ''}`} onClick={() => setLevel(d)}>
            {d <= level ? '◆' : '◇'}
          </button>
        ))}
      </div>
      <button className="btn primary" style={{ fontSize: 12 }} onClick={save} disabled={saving}>
        {saving ? '…' : 'Save'}
      </button>
      <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => { setEditing(false); setName(skill.name); setLevel(skill.level) }}>
        Cancel
      </button>
    </div>
  )

  return (
    <div className="admin-skill-row">
      <span style={{ flex: 1 }}>{skill.name}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 2, color: 'var(--accent)' }}>
        {'◆'.repeat(skill.level)}{'◇'.repeat(5 - skill.level)}
      </span>
      <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => setEditing(true)}>Edit</button>
      <button className="btn ghost" style={{ fontSize: 12, color: 'var(--red)' }} onClick={() => onDelete(skill.id)}>×</button>
    </div>
  )
}

export default function SkillsPanel({ initial }: { initial: Skill[] }) {
  const [skills, setSkills] = useState(initial)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [newName, setNewName] = useState('')
  const [newLevel, setNewLevel] = useState(3)
  const [addingCategory, setAddingCategory] = useState(false)
  const [catName, setCatName] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const savedCategories = Array.from(new Set(skills.map(s => s.category)))
  // Include the activeCategory even if no skills saved under it yet
  const categories = activeCategory && !savedCategories.includes(activeCategory)
    ? [...savedCategories, activeCategory]
    : savedCategories
  const current = activeCategory || categories[0] || ''
  const visible = skills.filter(s => s.category === current).sort((a, b) => a.order - b.order)

  const handleUpdate = (updated: Skill) =>
    setSkills(prev => prev.map(s => s.id === updated.id ? updated : s))

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return
    const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' })
    if (!res.ok) { alert('Failed to delete skill.'); return }
    setSkills(prev => prev.filter(s => s.id !== id))
  }

  const handleAddSkill = async () => {
    if (!newName.trim() || !current) return
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/admin/skills', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), level: newLevel, category: current, order: visible.length }),
      })
      if (!res.ok) throw new Error('API error')
      const created: Skill = await res.json()
      setSkills(prev => [...prev, created])
      setNewName('')
      setNewLevel(3)
    } catch {
      setError('Failed to add skill. Make sure you are signed in.')
    } finally {
      setAdding(false)
    }
  }

  const confirmCategory = () => {
    if (!catName.trim()) return
    setActiveCategory(catName.trim())
    setAddingCategory(false)
    setCatName('')
  }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Category sidebar */}
      <div style={{ width: 180, flexShrink: 0 }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`admin-cat-btn${current === cat ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
        {addingCategory ? (
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            <input
              className="admin-input"
              style={{ flex: 1, fontSize: 12 }}
              placeholder="Category name"
              value={catName}
              onChange={e => setCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmCategory()}
              autoFocus
            />
            <button className="btn primary" style={{ fontSize: 12 }} onClick={confirmCategory}>+</button>
          </div>
        ) : (
          <button
            className="btn ghost"
            style={{ width: '100%', marginTop: 8, fontSize: 12 }}
            onClick={() => setAddingCategory(true)}
          >
            + Category
          </button>
        )}
      </div>

      {/* Skills list */}
      <div style={{ flex: 1 }}>
        {!current && (
          <div style={{ color: 'var(--ink-3)', padding: '12px 0' }}>
            Add a category first to get started.
          </div>
        )}
        {current && (
          <>
            <div className="admin-list" style={{ marginBottom: 16 }}>
              {visible.map(s => (
                <SkillRow key={s.id} skill={s} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
              {visible.length === 0 && (
                <div style={{ color: 'var(--ink-3)', padding: '12px 0' }}>
                  No skills in this category yet.
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="admin-input"
                style={{ flex: 1 }}
                placeholder="New skill name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
              />
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4,5].map(d => (
                  <button
                    key={d}
                    className="skill-dot-btn"
                    style={{ color: d <= newLevel ? 'var(--accent)' : 'var(--ink-4)' }}
                    onClick={() => setNewLevel(d)}
                  >
                    {d <= newLevel ? '◆' : '◇'}
                  </button>
                ))}
              </div>
              <button className="btn primary" onClick={handleAddSkill} disabled={adding}>
                {adding ? '…' : 'Add'}
              </button>
            </div>
            {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>{error}</div>}
          </>
        )}
      </div>
    </div>
  )
}
