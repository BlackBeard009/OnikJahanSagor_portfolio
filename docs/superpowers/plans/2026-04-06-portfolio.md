# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack developer portfolio with a public-facing Next.js site and a Google-OAuth-protected admin CMS backed by Supabase.

**Architecture:** Next.js 14 App Router for routing and ISR rendering on public pages. Supabase (PostgreSQL + Storage) for all content and file uploads. NextAuth.js v5 with Google OAuth, single-email allowlist for admin access, protected by `middleware.ts`.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, @supabase/supabase-js v2, next-auth v5 (beta), react-hook-form, zod, @uiw/react-md-editor, react-markdown, jest, @testing-library/react

---

## File Map

```
src/
  app/
    (public)/
      layout.tsx                     # Public layout (nav + footer)
      page.tsx                       # Main portfolio page (/)
      projects/[slug]/page.tsx       # Project detail
      blog/page.tsx                  # Blog listing
      blog/[slug]/page.tsx           # Blog post
    admin/
      layout.tsx                     # Admin shell + auth guard
      page.tsx                       # Dashboard
      projects/page.tsx
      experience/page.tsx
      achievements/page.tsx
      blog/page.tsx
      messages/page.tsx
      about/page.tsx
    api/
      auth/[...nextauth]/route.ts    # NextAuth handler
      contact/route.ts               # Public contact form
      admin/
        projects/route.ts            # GET list, POST create
        projects/[id]/route.ts       # PUT update, DELETE
        experience/route.ts          # GET list, POST create
        experience/[id]/route.ts     # PUT update, DELETE
        achievements/route.ts        # GET list, POST create
        achievements/[id]/route.ts   # PUT update, DELETE
        blog/route.ts                # GET list, POST create
        blog/[id]/route.ts           # PUT update, DELETE
        messages/[id]/route.ts       # PUT mark-read
        about/route.ts               # GET, PUT
    globals.css
    layout.tsx                       # Root layout (fonts, providers)
  components/
    sections/
      Hero.tsx
      About.tsx
      Achievements.tsx
      Experience.tsx
      Skills.tsx
      Projects.tsx
      BlogPreview.tsx
      Contact.tsx
    admin/
      AdminNav.tsx
      ProjectForm.tsx
      ExperienceForm.tsx
      AchievementForm.tsx
      BlogEditor.tsx
      AboutForm.tsx
      DataTable.tsx                  # Reusable list table for admin
    ui/
      Button.tsx
      Card.tsx
      Input.tsx
      Badge.tsx
      GlassCard.tsx                  # Glassmorphism card
  lib/
    supabase.ts                      # Browser/anon Supabase client
    supabase-server.ts               # Server-side Supabase client (service role)
    auth.ts                          # NextAuth config
    db/
      projects.ts
      experience.ts
      achievements.ts
      blog.ts
      messages.ts
      about.ts
  types/
    index.ts                         # All shared TypeScript types
middleware.ts                        # Auth protection for /admin/*
tailwind.config.ts                   # Design tokens
```

---

## Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `.env.local`, `.gitignore`

- [ ] **Step 1: Scaffold the project**

```bash
cd /Users/onikjahansagor/onikjahansagor_portfolio
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

When prompted, accept all defaults.

Expected: Next.js project files created in current directory.

- [ ] **Step 2: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts at `http://localhost:3000`. Stop with Ctrl+C.

- [ ] **Step 3: Install project dependencies**

```bash
npm install \
  @supabase/supabase-js \
  next-auth@beta \
  @auth/core \
  react-hook-form \
  @hookform/resolvers \
  zod \
  react-markdown \
  remark-gfm \
  @uiw/react-md-editor \
  lucide-react \
  clsx \
  tailwind-merge

npm install --save-dev \
  jest \
  jest-environment-jsdom \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @types/jest \
  ts-jest
```

Expected: `node_modules` updated, no peer dependency errors.

- [ ] **Step 4: Configure Jest**

Create `jest.config.ts`:
```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

export default createJestConfig(config)
```

Create `jest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Create `.env.local`**

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_random_secret_32_chars
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=your@gmail.com
EOF
```

Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

- [ ] **Step 6: Add `.env.local` to `.gitignore`**

Confirm `.gitignore` contains:
```
.env.local
.env*.local
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js 14 project with dependencies"
```

---

