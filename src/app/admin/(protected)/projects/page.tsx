'use client'
import { useState, useEffect, useCallback } from 'react'
import { Project } from '@/types'
import { DataTable } from '@/components/admin/DataTable'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [editing, setEditing] = useState<Project | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/projects')
    setProjects(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(data: Partial<Project>) {
    if (editing) {
      await fetch(`/api/admin/projects/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    } else {
      await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setEditing(null)
    setCreating(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <Button onClick={() => { setCreating(true); setEditing(null) }}>+ New Project</Button>
      </div>

      {(creating || editing) && (
        <GlassCard className="mb-8">
          <h2 className="text-white font-semibold mb-4">{editing ? 'Edit Project' : 'New Project'}</h2>
          <ProjectForm initial={editing ?? undefined} onSubmit={handleSave} onCancel={() => { setEditing(null); setCreating(false) }} />
        </GlassCard>
      )}

      <DataTable
        data={projects}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'slug', label: 'Slug' },
          { key: 'featured', label: 'Featured', render: (v) => v ? '✓' : '–' },
          { key: 'tech_stack', label: 'Tech', render: (v) => (v as string[]).join(', ') },
        ]}
        onEdit={(row) => { setEditing(row); setCreating(false) }}
        onDelete={handleDelete}
      />
    </div>
  )
}
