# Admin/API Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sync admin forms and API routes so every field displayed on the public portfolio can be created, edited, and deleted through the admin UI.

**Architecture:** Six isolated changes — one DB migration, three form patches, one new API module, one new admin page. Each task is self-contained and commits independently. Skills data stays in `about.skills` JSONB; new `/api/admin/skills` routes wrap read-modify-write operations on that column.

**Tech Stack:** Next.js 15 App Router, Supabase (postgres + JS client), react-hook-form + zod, Tailwind CSS, TypeScript.

---

## File Map

| Action | File |
|--------|------|
| Create | `supabase/migrations/20260407000000_add_missing_columns.sql` |
| Modify | `supabase/schema.sql` |
| Modify | `src/components/admin/ProjectForm.tsx` |
| Modify | `src/components/admin/AchievementForm.tsx` |
| Modify | `src/components/admin/AboutForm.tsx` |
| Create | `src/components/admin/SkillForm.tsx` |
| Create | `src/app/api/admin/skills/route.ts` |
| Create | `src/app/api/admin/skills/[name]/route.ts` |
| Create | `src/app/admin/(protected)/skills/page.tsx` |
| Modify | `src/components/admin/AdminNav.tsx` |

---

## Task 1: DB Migration — Add Missing Columns

**Files:**
- Create: `supabase/migrations/20260407000000_add_missing_columns.sql`
- Modify: `supabase/schema.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260407000000_add_missing_columns.sql
ALTER TABLE projects     ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS value       text;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS color       text;
```

- [ ] **Step 2: Update `supabase/schema.sql` to match**

In the `projects` table block, add after the `tech_stack` line:
```sql
  highlights  text[] DEFAULT '{}',
```

In the `achievements` table block, add after the `category` line:
```sql
  value       text,
  color       text,
```

The final `projects` table should look like:
```sql
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  tech_stack  text[] DEFAULT '{}',
  highlights  text[] DEFAULT '{}',
  image_url   text,
  github_url  text,
  live_url    text,
  featured    boolean DEFAULT false,
  "order"     integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
```

The final `achievements` table should look like:
```sql
CREATE TABLE achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform        text NOT NULL,
  rating          integer,
  rank            text,
  problems_solved integer,
  badge           text,
  profile_url     text,
  category        text,
  value           text,
  color           text,
  "order"         integer DEFAULT 0
);
```

- [ ] **Step 3: Run the migration in Supabase**

Go to the Supabase dashboard → SQL Editor, paste and run the migration file contents. Verify the columns appear in the Table Editor for `projects` and `achievements`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260407000000_add_missing_columns.sql supabase/schema.sql
git commit -m "feat: add highlights, value, color columns to db"
```

---

## Task 2: ProjectForm — Add Highlights, Remove Image URL

**Files:**
- Modify: `src/components/admin/ProjectForm.tsx`

- [ ] **Step 1: Replace the file contents**

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Project } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  tech_stack: z.string(),
  highlights: z.string(),
  github_url: z.string().optional(),
  live_url: z.string().optional(),
  featured: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface ProjectFormProps {
  initial?: Partial<Project>
  onSubmit: (data: Partial<Project>) => Promise<void>
  onCancel: () => void
}

export function ProjectForm({ initial, onSubmit, onCancel }: ProjectFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
      tech_stack: initial?.tech_stack?.join(', ') ?? '',
      highlights: initial?.highlights?.join('\n') ?? '',
      github_url: initial?.github_url ?? '',
      live_url: initial?.live_url ?? '',
      featured: initial?.featured ?? false,
    },
  })

  async function submit(data: FormData) {
    await onSubmit({
      ...data,
      tech_stack: data.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
      highlights: data.highlights.split('\n').map((s) => s.trim()).filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <Input label="Slug" error={errors.slug?.message} {...register('slug')} />
      </div>
      <Input label="Description" {...register('description')} />
      <Input label="Tech Stack (comma-separated)" placeholder="React, TypeScript, Node.js" {...register('tech_stack')} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-300 font-medium">Highlights (one per line)</label>
        <textarea
          {...register('highlights')}
          rows={4}
          placeholder="Built with React and TypeScript&#10;Deployed on Vercel with CI/CD"
          className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/50 text-sm resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="GitHub URL" {...register('github_url')} />
        <Input label="Live URL" {...register('live_url')} />
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="featured" {...register('featured')} className="accent-cyan" />
        <label htmlFor="featured" className="text-sm text-gray-300">Featured on homepage</label>
      </div>
      <div className="flex gap-3 justify-end mt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Verify in browser**

Start dev server (`npm run dev`). Open `/admin/projects`, create or edit a project. Confirm:
- No "Image URL" field appears
- "Highlights" textarea is present; enter two lines and save
- Reload the page and re-edit the project — highlights are pre-filled, one per line

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ProjectForm.tsx
git commit -m "feat: add highlights field and remove image_url from ProjectForm"
```

