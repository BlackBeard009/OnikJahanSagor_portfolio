'use client'
import { useState, useEffect } from 'react'
import { About } from '@/types'
import { AboutForm } from '@/components/admin/AboutForm'
import { GlassCard } from '@/components/ui/GlassCard'

export default function AdminAboutPage() {
  const [about, setAbout] = useState<About | null>(null)

  useEffect(() => {
    fetch('/api/admin/about').then((r) => r.json()).then(setAbout)
  }, [])

  async function handleSave(updates: Partial<About>) {
    if (!about) return
    const res = await fetch('/api/admin/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: about.id, ...updates }),
    })
    setAbout(await res.json())
  }

  if (!about) return <div className="text-gray-400">Loading…</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">About Me</h1>
      <GlassCard>
        <AboutForm initial={about} onSubmit={handleSave} />
      </GlassCard>
    </div>
  )
}
