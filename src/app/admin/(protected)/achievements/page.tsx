'use client'
import { useState, useEffect, useCallback } from 'react'
import { Achievement } from '@/types'
import { DataTable } from '@/components/admin/DataTable'
import { AchievementForm } from '@/components/admin/AchievementForm'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'

export default function AdminAchievementsPage() {
  const [data, setData] = useState<Achievement[]>([])
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/achievements')
    setData(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(updates: Partial<Achievement>) {
    if (editing) {
      await fetch(`/api/admin/achievements/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    } else {
      await fetch('/api/admin/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    }
    setEditing(null)
    setCreating(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete?')) return
    await fetch(`/api/admin/achievements/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Achievements</h1>
        <Button onClick={() => { setCreating(true); setEditing(null) }}>+ Add Achievement</Button>
      </div>

      {(creating || editing) && (
        <GlassCard className="mb-8">
          <h2 className="text-white font-semibold mb-4">{editing ? 'Edit Achievement' : 'New Achievement'}</h2>
          <AchievementForm initial={editing ?? undefined} onSubmit={handleSave} onCancel={() => { setEditing(null); setCreating(false) }} />
        </GlassCard>
      )}

      <DataTable
        data={data}
        columns={[
          { key: 'platform', label: 'Platform' },
          { key: 'rating', label: 'Rating', render: (v) => v ?? '–' },
          { key: 'rank', label: 'Rank', render: (v) => v ?? '–' },
          { key: 'problems_solved', label: 'Problems Solved', render: (v) => v ?? '–' },
        ]}
        onEdit={(row) => { setEditing(row); setCreating(false) }}
        onDelete={handleDelete}
      />
    </div>
  )
}