## Task 2: Configure Tailwind design tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          DEFAULT: '#0dccf2',
          dark: '#0aa8c8',
        },
        dark: {
          DEFAULT: '#0a0a14',
          card: '#12121f',
          border: '#1e1e35',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Update `src/app/globals.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-inter: 'Inter', sans-serif;
}

@layer base {
  body {
    @apply bg-dark text-white font-sans antialiased;
  }
  * {
    @apply border-dark-border;
  }
}

@layer components {
  .glass {
    @apply bg-dark-card/60 backdrop-blur-md border border-dark-border;
  }
  .glass-hover {
    @apply hover:bg-dark-card/80 hover:border-cyan/30 transition-all duration-300;
  }
  .text-gradient {
    @apply bg-gradient-to-r from-cyan to-blue-400 bg-clip-text text-transparent;
  }
  .section-heading {
    @apply text-3xl font-bold mb-2 text-white;
  }
  .section-subheading {
    @apply text-gray-400 mb-12 text-lg;
  }
}

html {
  scroll-behavior: smooth;
}
```

- [ ] **Step 3: Update root layout `src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Software Engineer Portfolio',
  description: 'Full-stack software engineer portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Verify build compiles**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts src/app/globals.css src/app/layout.tsx
git commit -m "chore: configure Tailwind design tokens and global styles"
```

---

## Task 3: Set up Supabase schema

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Create a Supabase project**

Go to https://supabase.com → New project. Save the project URL and keys to `.env.local`.

- [ ] **Step 2: Write `supabase/schema.sql`**

```sql
-- Projects
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  tech_stack  text[] DEFAULT '{}',
  image_url   text,
  github_url  text,
  live_url    text,
  featured    boolean DEFAULT false,
  "order"     integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- Work Experience
CREATE TABLE experience (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company      text NOT NULL,
  role         text NOT NULL,
  start_date   date NOT NULL,
  end_date     date,
  description  text,
  achievements text[] DEFAULT '{}',
  logo_url     text,
  "order"      integer DEFAULT 0
);

-- Competitive programming achievements
CREATE TABLE achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform        text NOT NULL,
  rating          integer,
  rank            text,
  problems_solved integer,
  badge           text,
  profile_url     text,
  category        text,
  "order"         integer DEFAULT 0
);

-- Blog posts
CREATE TABLE blog_posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text UNIQUE NOT NULL,
  content      text,
  excerpt      text,
  cover_image  text,
  published    boolean DEFAULT false,
  published_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

-- Contact messages
CREATE TABLE contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  subject    text,
  message    text NOT NULL,
  read       boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- About (single row)
CREATE TABLE about (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bio          text,
  avatar_url   text,
  resume_url   text,
  social_links jsonb DEFAULT '{}',
  skills       jsonb DEFAULT '[]',
  education    jsonb DEFAULT '[]'
);

-- Seed one about row
INSERT INTO about (bio) VALUES ('Your bio here');

-- Row Level Security: allow public reads on portfolio tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_projects" ON projects FOR SELECT USING (true);
CREATE POLICY "public_read_experience" ON experience FOR SELECT USING (true);
CREATE POLICY "public_read_achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "public_read_blog_posts" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "public_read_about" ON about FOR SELECT USING (true);
-- contact_messages: no public read (admin only via service role)
-- all writes go through service role key (bypasses RLS)
CREATE POLICY "allow_insert_contact" ON contact_messages FOR INSERT WITH CHECK (true);
```

- [ ] **Step 3: Run schema in Supabase SQL editor**

Go to Supabase → SQL Editor → paste contents of `supabase/schema.sql` → Run.

Expected: All 6 tables created, RLS policies applied.

- [ ] **Step 4: Create Supabase Storage bucket**

In Supabase → Storage → New bucket: `portfolio-images`, set to Public.

- [ ] **Step 5: Commit schema**

```bash
git add supabase/schema.sql
git commit -m "chore: add Supabase schema and RLS policies"
```

---

## Task 4: TypeScript types and Supabase clients

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/supabase.ts`
- Create: `src/lib/supabase-server.ts`

- [ ] **Step 1: Write `src/types/index.ts`**

```typescript
export interface Project {
  id: string
  title: string
  slug: string
  description: string | null
  tech_stack: string[]
  image_url: string | null
  github_url: string | null
  live_url: string | null
  featured: boolean
  order: number
  created_at: string
}

export interface Experience {
  id: string
  company: string
  role: string
  start_date: string
  end_date: string | null
  description: string | null
  achievements: string[]
  logo_url: string | null
  order: number
}

export interface Achievement {
  id: string
  platform: string
  rating: number | null
  rank: string | null
  problems_solved: number | null
  badge: string | null
  profile_url: string | null
  category: string | null
  order: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  cover_image: string | null
  published: boolean
  published_at: string | null
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

export interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  email?: string
  [key: string]: string | undefined
}

export interface Skill {
  name: string
  category: string
  level?: string
}

export interface EducationEntry {
  degree: string
  institution: string
  start_year: number
  end_year: number | null
}

export interface About {
  id: string
  bio: string | null
  avatar_url: string | null
  resume_url: string | null
  social_links: SocialLinks
  skills: Skill[]
  education: EducationEntry[]
}
```

- [ ] **Step 2: Write `src/lib/supabase.ts`** (browser client — uses anon key)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: Write `src/lib/supabase-server.ts`** (server client — uses service role key, bypasses RLS)

```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
```

- [ ] **Step 4: Write failing type-check test**

Create `src/lib/__tests__/supabase.test.ts`:
```typescript
import { supabase } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase-server'

describe('Supabase clients', () => {
  it('supabase anon client is defined', () => {
    expect(supabase).toBeDefined()
  })

  it('createAdminClient returns a client', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    const client = createAdminClient()
    expect(client).toBeDefined()
  })
})
```

- [ ] **Step 5: Run test**

```bash
npx jest src/lib/__tests__/supabase.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/lib/supabase.ts src/lib/supabase-server.ts src/lib/__tests__/supabase.test.ts
git commit -m "feat: add TypeScript types and Supabase clients"
```

---

## Task 5: Data access layer (lib/db/)

**Files:**
- Create: `src/lib/db/projects.ts`
- Create: `src/lib/db/experience.ts`
- Create: `src/lib/db/achievements.ts`
- Create: `src/lib/db/blog.ts`
- Create: `src/lib/db/messages.ts`
- Create: `src/lib/db/about.ts`
- Create: `src/lib/db/__tests__/projects.test.ts`

- [ ] **Step 1: Write failing tests for projects data access**

Create `src/lib/db/__tests__/projects.test.ts`:
```typescript
jest.mock('@/lib/supabase-server', () => ({
  createAdminClient: jest.fn(),
}))

import { createAdminClient } from '@/lib/supabase-server'
import { getProjects, getProjectBySlug, createProject, updateProject, deleteProject } from '@/lib/db/projects'
import type { Project } from '@/types'

const mockProject: Project = {
  id: 'abc-123',
  title: 'My Project',
  slug: 'my-project',
  description: 'A cool project',
  tech_stack: ['TypeScript', 'React'],
  image_url: null,
  github_url: null,
  live_url: null,
  featured: false,
  order: 0,
  created_at: '2026-01-01T00:00:00Z',
}

function makeClient(data: unknown, error: null | { message: string } = null) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  }
  chain.select.mockReturnValue({ ...chain, order: jest.fn().mockResolvedValue({ data, error }) })
  chain.insert.mockReturnValue({ ...chain, select: jest.fn().mockReturnValue({ ...chain, single: jest.fn().mockResolvedValue({ data, error }) }) })
  chain.update.mockReturnValue({ ...chain, eq: jest.fn().mockReturnValue({ ...chain, select: jest.fn().mockReturnValue({ ...chain, single: jest.fn().mockResolvedValue({ data, error }) }) }) })
  chain.delete.mockReturnValue({ ...chain, eq: jest.fn().mockResolvedValue({ data: null, error }) })
  return { from: jest.fn().mockReturnValue(chain) }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getProjects', () => {
  it('returns projects ordered by order field', async () => {
    ;(createAdminClient as jest.Mock).mockReturnValue(makeClient([mockProject]))
    const result = await getProjects()
    expect(result).toEqual([mockProject])
  })
})

describe('getProjectBySlug', () => {
  it('returns a single project by slug', async () => {
    ;(createAdminClient as jest.Mock).mockReturnValue(makeClient(mockProject))
    const result = await getProjectBySlug('my-project')
    expect(result?.slug).toBe('my-project')
  })
})
```

- [ ] **Step 2: Run tests to confirm failure**

```bash
npx jest src/lib/db/__tests__/projects.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/db/projects'`

- [ ] **Step 3: Write `src/lib/db/projects.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase-server'
import type { Project } from '@/types'

export async function getProjects(): Promise<Project[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('projects')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('featured', true)
    .order('order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function createProject(project: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('projects')
    .insert(project)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'created_at'>>): Promise<Project> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteProject(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
```

- [ ] **Step 4: Write `src/lib/db/experience.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase-server'
import type { Experience } from '@/types'

export async function getExperience(): Promise<Experience[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('experience')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createExperience(entry: Omit<Experience, 'id'>): Promise<Experience> {
  const db = createAdminClient()
  const { data, error } = await db.from('experience').insert(entry).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateExperience(id: string, updates: Partial<Omit<Experience, 'id'>>): Promise<Experience> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('experience')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteExperience(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('experience').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
```

- [ ] **Step 5: Write `src/lib/db/achievements.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase-server'
import type { Achievement } from '@/types'

export async function getAchievements(): Promise<Achievement[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('achievements')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createAchievement(entry: Omit<Achievement, 'id'>): Promise<Achievement> {
  const db = createAdminClient()
  const { data, error } = await db.from('achievements').insert(entry).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateAchievement(id: string, updates: Partial<Omit<Achievement, 'id'>>): Promise<Achievement> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('achievements')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteAchievement(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('achievements').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
```

