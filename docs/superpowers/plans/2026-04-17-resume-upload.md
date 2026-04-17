# Resume Upload & PDF Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the manual resume URL text input with a PDF file uploader that stores files in Supabase Storage and opens them in-browser via a new tab.

**Architecture:** A new API route (`POST /api/admin/resume`) handles PDF uploads to a Supabase Storage bucket (`resume`) at a fixed path (`resume.pdf`) with `upsert: true`, ensuring the old file is always overwritten. The `AboutForm` component is updated to show a file picker and call this route on submit before saving other About fields. The public Hero component changes from a `download` anchor to an open-in-new-tab anchor.

**Tech Stack:** Next.js App Router, Supabase Storage (supabase-js v2), React Hook Form, Zod, TypeScript, Jest (node environment)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/app/api/admin/resume/route.ts` | POST handler: validate PDF, upload to Supabase Storage, update about.resume_url |
| Create | `src/app/api/admin/resume/__tests__/route.test.ts` | Unit tests for the upload route |
| Modify | `src/components/sections/Hero.tsx` | Remove `download` attr, add `target="_blank"` |
| Modify | `src/components/admin/AboutForm.tsx` | Replace resume_url text input with file picker + upload logic |

---

## Task 1: Create Supabase Storage bucket

**Files:** No code files — manual Supabase setup

- [ ] **Step 1: Create the `resume` public bucket**

Log into your Supabase project dashboard → Storage → New bucket.
- **Name:** `resume`
- **Public:** yes (toggle on)

Or run in the Supabase SQL editor:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('resume', 'resume', true)
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 2: Verify**

In Supabase Dashboard → Storage, confirm the `resume` bucket appears with "Public" enabled.

---

## Task 2: Create the resume upload API route

**Files:**
- Create: `src/app/api/admin/resume/__tests__/route.test.ts`
- Create: `src/app/api/admin/resume/route.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/api/admin/resume/__tests__/route.test.ts`:

```typescript
/**
 * @jest-environment node
 */

const mockUpload = jest.fn()
const mockGetPublicUrl = jest.fn()
const mockStorageFrom = jest.fn(() => ({
  upload: mockUpload,
  getPublicUrl: mockGetPublicUrl,
}))

jest.mock('@/lib/supabase-server', () => ({
  createAdminClient: jest.fn(() => ({
    storage: { from: mockStorageFrom },
  })),
}))

jest.mock('@/lib/db/about', () => ({
  getAbout: jest.fn(),
  updateAbout: jest.fn(),
}))

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body,
    })),
  },
}))

import { POST } from '@/app/api/admin/resume/route'
import { getAbout, updateAbout } from '@/lib/db/about'

const PUBLIC_URL = 'https://supabase.co/storage/v1/object/public/resume/resume.pdf'

function makeRequest(file: File | null) {
  const fd = new FormData()
  if (file) fd.append('file', file)
  return { formData: jest.fn().mockResolvedValue(fd) } as any
}

function makePdf(name = 'cv.pdf') {
  return new File(['%PDF-1.4'], name, { type: 'application/pdf' })
}

describe('POST /api/admin/resume', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpload.mockResolvedValue({ error: null })
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: PUBLIC_URL } })
    ;(getAbout as jest.Mock).mockResolvedValue({ id: 'about-1', resume_url: null })
    ;(updateAbout as jest.Mock).mockResolvedValue({})
  })

  it('uploads PDF and returns public URL', async () => {
    const req = makeRequest(makePdf())
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ url: PUBLIC_URL })
    expect(mockStorageFrom).toHaveBeenCalledWith('resume')
    expect(mockUpload).toHaveBeenCalledWith(
      'resume.pdf',
      expect.any(Buffer),
      { contentType: 'application/pdf', upsert: true }
    )
    expect(updateAbout).toHaveBeenCalledWith('about-1', { resume_url: PUBLIC_URL })
  })

  it('returns 400 when no file is provided', async () => {
    const req = makeRequest(null)
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'No file provided' })
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('returns 400 when file is not a PDF', async () => {
    const notPdf = new File(['hello'], 'cv.txt', { type: 'text/plain' })
    const req = makeRequest(notPdf)
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'File must be a PDF' })
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase upload fails', async () => {
    mockUpload.mockResolvedValue({ error: { message: 'bucket not found' } })
    const req = makeRequest(makePdf())
    const res = await POST(req)
    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: 'bucket not found' })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest src/app/api/admin/resume/__tests__/route.test.ts --no-coverage
```

Expected: FAIL — "Cannot find module '@/app/api/admin/resume/route'"

- [ ] **Step 3: Create the route**

Create `src/app/api/admin/resume/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { getAbout, updateAbout } from '@/lib/db/about'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
  }

  const db = createAdminClient()
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error: uploadError } = await db.storage
    .from('resume')
    .upload('resume.pdf', buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = db.storage
    .from('resume')
    .getPublicUrl('resume.pdf')

  const about = await getAbout()
  if (about) {
    await updateAbout(about.id, { resume_url: publicUrl })
  }

  return NextResponse.json({ url: publicUrl })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest src/app/api/admin/resume/__tests__/route.test.ts --no-coverage
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/resume/route.ts src/app/api/admin/resume/__tests__/route.test.ts
git commit -m "feat: add resume upload API route"
```

---

## Task 3: Update Hero to open PDF in a new tab

**Files:**
- Modify: `src/components/sections/Hero.tsx:100-107`

- [ ] **Step 1: Remove `download` attribute, add `target="_blank"`**

In `src/components/sections/Hero.tsx`, find the resume anchor (lines 100–107) and change it from:

```tsx
<a
  href={about.resume_url}
  download
  className="h-12 px-6 bg-transparent border border-gray-600 hover:border-primary text-gray-300 hover:text-white rounded-lg font-bold text-base transition-all hover:bg-primary/5 flex items-center"
>
  Download CV
</a>
```

To:

```tsx
<a
  href={about.resume_url}
  target="_blank"
  rel="noopener noreferrer"
  className="h-12 px-6 bg-transparent border border-gray-600 hover:border-primary text-gray-300 hover:text-white rounded-lg font-bold text-base transition-all hover:bg-primary/5 flex items-center"
>
  Download CV
</a>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: open resume PDF in new browser tab instead of downloading"
```

---

## Task 4: Update AboutForm to use file picker

**Files:**
- Modify: `src/components/admin/AboutForm.tsx`

- [ ] **Step 1: Replace entire file content**

Replace the entire content of `src/components/admin/AboutForm.tsx` with:

```tsx
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
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
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
```

- [ ] **Step 2: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: All previously passing tests still pass, plus the 4 new resume route tests.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AboutForm.tsx
git commit -m "feat: replace resume URL text input with PDF file upload in admin About form"
```
