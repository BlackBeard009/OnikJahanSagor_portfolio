'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { About } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  bio:        z.string().optional(),
  avatar_url: z.string().optional(),
  github:     z.string().optional(),
  linkedin:   z.string().optional(),
  twitter:    z.string().optional(),
  codeforces: z.string().optional(),
  email:      z.string().optional(),
  education:  z.string(),
})

type FormData = z.infer<typeof schema>

interface AboutFormProps {
  initial: About | null
  onSubmit: (data: Partial<About>) => Promise<void>
}

export function AboutForm({ initial, onSubmit }: AboutFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio:        initial?.bio ?? '',
      avatar_url: initial?.avatar_url ?? '',
      github:     initial?.social_links?.github ?? '',
      linkedin:   initial?.social_links?.linkedin ?? '',
      twitter:    initial?.social_links?.twitter ?? '',
      codeforces: initial?.social_links?.codeforces ?? '',
      email:      initial?.social_links?.email ?? '',
      education:  JSON.stringify(initial?.education ?? [], null, 2),
    },
  })

  async function submit(data: FormData) {
    setUploadError(null)

    if (resumeFile) {
      const fd = new FormData()
      fd.append('file', resumeFile)
      const res = await fetch('/api/admin/resume', { method: 'POST', body: fd })
      if (!res.ok) {
        const json = await res.json()
        setUploadError(json.error ?? 'Upload failed')
        return
      }
    }

    let education = initial?.education ?? []
    try { education = JSON.parse(data.education) } catch { /* keep existing */ }

    await onSubmit({
      bio:        data.bio,
      avatar_url: data.avatar_url,
      social_links: {
        github:     data.github,
        linkedin:   data.linkedin,
        twitter:    data.twitter,
        codeforces: data.codeforces,
        email:      data.email,
      },
      education,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <section>
        <h3 className="text-white font-semibold mb-4">Profile</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-300 font-medium">Bio</label>
            <textarea
              {...register('bio')}
              rows={4}
              className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/50 text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Avatar URL" {...register('avatar_url')} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300 font-medium">Resume (PDF)</label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => { setResumeFile(e.target.files?.[0] ?? null); setUploadError(null) }}
                className="text-sm text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
              />
              {uploadError && (
                <p className="text-red-400 text-xs">{uploadError}</p>
              )}
              {initial?.resume_url ? (
                <a
                  href={initial.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:underline"
                >
                  View current resume
                </a>
              ) : (
                <p className="text-xs text-gray-500">No resume uploaded</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-4">Social Links</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="GitHub URL"     {...register('github')} />
          <Input label="LinkedIn URL"   {...register('linkedin')} />
          <Input label="Twitter URL"    {...register('twitter')} />
          <Input label="Codeforces URL" {...register('codeforces')} />
          <Input label="Email"          {...register('email')} />
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">Education (JSON)</h3>
        <p className="text-gray-500 text-xs mb-2">
          Format: [&#123;"degree": "BS CS", "institution": "MIT", "start_year": 2016, "end_year": 2020&#125;]
        </p>
        <textarea
          {...register('education')}
          rows={6}
          className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan/50 resize-y"
        />
      </section>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
