'use client'
import { useState, useEffect, useCallback } from 'react'
import { Skill } from '@/types'
import { SkillForm } from '@/components/admin/SkillForm'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [editing, setEditing] = useState<Skill | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/skills')
    setSkills(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(skill: Skill) {
    if (editing) {
      await fetch(`/api/admin/skills/${encodeURIComponent(editing.name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill),
      })
    } else {
      const res = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill),
      })
      if (res.status === 409) {
        alert(`A skill named "${skill.name}" already exists.`)
        return
      }
    }
    setEditing(null)
    setCreating(false)
    load()
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete skill "${name}"?`)) return
    await fetch(`/api/admin/skills/${encodeURIComponent(name)}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Skills</h1>
        <Button onClick={() => { setCreating(true); setEditing(null) }}>+ Add Skill</Button>
      </div>

      {(creating || editing) && (
        <GlassCard className="mb-8">
          <h2 className="text-white font-semibold mb-4">{editing ? 'Edit Skill' : 'New Skill'}</h2>
          <SkillForm
            initial={editing ?? undefined}
            onSubmit={handleSave}
            onCancel={() => { setEditing(null); setCreating(false) }}
          />
        </GlassCard>
      )}

      <div className="overflow-x-auto rounded-xl border border-dark-border">
        <table className="w-full text-sm">
          <thead className="bg-dark-card border-b border-dark-border">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Category</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Level</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill.name} className="border-b border-dark-border hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-gray-300">{skill.name}</td>
                <td className="px-4 py-3 text-gray-300">{skill.category}</td>
                <td className="px-4 py-3 text-gray-300">{skill.level ?? '–'}</td>
                <td className="px-4 py-3 text-right flex gap-2 justify-end">
                  <button
                    onClick={() => { setEditing(skill); setCreating(false) }}
                    className="text-cyan hover:text-cyan-dark text-xs font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(skill.name)}
                    className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {skills.length === 0 && (
          <div className="text-center py-12 text-gray-500">No skills yet.</div>
        )}
      </div>
    </div>
  )
}