---

## Task 3: AchievementForm — Dynamic Fields and Dropdowns

**Files:**
- Modify: `src/components/admin/AchievementForm.tsx`

- [ ] **Step 1: Replace the file contents**

```typescript
'use client'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Achievement } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const RATING_PLATFORMS = ['Codeforces', 'LeetCode', 'CodeChef', 'AtCoder'] as const
const BADGE_OPTIONS    = ['globe', 'flag', 'leaderboard', 'trophy'] as const
const COLOR_OPTIONS    = ['blue', 'indigo', 'primary', 'purple', 'green', 'yellow', 'orange'] as const

const schema = z.object({
  category:        z.enum(['rating', 'team', 'individual']),
  platform:        z.string().min(1),
  rank:            z.string().optional(),
  rating:          z.number().nullable().optional(),
  problems_solved: z.number().nullable().optional(),
  badge:           z.string().optional(),
  value:           z.string().optional(),
  color:           z.string().optional(),
  profile_url:     z.string().optional(),
  order:           z.number().optional(),
})

type FormData = z.infer<typeof schema>

interface AchievementFormProps {
  initial?: Partial<Achievement>
  onSubmit: (data: Partial<Achievement>) => Promise<void>
  onCancel: () => void
}

const selectClass =
  'bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan/50 text-sm w-full'

export function AchievementForm({ initial, onSubmit, onCancel }: AchievementFormProps) {
  const { register, handleSubmit, control, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category:        (initial?.category as 'rating' | 'team' | 'individual') ?? 'rating',
      platform:        initial?.platform ?? '',
      rank:            initial?.rank ?? '',
      rating:          initial?.rating ?? undefined,
      problems_solved: initial?.problems_solved ?? undefined,
      badge:           initial?.badge ?? 'globe',
      value:           initial?.value ?? '',
      color:           initial?.color ?? 'primary',
      profile_url:     initial?.profile_url ?? '',
      order:           initial?.order ?? 0,
    },
  })

  const category = useWatch({ control, name: 'category' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-300 font-medium">Category</label>
        <select {...register('category')} className={selectClass}>
          <option value="rating">Rating (Online Judge)</option>
          <option value="team">Team Contest</option>
          <option value="individual">Individual Achievement</option>
        </select>
      </div>

      {/* Platform */}
      {category === 'rating' ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-300 font-medium">Platform</label>
          <select {...register('platform')} className={selectClass}>
            {RATING_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      ) : (
        <Input
          label="Platform"
          placeholder={category === 'team' ? 'ICPC Asia West Regional' : 'Codeforces'}
          {...register('platform')}
        />
      )}

      {/* Rank / description */}
      <Input
        label="Rank / Description"
        placeholder={
          category === 'rating'     ? 'Expert' :
          category === 'team'       ? 'Top 10, Regionals 2024' :
                                      'Solved 500+ problems'
        }
        {...register('rank')}
      />

      {/* Rating-only fields */}
      {category === 'rating' && (
        <div className="grid grid-cols-2 gap-4">
          <Input label="Rating" type="number" {...register('rating', { valueAsNumber: true })} />
          <Input label="Problems Solved" type="number" {...register('problems_solved', { valueAsNumber: true })} />
        </div>
      )}

      {/* Team-only fields */}
      {category === 'team' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-300 font-medium">Badge Icon</label>
          <select {...register('badge')} className={selectClass}>
            {BADGE_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      )}

      {/* Individual-only fields */}
      {category === 'individual' && (
        <>
          <Input label="Value (right-side text)" placeholder="Top 5% or 500+" {...register('value')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-300 font-medium">Color</label>
            <select {...register('color')} className={selectClass}>
              {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </>
      )}

      <Input label="Profile URL (optional)" {...register('profile_url')} />
      <Input label="Order" type="number" {...register('order', { valueAsNumber: true })} />

      <div className="flex gap-3 justify-end mt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Verify in browser**

Open `/admin/achievements`. Click "Add Achievement":
- Default category is "Rating" — platform dropdown shows Codeforces/LeetCode/CodeChef/AtCoder; Rating and Problems Solved inputs appear
- Switch to "Team" — platform becomes free text; Badge dropdown appears; rating/problems fields disappear
- Switch to "Individual" — Value and Color dropdown appear; badge disappears
- Create one entry per category and confirm they save and reload correctly

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AchievementForm.tsx
git commit -m "feat: dynamic AchievementForm with category-aware fields and dropdowns"
```

