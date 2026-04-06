'use client'
import { useState, useEffect, useCallback } from 'react'
import { Experience } from '@/types'
import { DataTable } from '@/components/admin/DataTable'
import { ExperienceForm } from '@/components/admin/ExperienceForm'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'

export default function AdminExperiencePage() {
  const [data, setData] = useState<Experience[]>([])
  const [editing, setEditing] = useState<Experience | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/experience')
    setData(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(updates: Partial<Experience>) {
    if (editing) {
      await fetch(`/api/admin/experience/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    } else {
      await fetch('/api/admin/experience', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    }
    setEditing(null)
    setCreating(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/admin/experience/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Work Experience</h1>
        <Button onClick={() => { setCreating(true); setEditing(null) }}>+ Add Entry</Button>
      </div>

      {(creating || editing) && (
        <GlassCard className="mb-8">
          <h2 className="text-white font-semibold mb-4">{editing ? 'Edit Experience' : 'New Experience'}</h2>
          <ExperienceForm initial={editing ?? undefined} onSubmit={handleSave} onCancel={() => { setEditing(null); setCreating(false) }} />
        </GlassCard>
      )}

      <DataTable
        data={data}
        columns={[
          { key: 'role', label: 'Role' },
          { key: 'company', label: 'Company' },
          { key: 'start_date', label: 'Start' },
          { key: 'end_date', label: 'End', render: (v) => v ?? 'Present' },
        ]}
        onEdit={(row) => { setEditing(row); setCreating(false) }}
        onDelete={handleDelete}
      />
    </div>
  )
}
