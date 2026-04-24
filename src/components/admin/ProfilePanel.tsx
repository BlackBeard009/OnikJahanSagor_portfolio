'use client'
import { useState } from 'react'
import FormField from './FormField'
import ChipsInput from './ChipsInput'
import ImageUpload from './ImageUpload'
import type { Profile } from '@/types'

export default function ProfilePanel({ initial }: { initial: Profile }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  function set(key: keyof Profile, val: unknown) {
    setForm((f) => ({ ...f, [key]: val }))
    setStatus('')
  }

  async function save() {
    setSaving(true)
    setStatus('')
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save')
      setStatus('Saved!')
    } catch (e: any) {
      setStatus(`Error: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-form">
      <div className="field-row">
        <FormField label="Name" name="name" value={form.name} onChange={(v) => set('name', v)} />
        <FormField label="Handle" name="handle" value={form.handle} onChange={(v) => set('handle', v)} placeholder="yourhandle" />
      </div>
      <div className="field-row">
        <FormField label="Title" name="title" value={form.title} onChange={(v) => set('title', v)} placeholder="Software Engineer" />
        <FormField label="Title Alt" name="title_alt" value={form.title_alt} onChange={(v) => set('title_alt', v)} placeholder="Competitive Programmer" />
      </div>
      <div className="field-row">
        <FormField label="Location" name="location" value={form.location} onChange={(v) => set('location', v)} />
        <FormField label="Timezone" name="timezone" value={form.timezone} onChange={(v) => set('timezone', v)} placeholder="UTC+6" />
      </div>
      <div className="field-row">
        <FormField label="Status" name="status" value={form.status} onChange={(v) => set('status', v)} placeholder="Open to collaborations" />
        <FormField label="Years of experience" name="years" value={String(form.years)} onChange={(v) => set('years', parseInt(v) || 0)} type="number" />
      </div>
      <FormField label="Email" name="email" value={form.email} onChange={(v) => set('email', v)} type="email" />
      <FormField label="Bio" name="bio" value={form.bio} onChange={(v) => set('bio', v)} multiline />
      <div className="field-row">
        <FormField label="GitHub URL" name="github" value={form.github} onChange={(v) => set('github', v)} type="url" />
        <FormField label="LinkedIn URL" name="linkedin" value={form.linkedin} onChange={(v) => set('linkedin', v)} type="url" />
      </div>
      <div className="field-row">
        <FormField label="Twitter URL" name="twitter" value={form.twitter} onChange={(v) => set('twitter', v)} type="url" />
        <FormField label="Resume URL (fallback)" name="resume_url" value={form.resume_url} onChange={(v) => set('resume_url', v)} type="url" />
      </div>
      <ImageUpload
        label="Avatar"
        currentUrl={form.avatar_url}
        bucket="avatars"
        onUploaded={(url) => set('avatar_url', url)}
      />
      <ImageUpload
        label="Résumé (PDF)"
        currentUrl={form.resume_url}
        bucket="resumes"
        accept=".pdf"
        onUploaded={(url) => set('resume_url', url)}
      />
      <ChipsInput
        label="Top skills (marquee)"
        value={form.skills_top ?? []}
        onChange={(v) => set('skills_top', v)}
        placeholder="Add skill..."
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="admin-save-btn" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
        {status && <span className={status.startsWith('Error') ? 'admin-error' : 'admin-status'}>{status}</span>}
      </div>
    </div>
  )
}
