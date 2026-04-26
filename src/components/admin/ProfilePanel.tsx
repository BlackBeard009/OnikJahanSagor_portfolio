'use client'
import { useState } from 'react'
import ChipsInput from './ChipsInput'
import ImageUpload from './ImageUpload'
import type { Profile } from '@/types'

function Field({ label, value, onChange, type = 'text', mono, placeholder, multiline }: {
  label: string; value: string | number; onChange: (v: string) => void
  type?: string; mono?: boolean; placeholder?: string; multiline?: boolean
}) {
  return (
    <div className="form-row">
      <label>{label}</label>
      {multiline ? (
        <textarea className={mono ? 'mono' : ''} value={value ?? ''} onChange={e => onChange(e.target.value)} rows={4} placeholder={placeholder} />
      ) : (
        <input type={type} className={mono ? 'mono' : ''} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  )
}

export default function ProfilePanel({ initial }: { initial: Profile }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const set = (key: keyof Profile, val: unknown) => setForm(f => ({ ...f, [key]: val }))
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      showToast('Profile saved')
    } catch {
      showToast('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="main-head">
        <div>
          <div className="eyebrow">§ profile</div>
          <h1>Profile</h1>
          <p>Your name, title, bio, and social links shown at the top of the portfolio.</p>
        </div>
        <button className="btn primary" onClick={save} disabled={saving}>
          {saving ? 'saving…' : 'save profile'}
        </button>
      </div>

      <div className="form-card">
        <div className="form-grid">
          <Field label="Name" value={form.name} onChange={v => set('name', v)} />
          <Field label="Handle" value={form.handle} mono onChange={v => set('handle', v)} placeholder="yourhandle" />
          <Field label="Title" value={form.title} onChange={v => set('title', v)} placeholder="Software Engineer" />
          <Field label="Title alt" value={form.title_alt} onChange={v => set('title_alt', v)} placeholder="Competitive Programmer" />
          <Field label="Location" value={form.location} onChange={v => set('location', v)} />
          <Field label="Timezone" value={form.timezone} mono onChange={v => set('timezone', v)} placeholder="UTC+6" />
          <Field label="Status line" value={form.status} onChange={v => set('status', v)} placeholder="Open to collaborations" />
          <Field label="Years of experience" type="number" value={form.years} onChange={v => set('years', parseInt(v) || 0)} />
          <div className="full">
            <Field label="Short bio" value={form.bio} onChange={v => set('bio', v)} multiline />
          </div>
          <Field label="Email" mono value={form.email} onChange={v => set('email', v)} />
          <Field label="GitHub URL" mono value={form.github} onChange={v => set('github', v)} />
          <Field label="LinkedIn URL" mono value={form.linkedin} onChange={v => set('linkedin', v)} />
          <Field label="Twitter URL" mono value={form.twitter} onChange={v => set('twitter', v)} />
          <div className="full">
            <Field label="Résumé URL (fallback)" mono value={form.resume_url} onChange={v => set('resume_url', v)} />
          </div>
          <div className="full">
            <div className="form-row">
              <label>Avatar</label>
              <ImageUpload
                label=""
                currentUrl={form.avatar_url}
                bucket="avatars"
                onUploaded={url => set('avatar_url', url)}
              />
            </div>
          </div>
          <div className="full">
            <ChipsInput
              label="Top skills marquee"
              value={form.skills_top ?? []}
              onChange={v => set('skills_top', v)}
              placeholder="Add skill and press Enter"
            />
          </div>
        </div>
      </div>

      {toast && <div className="toast"><span className="dot" /><span>{toast}</span></div>}
    </>
  )
}