- [ ] **Step 6: Write `src/lib/db/blog.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase-server'
import type { BlogPost } from '@/types'

export async function getBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
  const db = createAdminClient()
  let query = db.from('blog_posts').select('*').order('published_at', { ascending: false })
  if (publishedOnly) query = query.eq('published', true)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'created_at'>): Promise<BlogPost> {
  const db = createAdminClient()
  const { data, error } = await db.from('blog_posts').insert(post).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateBlogPost(id: string, updates: Partial<Omit<BlogPost, 'id' | 'created_at'>>): Promise<BlogPost> {
  const db = createAdminClient()
  const payload = { ...updates }
  if (updates.published && !updates.published_at) {
    payload.published_at = new Date().toISOString()
  }
  const { data, error } = await db
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteBlogPost(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('blog_posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
```

- [ ] **Step 7: Write `src/lib/db/messages.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase-server'
import type { ContactMessage } from '@/types'

export async function getMessages(): Promise<ContactMessage[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function markMessageRead(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db
    .from('contact_messages')
    .update({ read: true })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function createMessage(msg: Omit<ContactMessage, 'id' | 'read' | 'created_at'>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('contact_messages').insert(msg)
  if (error) throw new Error(error.message)
}
```

- [ ] **Step 8: Write `src/lib/db/about.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase-server'
import type { About } from '@/types'

export async function getAbout(): Promise<About | null> {
  const db = createAdminClient()
  const { data, error } = await db.from('about').select('*').limit(1).single()
  if (error) return null
  return data
}

export async function updateAbout(id: string, updates: Partial<Omit<About, 'id'>>): Promise<About> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('about')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}
```

- [ ] **Step 9: Run all db tests**

```bash
npx jest src/lib/db/__tests__/
```

Expected: All tests pass.

- [ ] **Step 10: Commit**

```bash
git add src/lib/db/ src/types/
git commit -m "feat: add data access layer for all entities"
```

---

## Task 6: NextAuth configuration and middleware

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`
- Create: `src/lib/__tests__/middleware.test.ts`

- [ ] **Step 1: Write failing middleware test**

Create `src/lib/__tests__/middleware.test.ts`:
```typescript
// Test the auth check logic, not the full Next.js middleware
import { isAdminEmail } from '@/lib/auth'