---

## Task 4: AboutForm — Add Codeforces + Email, Remove Skills JSON

**Files:**
- Modify: `src/components/admin/AboutForm.tsx`

Skills will be managed on the dedicated `/admin/skills` page. Remove the raw JSON skills textarea from this form to avoid two sources of truth.

- [ ] **Step 1: Replace the file contents**

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { About } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  bio:        z.string().optional(),
  avatar_url: z.string().optional(),
  resume_url: z.string().optional(),
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
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio:        initial?.bio ?? '',
      avatar_url: initial?.avatar_url ?? '',
      resume_url: initial?.resume_url ?? '',
      github:     initial?.social_links?.github ?? '',
      linkedin:   initial?.social_links?.linkedin ?? '',
      twitter:    initial?.social_links?.twitter ?? '',
      codeforces: initial?.social_links?.codeforces ?? '',
      email:      initial?.social_links?.email ?? '',
      education:  JSON.stringify(initial?.education ?? [], null, 2),
    },
  })

  async function submit(data: FormData) {
    let education = initial?.education ?? []
    try { education = JSON.parse(data.education) } catch { /* keep existing */ }

    await onSubmit({
      bio:        data.bio,
      avatar_url: data.avatar_url,
      resume_url: data.resume_url,
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
            <Input label="Resume URL" {...register('resume_url')} />
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

- [ ] **Step 2: Verify in browser**

Open `/admin/about`:
- Social Links section shows 5 fields: GitHub, LinkedIn, Twitter, Codeforces, Email
- No Skills JSON textarea (skills are now managed at `/admin/skills`)
- Education JSON textarea still present
- Save and confirm data persists

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AboutForm.tsx
git commit -m "feat: add codeforces and email social links to AboutForm, remove skills JSON"
```

---

## Task 5: Skills API Routes

**Files:**
- Create: `src/app/api/admin/skills/route.ts`
- Create: `src/app/api/admin/skills/[name]/route.ts`

These routes read `about.skills`, mutate the array, and write back via the existing `updateAbout` helper.

- [ ] **Step 1: Create `src/app/api/admin/skills/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAbout, updateAbout } from '@/lib/db/about'
import type { Skill } from '@/types'

export async function GET() {
  const about = await getAbout()
  return NextResponse.json(about?.skills ?? [])
}

export async function POST(req: NextRequest) {
  const about = await getAbout()
  if (!about) return NextResponse.json({ error: 'About row not found' }, { status: 500 })

  const skill: Skill = await req.json()
  const existing = about.skills ?? []

  if (existing.some((s) => s.name === skill.name)) {
    return NextResponse.json({ error: 'A skill with this name already exists' }, { status: 409 })
  }

  const updated = await updateAbout(about.id, { skills: [...existing, skill] })
  return NextResponse.json(updated.skills, { status: 201 })
}
```

- [ ] **Step 2: Create `src/app/api/admin/skills/[name]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAbout, updateAbout } from '@/lib/db/about'
import type { Skill } from '@/types'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const skillName = decodeURIComponent(name)

  const about = await getAbout()
  if (!about) return NextResponse.json({ error: 'About row not found' }, { status: 500 })

  const updates: Skill = await req.json()
  const skills = (about.skills ?? []).map((s) =>
    s.name === skillName ? updates : s
  )

  const updated = await updateAbout(about.id, { skills })
  return NextResponse.json(updated.skills)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const skillName = decodeURIComponent(name)

  const about = await getAbout()
  if (!about) return NextResponse.json({ error: 'About row not found' }, { status: 500 })

  const skills = (about.skills ?? []).filter((s) => s.name !== skillName)
  const updated = await updateAbout(about.id, { skills })
  return NextResponse.json(updated.skills)
}
```

- [ ] **Step 3: Verify routes with curl**

```bash
# GET — should return the skills array
curl http://localhost:3000/api/admin/skills

# POST — add a skill
curl -X POST http://localhost:3000/api/admin/skills \
  -H "Content-Type: application/json" \
  -d '{"name":"React","category":"Frameworks","level":"Expert"}'

# PUT — update it
curl -X PUT http://localhost:3000/api/admin/skills/React \
  -H "Content-Type: application/json" \
  -d '{"name":"React","category":"Frameworks","level":"Advanced"}'

# DELETE — remove it
curl -X DELETE http://localhost:3000/api/admin/skills/React
```

Expected: each returns the updated skills array (or 409 on duplicate POST).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/skills/route.ts src/app/api/admin/skills/[name]/route.ts
git commit -m "feat: add /api/admin/skills CRUD routes backed by about.skills JSONB"
```

---

## Task 6: Skills Admin Page + Nav Link

**Files:**
- Create: `src/components/admin/SkillForm.tsx`
- Create: `src/app/admin/(protected)/skills/page.tsx`
- Modify: `src/components/admin/AdminNav.tsx`

`Skill` has no `id`, so we use a custom inline table instead of `DataTable`.

- [ ] **Step 1: Create `src/components/admin/SkillForm.tsx`**

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Skill } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  name:     z.string().min(1),
  category: z.string().min(1),
  level:    z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface SkillFormProps {
  initial?: Partial<Skill>
  onSubmit: (data: Skill) => Promise<void>
  onCancel: () => void
}

export function SkillForm({ initial, onSubmit, onCancel }: SkillFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:     initial?.name ?? '',
      category: initial?.category ?? '',
      level:    initial?.level ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <Input label="Name" placeholder="React" error={errors.name?.message} {...register('name')} />
        <Input label="Category" placeholder="Frameworks" error={errors.category?.message} {...register('category')} />
        <Input label="Level (optional)" placeholder="Expert" {...register('level')} />
      </div>
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create `src/app/admin/(protected)/skills/page.tsx`**

```typescript
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
```

- [ ] **Step 3: Add Skills link to AdminNav**

In `src/components/admin/AdminNav.tsx`, add `{ href: '/admin/skills', label: 'Skills' }` to the `links` array, after Achievements:

```typescript
const links = [
  { href: '/admin',              label: 'Dashboard' },
  { href: '/admin/projects',     label: 'Projects' },
  { href: '/admin/experience',   label: 'Experience' },
  { href: '/admin/achievements', label: 'Achievements' },
  { href: '/admin/skills',       label: 'Skills' },
  { href: '/admin/blog',         label: 'Blog' },
  { href: '/admin/messages',     label: 'Messages' },
  { href: '/admin/about',        label: 'About' },
]
```

- [ ] **Step 4: Verify in browser**

Open `/admin/skills`:
- "Skills" link appears in the sidebar and is active when on that page
- "Add Skill" opens the form with Name, Category, Level fields
- Add a skill → it appears in the table
- Edit a skill → form pre-fills, save updates the row
- Delete a skill → confirm dialog, then row disappears
- Add a skill with a duplicate name → alert or visible error (409 from API — the page will silently re-load with no change; optionally verify via Network tab)

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/SkillForm.tsx src/app/admin/(protected)/skills/page.tsx src/components/admin/AdminNav.tsx
git commit -m "feat: add Skills admin page with full CRUD backed by about.skills"
```