describe('isAdminEmail', () => {
  const originalEnv = process.env.ADMIN_EMAIL

  afterEach(() => {
    process.env.ADMIN_EMAIL = originalEnv
  })

  it('returns true for the configured admin email', () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    expect(isAdminEmail('admin@example.com')).toBe(true)
  })

  it('returns false for a different email', () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    expect(isAdminEmail('other@example.com')).toBe(false)
  })

  it('returns false when email is undefined', () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    expect(isAdminEmail(undefined)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx jest src/lib/__tests__/middleware.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/auth'`

- [ ] **Step 3: Write `src/lib/auth.ts`**

```typescript
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export function isAdminEmail(email: string | undefined | null): boolean {
  return email === process.env.ADMIN_EMAIL
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      return isAdminEmail(profile?.email)
    },
    async session({ session, token }) {
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
})
```

- [ ] **Step 4: Write `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 5: Create admin login page `src/app/admin/login/page.tsx`**

```typescript
import { signIn } from '@/lib/auth'

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="glass rounded-xl p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white">Admin Login</h1>
        <p className="text-gray-400 text-sm text-center">
          Sign in with your Google account to access the admin panel.
        </p>
        <form
          action={async () => {
            'use server'
            await signIn('google', { redirectTo: '/admin' })
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Write `middleware.ts`**

```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isAdminRoute = nextUrl.pathname.startsWith('/admin') && nextUrl.pathname !== '/admin/login'
  const isAdminApiRoute = nextUrl.pathname.startsWith('/api/admin')

  if ((isAdminRoute || isAdminApiRoute) && !session) {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
```

- [ ] **Step 7: Run middleware test**

```bash
npx jest src/lib/__tests__/middleware.test.ts
```

Expected: All 3 tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/app/admin/login/ middleware.ts src/lib/__tests__/middleware.test.ts
git commit -m "feat: add NextAuth Google OAuth and admin route protection middleware"
```

---

## Task 7: Contact form API route

**Files:**
- Create: `src/app/api/contact/route.ts`
- Create: `src/app/api/contact/__tests__/route.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/app/api/contact/__tests__/route.test.ts`:
```typescript
jest.mock('@/lib/db/messages', () => ({
  createMessage: jest.fn(),
}))

import { POST } from '@/app/api/contact/route'
import { createMessage } from '@/lib/db/messages'
import { NextRequest } from 'next/server'

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/contact', () => {
  beforeEach(() => jest.clearAllMocks())

  it('saves a valid message and returns 201', async () => {
    ;(createMessage as jest.Mock).mockResolvedValue(undefined)
    const req = makeRequest({ name: 'Alice', email: 'alice@example.com', message: 'Hello' })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alice', email: 'alice@example.com' })
    )
  })

  it('returns 400 when required fields are missing', async () => {
    const req = makeRequest({ name: 'Alice' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(createMessage).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid email format', async () => {
    const req = makeRequest({ name: 'Alice', email: 'not-an-email', message: 'Hi' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx jest src/app/api/contact/__tests__/route.test.ts
```

Expected: FAIL — `Cannot find module '@/app/api/contact/route'`

- [ ] **Step 3: Write `src/app/api/contact/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createMessage } from '@/lib/db/messages'

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ContactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    await createMessage(parsed.data)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npx jest src/app/api/contact/__tests__/route.test.ts
```

Expected: All 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/contact/
git commit -m "feat: add contact form API route with Zod validation"
```

---

## Task 8: Admin API routes

**Files:**
- Create: `src/app/api/admin/projects/route.ts`
- Create: `src/app/api/admin/projects/[id]/route.ts`
- Create: `src/app/api/admin/experience/route.ts`
- Create: `src/app/api/admin/experience/[id]/route.ts`
- Create: `src/app/api/admin/achievements/route.ts`
- Create: `src/app/api/admin/achievements/[id]/route.ts`
- Create: `src/app/api/admin/blog/route.ts`
- Create: `src/app/api/admin/blog/[id]/route.ts`
- Create: `src/app/api/admin/messages/[id]/route.ts`
- Create: `src/app/api/admin/about/route.ts`

Note: All admin routes are protected by `middleware.ts`, so no auth check is needed inside the handlers themselves.

- [ ] **Step 1: Write `src/app/api/admin/projects/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getProjects, createProject } from '@/lib/db/projects'

export async function GET() {
  const projects = await getProjects()
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const project = await createProject(body)
  return NextResponse.json(project, { status: 201 })
}
```

- [ ] **Step 2: Write `src/app/api/admin/projects/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { updateProject, deleteProject } from '@/lib/db/projects'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const project = await updateProject(params.id, body)
  return NextResponse.json(project)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await deleteProject(params.id)
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Write `src/app/api/admin/experience/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getExperience, createExperience } from '@/lib/db/experience'

export async function GET() {
  const data = await getExperience()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = await createExperience(body)
  return NextResponse.json(entry, { status: 201 })
}
```

- [ ] **Step 4: Write `src/app/api/admin/experience/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { updateExperience, deleteExperience } from '@/lib/db/experience'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const entry = await updateExperience(params.id, body)
  return NextResponse.json(entry)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await deleteExperience(params.id)
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 5: Write `src/app/api/admin/achievements/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAchievements, createAchievement } from '@/lib/db/achievements'

export async function GET() {
  const data = await getAchievements()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = await createAchievement(body)
  return NextResponse.json(entry, { status: 201 })
}
```

- [ ] **Step 6: Write `src/app/api/admin/achievements/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { updateAchievement, deleteAchievement } from '@/lib/db/achievements'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const entry = await updateAchievement(params.id, body)
  return NextResponse.json(entry)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await deleteAchievement(params.id)
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 7: Write `src/app/api/admin/blog/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getBlogPosts, createBlogPost } from '@/lib/db/blog'

export async function GET() {
  const posts = await getBlogPosts(false) // admin sees all posts
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const post = await createBlogPost(body)
  return NextResponse.json(post, { status: 201 })
}
```

- [ ] **Step 8: Write `src/app/api/admin/blog/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { updateBlogPost, deleteBlogPost } from '@/lib/db/blog'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const post = await updateBlogPost(params.id, body)
  return NextResponse.json(post)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await deleteBlogPost(params.id)
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 9: Write `src/app/api/admin/messages/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { markMessageRead } from '@/lib/db/messages'

export async function PUT(_req: Request, { params }: { params: { id: string } }) {
  await markMessageRead(params.id)
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 10: Write `src/app/api/admin/about/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAbout, updateAbout } from '@/lib/db/about'

export async function GET() {
  const about = await getAbout()
  return NextResponse.json(about)
}

export async function PUT(req: NextRequest) {
  const { id, ...updates } = await req.json()
  const about = await updateAbout(id, updates)
  return NextResponse.json(about)
}
```

- [ ] **Step 11: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 12: Commit**

```bash
git add src/app/api/admin/
git commit -m "feat: add admin CRUD API routes for all entities"
```

---

## Task 9: Shared UI components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/GlassCard.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Badge.tsx`

- [ ] **Step 1: Write `src/components/ui/Button.tsx`**

```typescript
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  asChild?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-cyan text-dark-DEFAULT font-semibold hover:bg-cyan-dark',
  outline: 'border border-cyan text-cyan hover:bg-cyan/10',
  ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={twMerge(
        clsx('rounded-lg transition-all duration-200 font-medium inline-flex items-center gap-2', variants[variant], sizes[size], className)
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Write `src/components/ui/GlassCard.tsx`**

```typescript
import { twMerge } from 'tailwind-merge'

interface GlassCardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
}

export function GlassCard({ className, children, hover = false }: GlassCardProps) {
  return (
    <div
      className={twMerge(
        'glass rounded-xl p-6',
        hover && 'glass-hover cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/ui/Input.tsx`**

```typescript
import { twMerge } from 'tailwind-merge'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-gray-300 font-medium">{label}</label>}
      <input
        ref={ref}
        className={twMerge(
          'bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/50 transition-colors text-sm',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
```

- [ ] **Step 4: Write `src/components/ui/Badge.tsx`**

```typescript
import { twMerge } from 'tailwind-merge'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'cyan' | 'gray' | 'green' | 'red'
  className?: string
}

const variants = {
  cyan: 'bg-cyan/10 text-cyan border-cyan/20',
  gray: 'bg-white/5 text-gray-300 border-white/10',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add shared UI components (Button, GlassCard, Input, Badge)"
```

---

## Task 10: Public portfolio section components

Reference: Stitch screen `bd4aec5e729f4fb3bf5a100bef2d5acd` from project `4441938516836591006`.
To fetch the HTML design reference, run:
```bash
# Fetch the Stitch HTML for reference (in a separate browser tab or via MCP)
# Project: 4441938516836591006  Screen: bd4aec5e729f4fb3bf5a100bef2d5acd
```

**Files:**
- Create: `src/components/sections/Hero.tsx`
- Create: `src/components/sections/About.tsx`
- Create: `src/components/sections/Achievements.tsx`
- Create: `src/components/sections/Experience.tsx`
- Create: `src/components/sections/Skills.tsx`
- Create: `src/components/sections/Projects.tsx`
- Create: `src/components/sections/BlogPreview.tsx`
- Create: `src/components/sections/Contact.tsx`

- [ ] **Step 1: Write `src/components/sections/Hero.tsx`**

```typescript
import { About } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface HeroProps {
  about: About | null
}

export function Hero({ about }: HeroProps) {
  return (
    <section id="hero" className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6">
        <Badge variant="cyan" className="text-sm px-4 py-1">
          <span className="w-2 h-2 rounded-full bg-green-400 mr-2 inline-block animate-pulse" />
          Open to Work
        </Badge>

        {about?.avatar_url && (
          <img
            src={about.avatar_url}
            alt="Avatar"
            className="w-28 h-28 rounded-full border-2 border-cyan/30 object-cover"
          />
        )}

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="text-white">Hi, I&apos;m </span>
          <span className="text-gradient">AlexDev</span>
        </h1>

        <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
          Competitive programmer & software engineer specializing in algorithms,
          distributed systems, and scalable web applications.
        </p>

        <div className="flex gap-4 flex-wrap justify-center mt-4">
          <Button size="lg" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
            View Projects
          </Button>
          {about?.resume_url && (
            <Button variant="outline" size="lg" asChild>
              <a href={about.resume_url} download>Download Resume</a>
            </Button>
          )}
        </div>

        {about?.social_links && (
          <div className="flex gap-6 mt-4">
            {about.social_links.github && (
              <a href={about.social_links.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan transition-colors">GitHub</a>
            )}
            {about.social_links.linkedin && (
              <a href={about.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan transition-colors">LinkedIn</a>
            )}
            {about.social_links.twitter && (
              <a href={about.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan transition-colors">Twitter</a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Write `src/components/sections/About.tsx`**

```typescript
import { About as AboutType, EducationEntry } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'

interface AboutProps {
  about: AboutType | null
}

function EducationCard({ entry }: { entry: EducationEntry }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-2 h-2 rounded-full bg-cyan mt-2 shrink-0" />
      <div>
        <p className="font-semibold text-white">{entry.degree}</p>
        <p className="text-gray-400 text-sm">{entry.institution}</p>
        <p className="text-gray-500 text-xs">{entry.start_year} – {entry.end_year ?? 'Present'}</p>
      </div>
    </div>
  )
}

export function About({ about }: AboutProps) {
  if (!about) return null
  return (
    <section id="about" className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="section-heading">About Me</h2>
      <p className="section-subheading">Get to know me</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard>
          <p className="text-gray-300 leading-relaxed text-base">{about.bio}</p>
        </GlassCard>

        {about.education && about.education.length > 0 && (
          <GlassCard>
            <h3 className="text-white font-semibold mb-4">Education</h3>
            <div className="flex flex-col gap-4">
              {about.education.map((entry, i) => (
                <EducationCard key={i} entry={entry} />
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Write `src/components/sections/Achievements.tsx`**

```typescript
import { Achievement } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'

interface AchievementsProps {
  achievements: Achievement[]
}

export function Achievements({ achievements }: AchievementsProps) {
  if (!achievements.length) return null
  return (
    <section id="achievements" className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="section-heading">Competitive Programming</h2>
      <p className="section-subheading">Rankings and achievements</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((a) => (
          <GlassCard key={a.id} hover className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-lg">{a.platform}</span>
              {a.badge && <Badge variant="cyan">{a.badge}</Badge>}
            </div>
            {a.rating && (
              <div>
                <span className="text-3xl font-bold text-gradient">{a.rating}</span>
                <span className="text-gray-400 text-sm ml-2">rating</span>
              </div>
            )}
            {a.rank && <p className="text-gray-300 text-sm">{a.rank}</p>}
            {a.problems_solved && (
              <p className="text-gray-400 text-sm">{a.problems_solved.toLocaleString()} problems solved</p>
            )}
            {a.profile_url && (
              <a href={a.profile_url} target="_blank" rel="noopener noreferrer"
                className="text-cyan text-sm hover:underline mt-auto">
                View Profile →
              </a>
            )}
          </GlassCard>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Write `src/components/sections/Experience.tsx`**

```typescript
import { Experience as ExperienceType } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'

interface ExperienceProps {
  experience: ExperienceType[]
}

function formatDate(date: string | null): string {
  if (!date) return 'Present'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

export function Experience({ experience }: ExperienceProps) {
  if (!experience.length) return null
  return (
    <section id="experience" className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="section-heading">Work Experience</h2>
      <p className="section-subheading">My professional journey</p>

      <div className="relative pl-8 border-l border-dark-border flex flex-col gap-10">
        {experience.map((exp) => (
          <div key={exp.id} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[2.35rem] top-1 w-3 h-3 rounded-full bg-cyan border-2 border-dark-DEFAULT" />
            <GlassCard>
              <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                <div>
                  <h3 className="text-white font-bold text-lg">{exp.role}</h3>
                  <p className="text-cyan text-sm">{exp.company}</p>
                </div>
                <span className="text-gray-500 text-sm">
                  {formatDate(exp.start_date)} – {formatDate(exp.end_date)}
                </span>
              </div>
              {exp.description && <p className="text-gray-300 text-sm leading-relaxed mb-3">{exp.description}</p>}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {exp.achievements.map((a, i) => (
                    <li key={i} className="text-gray-400 text-sm flex gap-2">
                      <span className="text-cyan mt-1">▸</span>
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Write `src/components/sections/Skills.tsx`**

```typescript
import { Skill } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'

interface SkillsProps {
  skills: Skill[]
}

export function Skills({ skills }: SkillsProps) {
  if (!skills.length) return null

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || 'Other'
    acc[cat] = [...(acc[cat] ?? []), skill]
    return acc
  }, {})

  return (
    <section id="skills" className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="section-heading">Tech Stack</h2>
      <p className="section-subheading">Technologies I work with</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(grouped).map(([category, items]) => (
          <GlassCard key={category}>
            <h3 className="text-white font-semibold mb-4">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((skill) => (
                <Badge key={skill.name} variant="cyan">{skill.name}</Badge>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Write `src/components/sections/Projects.tsx`**

```typescript
import Link from 'next/link'
import { Project } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface ProjectsProps {
  projects: Project[]
}

export function Projects({ projects }: ProjectsProps) {
  if (!projects.length) return null
  return (
    <section id="projects" className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="section-heading">Featured Projects</h2>
      <p className="section-subheading">Things I&apos;ve built</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <GlassCard key={project.id} hover className="flex flex-col gap-4">
            {project.image_url && (
              <img src={project.image_url} alt={project.title} className="w-full h-40 object-cover rounded-lg" />
            )}
            <h3 className="text-white font-bold text-lg">{project.title}</h3>
            {project.description && (
              <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{project.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {project.tech_stack.map((tech) => (
                <Badge key={tech} variant="cyan">{tech}</Badge>
              ))}
            </div>
            <div className="flex gap-3 mt-auto">
              <Link href={`/projects/${project.slug}`}>
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">GitHub</Button>
                </a>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Write `src/components/sections/BlogPreview.tsx`**

```typescript
import Link from 'next/link'
import { BlogPost } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'

interface BlogPreviewProps {
  posts: BlogPost[]
}

export function BlogPreview({ posts }: BlogPreviewProps) {
  if (!posts.length) return null
  return (
    <section id="blog" className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="section-heading">Writing</h2>
      <p className="section-subheading">Thoughts and learnings</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {posts.slice(0, 3).map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <GlassCard hover className="h-full flex flex-col gap-3">
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="w-full h-32 object-cover rounded-lg" />
              )}
              <h3 className="text-white font-semibold">{post.title}</h3>
              {post.excerpt && <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>}
              {post.published_at && (
                <p className="text-gray-500 text-xs mt-auto">
                  {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </GlassCard>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link href="/blog">
          <Button variant="outline">View All Posts</Button>
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 8: Write `src/components/sections/Contact.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

type FormData = z.infer<typeof schema>

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="py-24 px-6 max-w-2xl mx-auto">
      <h2 className="section-heading text-center">Get In Touch</h2>
      <p className="section-subheading text-center">Let&apos;s work together</p>

      <GlassCard>
        {status === 'success' ? (
          <div className="text-center py-8">
            <p className="text-green-400 text-lg font-semibold">Message sent!</p>
            <p className="text-gray-400 mt-2">I&apos;ll get back to you soon.</p>
            <Button className="mt-6" onClick={() => setStatus('idle')}>Send another</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Name" placeholder="Alice Smith" error={errors.name?.message} {...register('name')} />
              <Input label="Email" type="email" placeholder="alice@example.com" error={errors.email?.message} {...register('email')} />
            </div>
            <Input label="Subject" placeholder="What's this about?" {...register('subject')} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300 font-medium">Message</label>
              <textarea
                {...register('message')}
                rows={5}
                placeholder="Your message..."
                className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/50 transition-colors text-sm resize-none"
              />
              {errors.message && <p className="text-red-400 text-xs">{errors.message.message}</p>}
            </div>
            <Button type="submit" disabled={status === 'sending'} className="self-end mt-2">
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </Button>
            {status === 'error' && <p className="text-red-400 text-sm">Failed to send. Please try again.</p>}
          </form>
        )}
      </GlassCard>
    </section>
  )
}
```

- [ ] **Step 9: Commit**

```bash
git add src/components/sections/
git commit -m "feat: add all public portfolio section components"
```

---

## Task 11: Public portfolio pages

**Files:**
- Create: `src/app/(public)/layout.tsx`
- Create: `src/app/(public)/page.tsx`
- Create: `src/app/(public)/projects/[slug]/page.tsx`
- Create: `src/app/(public)/blog/page.tsx`
- Create: `src/app/(public)/blog/[slug]/page.tsx`

- [ ] **Step 1: Write `src/app/(public)/layout.tsx`**

```typescript
import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-white text-lg hover:text-cyan transition-colors">
            AlexDev
          </Link>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>
      <main className="pt-16">{children}</main>
      <footer className="border-t border-dark-border py-8 text-center text-gray-500 text-sm">
        <p>Built with Next.js · Designed with love</p>
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/app/(public)/page.tsx`**

```typescript
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Achievements } from '@/components/sections/Achievements'
import { Experience } from '@/components/sections/Experience'
import { Skills } from '@/components/sections/Skills'
import { Projects } from '@/components/sections/Projects'
import { BlogPreview } from '@/components/sections/BlogPreview'
import { Contact } from '@/components/sections/Contact'
import { getAbout } from '@/lib/db/about'
import { getAchievements } from '@/lib/db/achievements'
import { getExperience } from '@/lib/db/experience'
import { getFeaturedProjects } from '@/lib/db/projects'
import { getBlogPosts } from '@/lib/db/blog'

export const revalidate = 60

export default async function HomePage() {
  const [about, achievements, experience, projects, posts] = await Promise.all([
    getAbout(),
    getAchievements(),
    getExperience(),
    getFeaturedProjects(),
    getBlogPosts(),
  ])

  const skills = about?.skills ?? []

  return (
    <>
      <Hero about={about} />
      <About about={about} />
      <Achievements achievements={achievements} />
      <Experience experience={experience} />
      <Skills skills={skills} />
      <Projects projects={projects} />
      <BlogPreview posts={posts} />
      <Contact />
    </>
  )
}
```

- [ ] **Step 3: Write `src/app/(public)/projects/[slug]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { getProjectBySlug, getProjects } from '@/lib/db/projects'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export const revalidate = 60

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((p) => ({ slug: p.slug }))
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) notFound()

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link href="/#projects">
        <Button variant="ghost" size="sm" className="mb-8">← Back to Projects</Button>
      </Link>

      <GlassCard className="flex flex-col gap-6">
        {project.image_url && (
          <img src={project.image_url} alt={project.title} className="w-full h-64 object-cover rounded-lg" />
        )}
        <h1 className="text-3xl font-bold text-white">{project.title}</h1>

        {project.description && (
          <p className="text-gray-300 leading-relaxed">{project.description}</p>
        )}

        <div>
          <h3 className="text-white font-semibold mb-3">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {project.tech_stack.map((t) => (
              <Badge key={t} variant="cyan">{t}</Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">View on GitHub</Button>
            </a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer">
              <Button>Live Demo</Button>
            </a>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/app/(public)/blog/page.tsx`**

```typescript
import Link from 'next/link'
import { getBlogPosts } from '@/lib/db/blog'
import { GlassCard } from '@/components/ui/GlassCard'

export const revalidate = 60

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-white mb-2">Writing</h1>
      <p className="text-gray-400 mb-12">Thoughts on software, algorithms, and life.</p>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <GlassCard hover className="flex flex-col gap-3">
                {post.cover_image && (
                  <img src={post.cover_image} alt={post.title} className="w-full h-48 object-cover rounded-lg" />
                )}
                <h2 className="text-xl font-bold text-white">{post.title}</h2>
                {post.excerpt && <p className="text-gray-400">{post.excerpt}</p>}
                {post.published_at && (
                  <p className="text-gray-500 text-sm">
                    {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Write `src/app/(public)/blog/[slug]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getBlogPostBySlug, getBlogPosts } from '@/lib/db/blog'
import { GlassCard } from '@/components/ui/GlassCard'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const revalidate = 60

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug)
  if (!post || !post.published) notFound()

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link href="/blog">
        <Button variant="ghost" size="sm" className="mb-8">← Back to Blog</Button>
      </Link>

      <GlassCard>
        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="w-full h-56 object-cover rounded-lg mb-6" />
        )}
        <h1 className="text-3xl font-bold text-white mb-2">{post.title}</h1>
        {post.published_at && (
          <p className="text-gray-500 text-sm mb-8">
            {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        <div className="prose prose-invert prose-cyan max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content ?? ''}</ReactMarkdown>
        </div>
      </GlassCard>
    </div>
  )
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: Build succeeds. All pages statically generated.

- [ ] **Step 7: Commit**

```bash
git add src/app/\(public\)/
git commit -m "feat: add public portfolio pages (home, projects, blog)"
```

---

## Task 12: Admin layout and dashboard

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/components/admin/AdminNav.tsx`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Write `src/components/admin/AdminNav.tsx`**

```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { clsx } from 'clsx'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/experience', label: 'Experience' },
  { href: '/admin/achievements', label: 'Achievements' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/about', label: 'About' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen glass border-r border-dark-border flex flex-col p-4 gap-1">
      <div className="text-cyan font-bold text-lg px-3 py-4 mb-2">Admin Panel</div>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={clsx(
            'px-3 py-2 rounded-lg text-sm transition-colors',
            pathname === link.href
              ? 'bg-cyan/10 text-cyan'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          {link.label}
        </Link>
      ))}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="mt-auto px-3 py-2 text-sm text-gray-500 hover:text-red-400 text-left transition-colors"
      >
        Sign Out
      </button>
    </aside>
  )
}
```

- [ ] **Step 2: Write `src/app/admin/layout.tsx`**

```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin/AdminNav'
import { SessionProvider } from 'next-auth/react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-dark">
        <AdminNav />
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </SessionProvider>
  )
}
```

- [ ] **Step 3: Write `src/app/admin/page.tsx`**

```typescript
import { getProjects } from '@/lib/db/projects'
import { getMessages } from '@/lib/db/messages'
import { getBlogPosts } from '@/lib/db/blog'
import { getExperience } from '@/lib/db/experience'
import { GlassCard } from '@/components/ui/GlassCard'

export default async function AdminDashboard() {
  const [projects, messages, posts, experience] = await Promise.all([
    getProjects(),
    getMessages(),
    getBlogPosts(false),
    getExperience(),
  ])

  const unread = messages.filter((m) => !m.read).length

  const stats = [
    { label: 'Projects', value: projects.length },
    { label: 'Blog Posts', value: posts.length, sub: `${posts.filter((p) => p.published).length} published` },
    { label: 'Messages', value: messages.length, sub: unread > 0 ? `${unread} unread` : 'All read', highlight: unread > 0 },
    { label: 'Experience Entries', value: experience.length },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <GlassCard key={stat.label}>
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className={`text-4xl font-bold mt-1 ${stat.highlight ? 'text-cyan' : 'text-white'}`}>{stat.value}</p>
            {stat.sub && <p className="text-gray-500 text-xs mt-1">{stat.sub}</p>}
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/layout.tsx src/app/admin/page.tsx src/components/admin/AdminNav.tsx
git commit -m "feat: add admin layout with sidebar navigation and dashboard"
```

---

## Task 13: Admin CRUD pages — Projects, Experience, Achievements

**Files:**
- Create: `src/components/admin/DataTable.tsx`
- Create: `src/components/admin/ProjectForm.tsx`
- Create: `src/app/admin/projects/page.tsx`
- Create: `src/components/admin/ExperienceForm.tsx`
- Create: `src/app/admin/experience/page.tsx`
- Create: `src/components/admin/AchievementForm.tsx`
- Create: `src/app/admin/achievements/page.tsx`

- [ ] **Step 1: Write `src/components/admin/DataTable.tsx`**

```typescript
interface Column<T> {
  key: keyof T
  label: string
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface DataTableProps<T extends { id: string }> {
  data: T[]
  columns: Column<T>[]
  onEdit: (row: T) => void
  onDelete: (id: string) => void
}

export function DataTable<T extends { id: string }>({ data, columns, onEdit, onDelete }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-dark-border">
      <table className="w-full text-sm">
        <thead className="bg-dark-card border-b border-dark-border">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="text-left px-4 py-3 text-gray-400 font-medium">{col.label}</th>
            ))}
            <th className="text-right px-4 py-3 text-gray-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-dark-border hover:bg-white/2 transition-colors">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-gray-300">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                </td>
              ))}
              <td className="px-4 py-3 text-right flex gap-2 justify-end">
                <button onClick={() => onEdit(row)} className="text-cyan hover:text-cyan-dark text-xs font-medium transition-colors">Edit</button>
                <button onClick={() => onDelete(row.id)} className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">No entries yet.</div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/admin/ProjectForm.tsx`**

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
  tech_stack: z.string(), // comma-separated
  image_url: z.string().optional(),
  github_url: z.string().optional(),
  live_url: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
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
      image_url: initial?.image_url ?? '',
      github_url: initial?.github_url ?? '',
      live_url: initial?.live_url ?? '',
      featured: initial?.featured ?? false,
      order: initial?.order ?? 0,
    },
  })

  async function submit(data: FormData) {
    await onSubmit({
      ...data,
      tech_stack: data.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
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
      <div className="grid grid-cols-2 gap-4">
        <Input label="GitHub URL" {...register('github_url')} />
        <Input label="Live URL" {...register('live_url')} />
      </div>
      <Input label="Image URL" {...register('image_url')} />
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

- [ ] **Step 3: Write `src/app/admin/projects/page.tsx`**

```typescript
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
```

- [ ] **Step 4: Write `src/components/admin/ExperienceForm.tsx`**

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Experience } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  start_date: z.string().min(1),
  end_date: z.string().optional(),
  description: z.string().optional(),
  achievements: z.string(), // newline-separated
  logo_url: z.string().optional(),
  order: z.number().default(0),
})

type FormData = z.infer<typeof schema>

interface ExperienceFormProps {
  initial?: Partial<Experience>
  onSubmit: (data: Partial<Experience>) => Promise<void>
  onCancel: () => void
}

export function ExperienceForm({ initial, onSubmit, onCancel }: ExperienceFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: initial?.company ?? '',
      role: initial?.role ?? '',
      start_date: initial?.start_date ?? '',
      end_date: initial?.end_date ?? '',
      description: initial?.description ?? '',
      achievements: initial?.achievements?.join('\n') ?? '',
      logo_url: initial?.logo_url ?? '',
      order: initial?.order ?? 0,
    },
  })

  async function submit(data: FormData) {
    await onSubmit({
      ...data,
      end_date: data.end_date || null,
      achievements: data.achievements.split('\n').map((s) => s.trim()).filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Company" error={errors.company?.message} {...register('company')} />
        <Input label="Role" error={errors.role?.message} {...register('role')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Date" type="date" error={errors.start_date?.message} {...register('start_date')} />
        <Input label="End Date (leave blank for Present)" type="date" {...register('end_date')} />
      </div>
      <Input label="Description" {...register('description')} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-300 font-medium">Achievements (one per line)</label>
        <textarea {...register('achievements')} rows={4} className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/50 text-sm resize-none" />
      </div>
      <div className="flex gap-3 justify-end mt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 5: Write `src/app/admin/experience/page.tsx`**

```typescript
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
```

- [ ] **Step 6: Write `src/components/admin/AchievementForm.tsx`**

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Achievement } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  platform: z.string().min(1),
  rating: z.number().nullable().optional(),
  rank: z.string().optional(),
  problems_solved: z.number().nullable().optional(),
  badge: z.string().optional(),
  profile_url: z.string().optional(),
  category: z.string().optional(),
  order: z.number().default(0),
})

type FormData = z.infer<typeof schema>

interface AchievementFormProps {
  initial?: Partial<Achievement>
  onSubmit: (data: Partial<Achievement>) => Promise<void>
  onCancel: () => void
}

export function AchievementForm({ initial, onSubmit, onCancel }: AchievementFormProps) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      platform: initial?.platform ?? '',
      rating: initial?.rating ?? undefined,
      rank: initial?.rank ?? '',
      problems_solved: initial?.problems_solved ?? undefined,
      badge: initial?.badge ?? '',
      profile_url: initial?.profile_url ?? '',
      category: initial?.category ?? '',
      order: initial?.order ?? 0,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Platform" placeholder="Codeforces" {...register('platform')} />
        <Input label="Category" placeholder="Competitive Programming" {...register('category')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Rating" type="number" {...register('rating', { valueAsNumber: true })} />
        <Input label="Rank" placeholder="Candidate Master" {...register('rank')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Problems Solved" type="number" {...register('problems_solved', { valueAsNumber: true })} />
        <Input label="Badge" placeholder="Master" {...register('badge')} />
      </div>
      <Input label="Profile URL" {...register('profile_url')} />
      <div className="flex gap-3 justify-end mt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 7: Write `src/app/admin/achievements/page.tsx`**

```typescript
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
```

- [ ] **Step 8: Commit**

```bash
git add src/app/admin/projects/ src/app/admin/experience/ src/app/admin/achievements/ src/components/admin/
git commit -m "feat: add admin CRUD pages for projects, experience, and achievements"
```

---

## Task 14: Admin blog editor

**Files:**
- Create: `src/components/admin/BlogEditor.tsx`
- Create: `src/app/admin/blog/page.tsx`

- [ ] **Step 1: Write `src/components/admin/BlogEditor.tsx`**

```typescript
'use client'
import dynamic from 'next/dynamic'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { BlogPost } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Dynamic import to avoid SSR issues with the markdown editor
const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((mod) => mod.default), { ssr: false })

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  cover_image: z.string().optional(),
  content: z.string().optional(),
  published: z.boolean().default(false),
})

type FormData = z.infer<typeof schema>

interface BlogEditorProps {
  initial?: Partial<BlogPost>
  onSubmit: (data: Partial<BlogPost>) => Promise<void>
  onCancel: () => void
}

export function BlogEditor({ initial, onSubmit, onCancel }: BlogEditorProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      slug: initial?.slug ?? '',
      excerpt: initial?.excerpt ?? '',
      cover_image: initial?.cover_image ?? '',
      content: initial?.content ?? '',
      published: initial?.published ?? false,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" data-color-mode="dark">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <Input label="Slug" error={errors.slug?.message} {...register('slug')} />
      </div>
      <Input label="Excerpt" {...register('excerpt')} />
      <Input label="Cover Image URL" {...register('cover_image')} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-300 font-medium">Content (Markdown)</label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <MDEditor value={field.value} onChange={field.onChange} height={400} />
          )}
        />
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="published" {...register('published')} className="accent-cyan" />
        <label htmlFor="published" className="text-sm text-gray-300">Published</label>
      </div>

      <div className="flex gap-3 justify-end mt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Write `src/app/admin/blog/page.tsx`**

```typescript
'use client'
import { useState, useEffect, useCallback } from 'react'
import { BlogPost } from '@/types'
import { DataTable } from '@/components/admin/DataTable'
import { BlogEditor } from '@/components/admin/BlogEditor'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/blog')
    setPosts(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(data: Partial<BlogPost>) {
    if (editing) {
      await fetch(`/api/admin/blog/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    } else {
      await fetch('/api/admin/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setEditing(null)
    setCreating(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
        <Button onClick={() => { setCreating(true); setEditing(null) }}>+ New Post</Button>
      </div>

      {(creating || editing) && (
        <GlassCard className="mb-8">
          <h2 className="text-white font-semibold mb-4">{editing ? 'Edit Post' : 'New Post'}</h2>
          <BlogEditor initial={editing ?? undefined} onSubmit={handleSave} onCancel={() => { setEditing(null); setCreating(false) }} />
        </GlassCard>
      )}

      <DataTable
        data={posts}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'slug', label: 'Slug' },
          {
            key: 'published',
            label: 'Status',
            render: (v) => <Badge variant={v ? 'green' : 'gray'}>{v ? 'Published' : 'Draft'}</Badge>,
          },
          {
            key: 'published_at',
            label: 'Published At',
            render: (v) => v ? new Date(v as string).toLocaleDateString() : '–',
          },
        ]}
        onEdit={(row) => { setEditing(row); setCreating(false) }}
        onDelete={handleDelete}
      />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/blog/ src/components/admin/BlogEditor.tsx
git commit -m "feat: add admin blog CRUD page with Markdown editor"
```

---

## Task 15: Admin messages and about pages

**Files:**
- Create: `src/app/admin/messages/page.tsx`
- Create: `src/components/admin/AboutForm.tsx`
- Create: `src/app/admin/about/page.tsx`

- [ ] **Step 1: Write `src/app/admin/messages/page.tsx`**

```typescript
'use client'
import { useState, useEffect, useCallback } from 'react'
import { ContactMessage } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/messages')
    // messages API uses the admin about route for messages list
    // We need a GET endpoint for messages
    setMessages(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function markRead(id: string) {
    await fetch(`/api/admin/messages/${id}`, { method: 'PUT' })
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Contact Messages</h1>

      {messages.length === 0 ? (
        <p className="text-gray-500">No messages yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <GlassCard key={msg.id} className={msg.read ? 'opacity-60' : ''}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{msg.name}</span>
                    {!msg.read && <Badge variant="cyan">New</Badge>}
                  </div>
                  <p className="text-gray-400 text-sm">{msg.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-gray-500 text-xs">{new Date(msg.created_at).toLocaleDateString()}</span>
                  {!msg.read && (
                    <Button size="sm" variant="outline" onClick={() => markRead(msg.id)}>Mark read</Button>
                  )}
                </div>
              </div>
              {msg.subject && <p className="text-gray-300 text-sm font-medium mb-1">{msg.subject}</p>}
              <p className="text-gray-400 text-sm leading-relaxed">{msg.message}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add GET /api/admin/messages route**

Add `src/app/api/admin/messages/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { getMessages } from '@/lib/db/messages'

export async function GET() {
  const messages = await getMessages()
  return NextResponse.json(messages)
}
```

- [ ] **Step 3: Write `src/components/admin/AboutForm.tsx`**

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { About } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
  resume_url: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  skills: z.string(), // JSON textarea
  education: z.string(), // JSON textarea
})

type FormData = z.infer<typeof schema>

interface AboutFormProps {
  initial: About | null
  onSubmit: (data: Partial<About>) => Promise<void>
}

export function AboutForm({ initial, onSubmit }: AboutFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: initial?.bio ?? '',
      avatar_url: initial?.avatar_url ?? '',
      resume_url: initial?.resume_url ?? '',
      github: initial?.social_links?.github ?? '',
      linkedin: initial?.social_links?.linkedin ?? '',
      twitter: initial?.social_links?.twitter ?? '',
      skills: JSON.stringify(initial?.skills ?? [], null, 2),
      education: JSON.stringify(initial?.education ?? [], null, 2),
    },
  })

  async function submit(data: FormData) {
    let skills = initial?.skills ?? []
    let education = initial?.education ?? []
    try { skills = JSON.parse(data.skills) } catch { /* keep existing */ }
    try { education = JSON.parse(data.education) } catch { /* keep existing */ }

    await onSubmit({
      bio: data.bio,
      avatar_url: data.avatar_url,
      resume_url: data.resume_url,
      social_links: { github: data.github, linkedin: data.linkedin, twitter: data.twitter },
      skills,
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
            <textarea {...register('bio')} rows={4} className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/50 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Avatar URL" {...register('avatar_url')} />
            <Input label="Resume URL" {...register('resume_url')} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-4">Social Links</h3>
        <div className="grid grid-cols-3 gap-4">
          <Input label="GitHub URL" {...register('github')} />
          <Input label="LinkedIn URL" {...register('linkedin')} />
          <Input label="Twitter URL" {...register('twitter')} />
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">Skills (JSON)</h3>
        <p className="text-gray-500 text-xs mb-2">Format: [{'{'}name: "React", category: "Frameworks", level: "Expert"{'}'}]</p>
        <textarea {...register('skills')} rows={8} className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan/50 resize-y" />
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">Education (JSON)</h3>
        <p className="text-gray-500 text-xs mb-2">Format: [{'{'}degree: "BS CS", institution: "MIT", start_year: 2016, end_year: 2020{'}'}]</p>
        <textarea {...register('education')} rows={6} className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan/50 resize-y" />
      </section>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: Write `src/app/admin/about/page.tsx`**

```typescript
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
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/messages/ src/app/admin/about/ src/components/admin/AboutForm.tsx src/app/api/admin/messages/route.ts
git commit -m "feat: add admin messages viewer and about editor"
```

---

## Task 16: Final build verification

- [ ] **Step 1: Run all tests**

```bash
npx jest --passWithNoTests
```

Expected: All tests pass.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: Build succeeds. Note any warnings about dynamic imports — these are expected for `@uiw/react-md-editor`.

- [ ] **Step 4: Smoke test in dev**

```bash
npm run dev
```

Visit:
- `http://localhost:3000` — portfolio homepage renders
- `http://localhost:3000/blog` — blog listing renders
- `http://localhost:3000/admin` — redirects to `/admin/login`
- `http://localhost:3000/admin/login` — Google login button visible

- [ ] **Step 5: Add `.superpowers/` to `.gitignore`**

Confirm `.gitignore` contains:
```
.superpowers/
```

- [ ] **Step 6: Final commit**

```bash
git add .gitignore
git commit -m "chore: add .superpowers to .gitignore"
```

---

## External Setup Checklist (manual steps)

Before the app works end-to-end, complete these outside of code:

1. **Supabase project** — create at https://supabase.com, run `supabase/schema.sql`
2. **Supabase Storage** — create `portfolio-images` public bucket
3. **Google OAuth app** — create at https://console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client ID. Add `http://localhost:3000/api/auth/callback/google` (dev) and your production URL as authorized redirect URIs.
4. **`.env.local`** — fill in all values from step 5 in Task 1
5. **Vercel** — connect repo, add same env vars as production environment variables
