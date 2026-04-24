# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete ground-up rebuild of the portfolio matching the Claude Design handoff pixel-perfectly, with Supabase DB, NextAuth Google OAuth admin, and full CRUD admin panel.

**Architecture:** CSS variables in `globals.css` for design tokens, Tailwind for layout utilities. Server Components for all public pages (data fetched from Supabase at request time). Client Components only for interactivity (theme toggle, tabs, carousel, admin forms). NextAuth 5 + Google OAuth gates all admin routes via existing middleware.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, CSS variables, Supabase (Postgres + Storage), NextAuth 5 beta, @uiw/react-md-editor, react-markdown, lucide-react, react-hook-form, zod

---

## Phase 0 — Cleanup & Foundation

### Task 1: Wipe old src files and Supabase schema

**Files:**
- Delete: `src/components/` (entire directory)
- Delete: `src/lib/db/` (entire directory)
- Delete: `src/types/index.ts`
- Delete: `src/app/(public)/blog/page.tsx` (old blog listing)
- Delete: `src/app/api/contact/` (entire directory)
- Rewrite: `supabase/schema.sql`

- [ ] **Step 1: Delete old component and type files**

```bash
rm -rf src/components
rm -rf src/lib/db
rm -f src/types/index.ts
rm -rf src/app/api/contact
# Remove old public routes that will be rebuilt
rm -rf src/app/\(public\)
rm -rf src/app/admin/\(protected\)
rm -f src/app/admin/login/page.tsx
# Keep: src/lib/auth.ts, src/lib/supabase.ts, src/lib/supabase-server.ts, middleware.ts
```

- [ ] **Step 2: Write new Supabase schema**

Create `supabase/schema.sql`:

```sql
-- Drop all existing tables
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS about CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS experience CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS skills CASCADE;

-- Drop new tables if re-running
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS career CASCADE;
DROP TABLE IF EXISTS judges CASCADE;
DROP TABLE IF EXISTS contests CASCADE;
DROP TABLE IF EXISTS profile CASCADE;

-- Profile (single row)
CREATE TABLE profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text DEFAULT '',
  handle text DEFAULT '',
  title text DEFAULT '',
  title_alt text DEFAULT '',
  location text DEFAULT '',
  timezone text DEFAULT '',
  status text DEFAULT '',
  years int DEFAULT 0,
  email text DEFAULT '',
  bio text DEFAULT '',
  github text DEFAULT '',
  linkedin text DEFAULT '',
  twitter text DEFAULT '',
  resume_url text DEFAULT '',
  avatar_url text DEFAULT '',
  skills_top jsonb DEFAULT '[]'
);

-- Insert default row so GET always returns a row
INSERT INTO profile (id) VALUES (gen_random_uuid());

-- Online judge platforms
CREATE TABLE judges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  handle text DEFAULT '',
  rating int DEFAULT 0,
  max_rating int DEFAULT 0,
  title text DEFAULT '',
  title_color text DEFAULT '#38bdf8',
  contests_count int DEFAULT 0,
  problems_count int DEFAULT 0,
  trend jsonb DEFAULT '[]',
  "order" int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Contest achievements
CREATE TABLE contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('team', 'individual')),
  rank int DEFAULT 1,
  title text DEFAULT '',
  sub text DEFAULT '',
  year text DEFAULT '',
  position text DEFAULT '',
  "order" int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Skills
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  level int DEFAULT 3 CHECK (level BETWEEN 1 AND 5),
  "order" int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Career timeline
CREATE TABLE career (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text DEFAULT '',
  company text DEFAULT '',
  company_url text DEFAULT '',
  date_label text DEFAULT '',
  location text DEFAULT '',
  is_current boolean DEFAULT false,
  bullets jsonb DEFAULT '[]',
  stack jsonb DEFAULT '[]',
  "order" int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  num text DEFAULT '01',
  title text DEFAULT '',
  tagline text DEFAULT '',
  description text DEFAULT '',
  bullets jsonb DEFAULT '[]',
  stack jsonb DEFAULT '[]',
  github_url text DEFAULT '',
  live_url text DEFAULT '',
  images jsonb DEFAULT '[]',
  "order" int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Blog posts (body stored as markdown)
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text DEFAULT '',
  excerpt text DEFAULT '',
  body text DEFAULT '',
  tag text DEFAULT '',
  read_time text DEFAULT '',
  date_label text DEFAULT '',
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Certifications
CREATE TABLE certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text DEFAULT '',
  date_label text DEFAULT '',
  credential_url text DEFAULT '',
  description text DEFAULT '',
  "order" int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE career ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read profile" ON profile FOR SELECT TO anon USING (true);
CREATE POLICY "Public read judges" ON judges FOR SELECT TO anon USING (true);
CREATE POLICY "Public read contests" ON contests FOR SELECT TO anon USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT TO anon USING (true);
CREATE POLICY "Public read career" ON career FOR SELECT TO anon USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT TO anon USING (true);
CREATE POLICY "Public read certifications" ON certifications FOR SELECT TO anon USING (true);
-- Posts: only published visible to anon
CREATE POLICY "Public read published posts" ON posts FOR SELECT TO anon USING (published = true);
```

- [ ] **Step 3: Run schema in Supabase dashboard**

Open Supabase dashboard → SQL Editor → paste `supabase/schema.sql` → Run.

- [ ] **Step 4: Create Storage buckets**

In Supabase dashboard → Storage → Create three public buckets:
- `avatars` (public)
- `resumes` (public)
- `project-images` (public)

For each bucket set policy: allow public reads, restrict writes to service role only.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: new supabase schema for portfolio redesign"
```

---

### Task 2: TypeScript types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write types**

```typescript
// src/types/index.ts

export interface Profile {
  id: string
  name: string
  handle: string
  title: string
  title_alt: string
  location: string
  timezone: string
  status: string
  years: number
  email: string
  bio: string
  github: string
  linkedin: string
  twitter: string
  resume_url: string
  avatar_url: string
  skills_top: string[]
}

export interface Judge {
  id: string
  name: string
  handle: string
  rating: number
  max_rating: number
  title: string
  title_color: string
  contests_count: number
  problems_count: number
  trend: TrendPoint[]
  order: number
}

export interface TrendPoint {
  contest: string
  rating: number
}

export interface Contest {
  id: string
  type: 'team' | 'individual'
  rank: number
  title: string
  sub: string
  year: string
  position: string
  order: number
}

export interface Skill {
  id: string
  category: string
  name: string
  level: number
  order: number
}

export interface CareerEntry {
  id: string
  role: string
  company: string
  company_url: string
  date_label: string
  location: string
  is_current: boolean
  bullets: string[]
  stack: string[]
  order: number
}

export interface ProjectBullet {
  b: string
  t: string
}

export interface Project {
  id: string
  num: string
  title: string
  tagline: string
  description: string
  bullets: ProjectBullet[]
  stack: string[]
  github_url: string
  live_url: string
  images: string[]
  order: number
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  tag: string
  read_time: string
  date_label: string
  published: boolean
  created_at: string
}

export interface Certification {
  id: string
  title: string
  issuer: string
  date_label: string
  credential_url: string
  description: string
  order: number
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript types for all data models"
```

---

### Task 3: CSS design system

**Files:**
- Rewrite: `src/app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Rewrite globals.css with design tokens and CSS primitives**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap');

:root {
  --accent: #38bdf8;
  --accent-ink: #0284c7;
  --accent-soft: rgba(56, 189, 248, 0.12);
  --bg: #fafaf7;
  --bg-elev: #ffffff;
  --ink: #0a0a0a;
  --ink-2: #3f3f46;
  --ink-3: #71717a;
  --ink-4: #a1a1aa;
  --line: #e4e4e7;
  --line-strong: #d4d4d8;
  --grid: rgba(10, 10, 10, 0.045);
  --grid-strong: rgba(10, 10, 10, 0.09);
  --good: #16a34a;
  --warn: #eab308;
  --hot: #f97316;
  --red: #ef4444;
  --purple: #a855f7;

  --font-sans: 'Geist', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;
  --font-serif: 'Instrument Serif', ui-serif, Georgia, serif;

  --shadow-sm: 0 1px 0 rgba(10,10,10,0.04), 0 1px 2px rgba(10,10,10,0.04);
  --shadow-md: 0 1px 0 rgba(10,10,10,0.04), 0 6px 24px -8px rgba(10,10,10,0.08);
}

[data-theme="dark"] {
  --bg: #0b0c0f;
  --bg-elev: #121317;
  --ink: #f4f4f5;
  --ink-2: #d4d4d8;
  --ink-3: #a1a1aa;
  --ink-4: #71717a;
  --line: #26272c;
  --line-strong: #3f3f46;
  --grid: rgba(255, 255, 255, 0.05);
  --grid-strong: rgba(255, 255, 255, 0.09);
  --accent-soft: rgba(56, 189, 248, 0.15);
  --shadow-sm: 0 1px 0 rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 1px 0 rgba(0,0,0,0.2), 0 6px 24px -8px rgba(0,0,0,0.5);
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

body {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  font-size: 16px;
  line-height: 1.5;
  overflow-x: hidden;
  transition: background 0.2s, color 0.2s;
}

/* ---- Blueprint grid background ---- */
.grid-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(to right, var(--grid) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 50%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 50%, transparent 100%);
}
.grid-bg::after {
  content: ""; position: absolute; inset: 0;
  background-image:
    linear-gradient(to right, var(--grid-strong) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-strong) 1px, transparent 1px);
  background-size: 240px 240px;
}

/* ---- Layout ---- */
.page { position: relative; z-index: 1; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }

.section { padding: 96px 0 64px; position: relative; }
.section + .section { padding-top: 32px; }

.section-head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 24px; margin-bottom: 40px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}
.section-head .eyebrow { color: var(--ink-3); }
.section-head h2 {
  font-family: var(--font-sans); font-weight: 500;
  font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.02em; margin: 0;
}
.section-head .idx {
  font-family: var(--font-mono); font-size: 12px;
  color: var(--ink-4); letter-spacing: 0.08em;
}

/* ---- Typography ---- */
.mono { font-family: var(--font-mono); }
.serif { font-family: var(--font-serif); font-style: italic; }
.eyebrow {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3);
}
.hl {
  background: linear-gradient(180deg, transparent 62%, var(--accent-soft) 62%);
  padding: 0 2px;
}

/* ---- Nav ---- */
.nav {
  position: sticky; top: 0; z-index: 50;
  backdrop-filter: blur(12px);
  background: color-mix(in oklab, var(--bg) 78%, transparent);
  border-bottom: 1px solid var(--line);
}
.nav-inner {
  max-width: 1200px; margin: 0 auto;
  padding: 14px 32px;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
}
.brand { display: flex; align-items: center; gap: 10px; }
.brand-mark {
  width: 24px; height: 24px;
  border: 1.5px solid var(--ink);
  display: grid; place-items: center;
  font-family: var(--font-mono); font-weight: 700; font-size: 11px;
}
.brand-name { font-family: var(--font-mono); font-size: 13px; font-weight: 500; letter-spacing: -0.01em; }
.brand-name .dim { color: var(--ink-3); }
.nav-links { display: flex; gap: 4px; }
.nav-links a {
  font-family: var(--font-mono); font-size: 12px;
  color: var(--ink-3); text-decoration: none;
  padding: 6px 10px; border-radius: 6px;
  transition: color .15s, background .15s;
}
.nav-links a:hover { color: var(--ink); background: var(--accent-soft); }
.nav-links a .n { color: var(--ink-4); margin-right: 4px; }
.nav-right { display: flex; gap: 10px; align-items: center; }

/* ---- Buttons ---- */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 12px;
  padding: 9px 14px;
  border: 1px solid var(--line-strong); background: var(--bg-elev); color: var(--ink);
  text-decoration: none; cursor: pointer;
  transition: border-color .15s, background .15s; border-radius: 2px;
}
.btn:hover { border-color: var(--ink); }
.btn.primary { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.btn.primary:hover { background: var(--accent-ink); border-color: var(--accent-ink); }
.btn.ghost { background: transparent; }
.btn .k { color: var(--accent); }

.icon-btn {
  width: 34px; height: 34px; display: grid; place-items: center;
  border: 1px solid var(--line-strong); background: var(--bg-elev);
  cursor: pointer; border-radius: 2px; color: var(--ink);
}
.icon-btn:hover { border-color: var(--ink); }

/* ---- Card ---- */
.card {
  background: var(--bg-elev); border: 1px solid var(--line); border-radius: 2px;
  transition: border-color .18s, box-shadow .18s;
}
.card:hover { border-color: var(--line-strong); }

/* ---- Chip ---- */
.chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 11px;
  padding: 4px 8px; border: 1px solid var(--line);
  color: var(--ink-2); border-radius: 2px; background: var(--bg-elev);
}
.chip .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

/* ---- Label row ---- */
.label-row {
  display: flex; gap: 8px; align-items: center;
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-3);
  letter-spacing: 0.06em; text-transform: uppercase;
}
.label-row::before { content: ""; width: 24px; height: 1px; background: var(--ink-3); }

/* ---- Bracket corners ---- */
.bracket { position: relative; }
.bracket::before, .bracket::after,
.bracket > .br-bl, .bracket > .br-br {
  content: ""; position: absolute; width: 10px; height: 10px;
  border: 1.5px solid var(--ink); pointer-events: none;
}
.bracket::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.bracket::after  { top: -1px; right: -1px; border-left: none; border-bottom: none; }
.bracket > .br-bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
.bracket > .br-br { bottom: -1px; right: -1px; border-left: none; border-top: none; }

/* ---- Crosshairs ---- */
.crosshair { position: absolute; width: 16px; height: 16px; pointer-events: none; }
.crosshair::before, .crosshair::after { content: ""; position: absolute; background: var(--ink); }
.crosshair::before { left: 50%; top: 0; width: 1px; height: 100%; transform: translateX(-50%); }
.crosshair::after  { top: 50%; left: 0; height: 1px; width: 100%; transform: translateY(-50%); }
.crosshair.tl { top: -8px; left: -8px; }
.crosshair.tr { top: -8px; right: -8px; }
.crosshair.bl { bottom: -8px; left: -8px; }
.crosshair.br { bottom: -8px; right: -8px; }

/* ---- Scroll reveal ---- */
.reveal { opacity: 0; transform: translateY(8px); transition: opacity .6s, transform .6s; }
.reveal.in { opacity: 1; transform: none; }

/* ---- Hero ---- */
.hero { padding: 72px 0 48px; position: relative; }
.hero-grid {
  display: grid; grid-template-columns: 1.4fr 1fr;
  gap: 48px; align-items: stretch;
}
@media (max-width: 960px) { .hero-grid { grid-template-columns: 1fr; } }
.hero-head .eyebrow { margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
.status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--good);
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--good) 20%, transparent);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 4px color-mix(in oklab, var(--good) 20%, transparent); }
  50%       { box-shadow: 0 0 0 8px color-mix(in oklab, var(--good) 0%, transparent); }
}
.hero h1 {
  font-family: var(--font-sans); font-weight: 500;
  font-size: clamp(44px, 7vw, 88px); letter-spacing: -0.03em; line-height: 1; margin: 0 0 24px;
}
.hero h1 .role {
  font-family: var(--font-serif); font-style: italic; font-weight: 400;
  color: var(--ink-3); font-size: 0.62em; display: block; margin-top: 6px;
}
.hero .bio { font-size: 18px; color: var(--ink-2); max-width: 58ch; line-height: 1.55; margin: 0 0 32px; }
.hero-cta { display: flex; gap: 10px; flex-wrap: wrap; }
.hero-meta { margin-top: 40px; display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--line); }
.hero-meta .cell { padding: 20px 20px 20px 0; border-right: 1px solid var(--line); }
.hero-meta .cell:last-child { border-right: none; padding-right: 0; padding-left: 20px; }
.hero-meta .cell:not(:first-child) { padding-left: 20px; }
.hero-meta .k { font-family: var(--font-mono); font-size: 10px; color: var(--ink-4); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
.hero-meta .v { font-size: 15px; color: var(--ink); }
.hero-meta .v.mono { font-family: var(--font-mono); font-size: 14px; }

/* Avatar card */
.avatar-card { position: relative; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 420px; }
.avatar-wrap { aspect-ratio: 1; background: var(--bg); border: 1px solid var(--line); position: relative; overflow: hidden; }
.avatar-meta { margin-top: 16px; font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); display: flex; flex-direction: column; gap: 4px; }
.avatar-meta .row { display: flex; justify-content: space-between; }
.avatar-meta .row .v { color: var(--ink); }

/* ---- Competitive ---- */
.cp-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 24px; }
@media (max-width: 960px) { .cp-grid { grid-template-columns: 1fr; } }
.judges { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 640px) { .judges { grid-template-columns: 1fr; } }
.judge { padding: 20px; display: flex; flex-direction: column; gap: 12px; position: relative; }
.judge-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.judge-name { font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); letter-spacing: 0.08em; text-transform: uppercase; }
.judge-handle { font-family: var(--font-mono); font-size: 13px; color: var(--ink); margin-top: 4px; }
.judge-rating { font-family: var(--font-sans); font-weight: 500; font-size: 48px; letter-spacing: -0.03em; line-height: 1; }
.rating-block { border: 1px solid var(--line); background: color-mix(in oklab, var(--bg) 50%, var(--bg-elev)); padding: 14px 16px; border-radius: 2px; }
.rating-peak { display: flex; flex-direction: column; gap: 6px; }
.peak-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; }
.peak-dot { width: 6px; height: 6px; border-radius: 50%; box-shadow: 0 0 0 3px color-mix(in oklab, currentColor 18%, transparent); }
.rating-current { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--line); display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.rc-label { font-family: var(--font-mono); font-size: 10px; color: var(--ink-4); letter-spacing: 0.14em; text-transform: uppercase; }
.rc-row { display: flex; align-items: baseline; gap: 8px; }
.rc-val { font-family: var(--font-mono); font-size: 15px; font-weight: 500; color: var(--ink); }
.rc-delta { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.04em; }
.judge-title { font-family: var(--font-mono); font-size: 11px; padding: 3px 8px; border: 1px solid currentColor; display: inline-flex; align-items: center; border-radius: 2px; align-self: flex-start; text-transform: uppercase; letter-spacing: 0.08em; }
.judge-stats { display: flex; gap: 16px; border-top: 1px dashed var(--line); padding-top: 12px; }
.judge-stats .s { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); }
.judge-stats .s strong { display: block; font-size: 15px; color: var(--ink); font-weight: 500; margin-top: 2px; }
.spark { width: 100%; height: 56px; display: block; }
.contests { display: flex; flex-direction: column; }
.contest { padding: 16px 20px; display: grid; grid-template-columns: 60px 1fr auto; gap: 16px; align-items: center; border-top: 1px solid var(--line); transition: background .15s; }
.contest:last-child { border-bottom: 1px solid var(--line); }
.contest:hover { background: var(--accent-soft); }
.contest .rank { font-family: var(--font-sans); font-weight: 500; font-size: 32px; letter-spacing: -0.03em; line-height: 1; }
.contest .rank sup { font-size: 14px; color: var(--ink-3); font-weight: 400; }
.contest .detail .title { font-weight: 500; font-size: 15px; }
.contest .detail .sub { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); margin-top: 3px; letter-spacing: 0.04em; }
.contest .year { font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); padding: 4px 8px; border: 1px solid var(--line); border-radius: 2px; }
.contest .position { font-family: var(--font-mono); font-size: 10px; padding: 2px 6px; border-radius: 2px; margin-left: 8px; letter-spacing: 0.04em; text-transform: uppercase; background: var(--accent-soft); color: var(--accent-ink); border: 1px solid color-mix(in oklab, var(--accent) 30%, transparent); white-space: nowrap; }
.cp-tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid var(--line); }
.cp-tab { font-family: var(--font-mono); font-size: 12px; padding: 10px 14px; background: none; border: none; color: var(--ink-3); cursor: pointer; border-bottom: 1.5px solid transparent; margin-bottom: -1px; }
.cp-tab.active { color: var(--ink); border-bottom-color: var(--accent); }
.cp-tab .n { color: var(--ink-4); margin-left: 6px; font-size: 10px; }

/* ---- Skills ---- */
.skills-wrap { display: grid; grid-template-columns: 200px 1fr; gap: 32px; }
@media (max-width: 720px) { .skills-wrap { grid-template-columns: 1fr; } }
.skills-cats { display: flex; flex-direction: column; gap: 4px; }
.skills-cat { font-family: var(--font-mono); font-size: 12px; padding: 10px 12px; border-left: 2px solid var(--line); color: var(--ink-3); cursor: pointer; background: none; border-top: none; border-right: none; border-bottom: none; text-align: left; transition: all .15s; }
.skills-cat:hover { color: var(--ink); }
.skills-cat.active { color: var(--ink); border-left-color: var(--accent); background: var(--accent-soft); }
.skills-cat .n { color: var(--ink-4); margin-left: 6px; font-size: 10px; }
.skills-cloud { display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start; }
.skill-pill { font-family: var(--font-mono); font-size: 13px; padding: 8px 12px; border: 1px solid var(--line); background: var(--bg-elev); display: inline-flex; align-items: center; gap: 8px; color: var(--ink-2); border-radius: 2px; transition: all .15s; }
.skill-pill:hover { border-color: var(--ink); color: var(--ink); transform: translateY(-1px); }
.skill-pill .lvl { display: inline-flex; gap: 2px; }
.skill-pill .lvl i { width: 4px; height: 4px; background: var(--ink-4); display: inline-block; }
.skill-pill .lvl i.on { background: var(--accent); }
.marquee { overflow: hidden; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 16px 0; background: var(--bg-elev); margin: 32px 0 0; }
.marquee-track { display: flex; gap: 48px; animation: scroll 40s linear infinite; width: max-content; }
.marquee-item { font-family: var(--font-mono); font-size: 13px; color: var(--ink-3); display: flex; gap: 16px; align-items: center; white-space: nowrap; }
.marquee-item .star { color: var(--accent); }
@keyframes scroll { to { transform: translateX(-50%); } }

/* ---- Timeline ---- */
.timeline { position: relative; padding-left: 40px; }
.timeline::before { content: ""; position: absolute; left: 7px; top: 8px; bottom: 8px; width: 1px; background: linear-gradient(to bottom, var(--line), var(--line) 90%, transparent); }
.t-item { position: relative; padding-bottom: 40px; }
.t-item:last-child { padding-bottom: 0; }
.t-item::before { content: ""; position: absolute; left: -40px; top: 8px; width: 15px; height: 15px; border: 1.5px solid var(--ink); background: var(--bg); border-radius: 50%; }
.t-item.current::before { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
.t-card { padding: 20px 24px; background: var(--bg-elev); border: 1px solid var(--line); border-radius: 2px; }
.t-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 4px; }
.t-head .role { font-weight: 500; font-size: 18px; letter-spacing: -0.01em; }
.t-head .co { font-family: var(--font-mono); font-size: 13px; color: var(--ink-3); margin-top: 2px; }
.t-head .co a { color: var(--ink); text-decoration: none; border-bottom: 1px dashed var(--line-strong); }
.t-date { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); white-space: nowrap; letter-spacing: 0.05em; }
.t-bullets { list-style: none; padding: 14px 0 0; margin: 0; display: flex; flex-direction: column; gap: 8px; border-top: 1px dashed var(--line); margin-top: 12px; }
.t-bullets li { padding-left: 18px; position: relative; font-size: 14px; color: var(--ink-2); line-height: 1.5; }
.t-bullets li::before { content: "+"; position: absolute; left: 0; top: 0; font-family: var(--font-mono); color: var(--accent); font-weight: 700; }
.t-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }

/* ---- Projects ---- */
.projects { display: flex; flex-direction: column; gap: 24px; }
.project { padding: 0; display: grid; grid-template-columns: 1.1fr 1fr; gap: 0; overflow: hidden; }
.project:nth-child(even) { grid-template-columns: 1fr 1.1fr; }
.project:nth-child(even) .p-body { order: 2; border-left: 1px solid var(--line); border-right: none; }
.project:nth-child(even) .p-visual { order: 1; }
@media (max-width: 860px) {
  .project, .project:nth-child(even) { grid-template-columns: 1fr; }
  .project:nth-child(even) .p-body { order: 1; border-left: none; }
  .project:nth-child(even) .p-visual { order: 2; }
}
.p-body { padding: 28px; border-right: 1px solid var(--line); display: flex; flex-direction: column; gap: 14px; }
@media (max-width: 860px) { .p-body { border-right: none; border-bottom: 1px solid var(--line); } }
.p-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.p-title { font-size: 22px; font-weight: 500; letter-spacing: -0.02em; }
.p-num { font-family: var(--font-mono); font-size: 11px; color: var(--ink-4); letter-spacing: 0.1em; }
.p-desc { color: var(--ink-2); font-size: 14.5px; line-height: 1.55; }
.p-bullets { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.p-bullets li { font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); padding-left: 18px; position: relative; line-height: 1.5; }
.p-bullets li::before { content: "▸"; position: absolute; left: 0; color: var(--accent); }
.p-bullets li b { color: var(--ink-2); font-weight: 500; }
.p-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; padding-top: 14px; border-top: 1px dashed var(--line); }
.p-actions { display: flex; gap: 8px; margin-top: 12px; }
.p-visual { background: var(--bg); position: relative; min-height: 320px; display: flex; flex-direction: column; overflow: hidden; }
.p-images { flex: 1; position: relative; overflow: hidden; }
.p-img { position: absolute; inset: 0; display: grid; place-items: center; opacity: 0; transition: opacity .4s; padding: 24px; }
.p-img.active { opacity: 1; }
.p-img .frame { width: 100%; height: 100%; border: 1px solid var(--line-strong); background: var(--bg-elev); position: relative; overflow: hidden; }
.p-img-ctrl { display: flex; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--line); background: var(--bg-elev); font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); align-items: center; }
.p-img-ctrl .dots { display: flex; gap: 4px; }
.p-img-ctrl .dots button { width: 18px; height: 4px; background: var(--line-strong); border: none; padding: 0; cursor: pointer; transition: background .15s; }
.p-img-ctrl .dots button.on { background: var(--ink); }
.p-img-ctrl .arrows { display: flex; gap: 4px; }
.p-img-ctrl .arrows button { width: 22px; height: 22px; display: grid; place-items: center; background: none; border: 1px solid var(--line); cursor: pointer; color: var(--ink-2); }
.p-img-ctrl .arrows button:hover { border-color: var(--ink); color: var(--ink); }

/* ---- Writing ---- */
.writing { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (max-width: 860px) { .writing { grid-template-columns: 1fr; } }
.post-card { padding: 22px; display: flex; flex-direction: column; gap: 14px; text-decoration: none; color: inherit; cursor: pointer; min-height: 220px; justify-content: space-between; transition: transform .2s, border-color .2s; }
.post-card:hover { transform: translateY(-2px); border-color: var(--ink); }
.post-card .date { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); letter-spacing: 0.08em; }
.post-card .title { font-size: 17px; font-weight: 500; letter-spacing: -0.01em; line-height: 1.3; }
.post-card .excerpt { font-size: 13px; color: var(--ink-3); line-height: 1.5; }
.post-card .read { font-family: var(--font-mono); font-size: 11px; color: var(--accent-ink); display: flex; justify-content: space-between; align-items: center; }

/* ---- Certifications ---- */
.certs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (max-width: 860px) { .certs-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .certs-grid { grid-template-columns: 1fr; } }
.cert-card { padding: 22px; display: flex; flex-direction: column; gap: 10px; }
.cert-card .issuer { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); letter-spacing: 0.08em; text-transform: uppercase; }
.cert-card .cert-title { font-size: 16px; font-weight: 500; letter-spacing: -0.01em; line-height: 1.3; }
.cert-card .cert-date { font-family: var(--font-mono); font-size: 11px; color: var(--ink-4); }
.cert-card .cert-desc { font-size: 13px; color: var(--ink-3); line-height: 1.5; }

/* ---- Footer ---- */
footer { margin-top: 80px; padding: 64px 0 32px; border-top: 1px solid var(--line); position: relative; }
.footer-grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
@media (max-width: 720px) { .footer-grid { grid-template-columns: 1fr; } }
.footer-big { font-family: var(--font-sans); font-size: clamp(36px, 5vw, 64px); letter-spacing: -0.03em; line-height: 1; font-weight: 500; }
.footer-big a { color: var(--accent-ink); text-decoration: none; border-bottom: 2px solid var(--accent); }
.footer-links { display: flex; flex-direction: column; gap: 8px; }
.footer-links .h { font-family: var(--font-mono); font-size: 11px; color: var(--ink-4); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
.footer-links a { color: var(--ink-2); text-decoration: none; font-size: 14px; padding: 3px 0; display: inline-flex; gap: 8px; align-items: center; }
.footer-links a:hover { color: var(--accent-ink); }
.footer-links a .arr { font-family: var(--font-mono); font-size: 11px; color: var(--ink-4); }
.footer-bottom { display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 11px; color: var(--ink-4); padding-top: 24px; border-top: 1px dashed var(--line); gap: 16px; flex-wrap: wrap; }

/* ---- Blog post reader ---- */
.post-reader { max-width: 720px; margin: 0 auto; padding: 64px 32px; }
.post-reader .post-meta { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); display: flex; gap: 16px; margin-bottom: 32px; }
.post-reader h1 { font-family: var(--font-serif); font-size: clamp(28px, 5vw, 48px); line-height: 1.2; letter-spacing: -0.02em; margin: 0 0 32px; }
.post-reader .body { font-size: 17px; line-height: 1.7; color: var(--ink-2); }
.post-reader .body h2 { font-family: var(--font-sans); font-weight: 500; font-size: 24px; color: var(--ink); margin: 40px 0 16px; }
.post-reader .body h3 { font-family: var(--font-sans); font-weight: 500; font-size: 20px; color: var(--ink); margin: 32px 0 12px; }
.post-reader .body blockquote { border-left: 3px solid var(--accent); margin: 24px 0; padding: 12px 20px; color: var(--ink-3); font-style: italic; }
.post-reader .body code { font-family: var(--font-mono); font-size: 14px; background: var(--accent-soft); padding: 2px 6px; border-radius: 2px; }
.post-reader .body pre { background: var(--bg-elev); border: 1px solid var(--line); padding: 20px; overflow-x: auto; border-radius: 2px; }
.post-reader .body pre code { background: none; padding: 0; }

/* ---- Selection ---- */
::selection { background: var(--accent); color: #fff; }
```

- [ ] **Step 2: Update tailwind.config.ts to extend with CSS variable references**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        serif: ['var(--font-serif)'],
      },
      colors: {
        bg: 'var(--bg)',
        'bg-elev': 'var(--bg-elev)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        'ink-4': 'var(--ink-4)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "feat: design system CSS variables and Tailwind config"
```

---

### Task 4: Root layout and theme system

**Files:**
- Rewrite: `src/app/layout.tsx`

- [ ] **Step 1: Write root layout with theme init script**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Software Engineer & Competitive Programmer',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script runs before React to prevent theme flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = localStorage.getItem('portfolio_theme');
            document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
          } catch(e) {
            document.documentElement.setAttribute('data-theme', 'dark');
          }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: root layout with FOUC-free theme init"
```

---

---

## Phase 1 — Public Layout & Components

### Task 5: ThemeToggle + shared UI primitives

**Files:**
- Create: `src/components/ui/ThemeToggle.tsx`
- Create: `src/components/ui/Chip.tsx`
- Create: `src/components/ui/Sparkline.tsx`
- Create: `src/components/ui/ScrollReveal.tsx`

- [ ] **Step 1: ThemeToggle (client component)**

```tsx
// src/components/ui/ThemeToggle.tsx
'use client'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('portfolio_theme')
    const t = stored === 'light' ? 'light' : 'dark'
    setTheme(t)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('portfolio_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <button className="icon-btn" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
      {theme === 'dark'
        ? <Sun size={14} />
        : <Moon size={14} />}
    </button>
  )
}
```

- [ ] **Step 2: Chip primitive**

```tsx
// src/components/ui/Chip.tsx
interface ChipProps {
  children: React.ReactNode
  dot?: boolean
}

export default function Chip({ children, dot }: ChipProps) {
  return (
    <span className="chip">
      {dot && <span className="dot" />}
      {children}
    </span>
  )
}
```

- [ ] **Step 3: Sparkline SVG**

```tsx
// src/components/ui/Sparkline.tsx
interface SparklineProps {
  data: number[]
  stroke: string
}

export default function Sparkline({ data, stroke }: SparklineProps) {
  if (!data?.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const W = 200
  const H = 56
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W
      const y = H - ((v - min) / range) * (H - 8) - 4
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="spark" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
```

- [ ] **Step 4: ScrollReveal (client wrapper)**

```tsx
// src/components/ui/ScrollReveal.tsx
'use client'
import { useEffect, useRef } from 'react'

export default function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('in'); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/
git commit -m "feat: ThemeToggle, Chip, Sparkline, ScrollReveal UI primitives"
```

---

### Task 6: Nav component + Public layout

**Files:**
- Create: `src/components/sections/Nav.tsx`
- Create: `src/app/(public)/layout.tsx`
- Create: `src/lib/db/profile.ts`

- [ ] **Step 1: DB query for profile**

```typescript
// src/lib/db/profile.ts
import { createAdminClient } from '@/lib/supabase-server'
import type { Profile } from '@/types'

export async function getProfile(): Promise<Profile> {
  const db = createAdminClient()
  const { data, error } = await db.from('profile').select('*').single()
  if (error || !data) {
    return {
      id: '', name: '', handle: '', title: '', title_alt: '',
      location: '', timezone: '', status: '', years: 0,
      email: '', bio: '', github: '', linkedin: '', twitter: '',
      resume_url: '', avatar_url: '', skills_top: [],
    }
  }
  return data as Profile
}

export async function updateProfile(profile: Partial<Profile>): Promise<void> {
  const db = createAdminClient()
  const { data } = await db.from('profile').select('id').single()
  if (!data) throw new Error('No profile row found')
  const { error } = await db.from('profile').update(profile).eq('id', data.id)
  if (error) throw error
}
```

- [ ] **Step 2: Nav server component — fetches profile for brand initials + resume link**

```tsx
// src/components/sections/Nav.tsx
import Link from 'next/link'
import { Download } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { getProfile } from '@/lib/db/profile'

export default async function Nav() {
  const profile = await getProfile()
  const initials = profile.name
    ? profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AR'

  return (
    <div className="nav">
      <div className="nav-inner">
        <div className="brand">
          <div className="brand-mark">{initials}</div>
          <div className="brand-name">
            {profile.handle || 'portfolio'}<span className="dim">.dev</span>
          </div>
        </div>

        <nav className="nav-links">
          <a href="/#competitive"><span className="n">01</span>competitive</a>
          <a href="/#skills"><span className="n">02</span>skills</a>
          <a href="/#career"><span className="n">03</span>career</a>
          <a href="/#projects"><span className="n">04</span>projects</a>
          <a href="/#writing"><span className="n">05</span>writing</a>
          <a href="/#certifications"><span className="n">06</span>certifications</a>
          <a href="/#contact"><span className="n">07</span>contact</a>
        </nav>

        <div className="nav-right">
          <ThemeToggle />
          {profile.resume_url && (
            <a
              className="btn"
              href={profile.resume_url}
              target="_blank"
              rel="noreferrer"
            >
              <Download size={12} />
              <span>résumé</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Public layout**

```tsx
// src/app/(public)/layout.tsx
import Nav from '@/components/sections/Nav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="grid-bg" />
      <div className="page">
        <Nav />
        {children}
      </div>
    </>
  )
}
```

- [ ] **Step 4: Start dev server and verify Nav renders**

```bash
npm run dev
# Open http://localhost:3000
# Verify: sticky nav with brand mark, numbered links, theme toggle
# Verify: clicking theme toggle switches light/dark with no flash on reload
```

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Nav.tsx src/app/(public)/layout.tsx src/lib/db/profile.ts
git commit -m "feat: Nav component and public layout with grid-bg"
```

---

### Task 7: Hero section

**Files:**
- Create: `src/components/sections/Hero.tsx`

- [ ] **Step 1: Write Hero server component**

```tsx
// src/components/sections/Hero.tsx
import Link from 'next/link'
import { ArrowDown, Github, Mail } from 'lucide-react'
import type { Profile } from '@/types'

export default function Hero({ profile }: { profile: Profile }) {
  return (
    <section className="hero container" id="top">
      <div className="hero-grid">

        {/* Left: text */}
        <div className="hero-head">
          <div className="eyebrow">
            <span className="status-dot" />
            <span>AVAILABLE · {profile.status || 'Open to collaborations'}</span>
            {profile.timezone && (
              <span style={{ color: 'var(--ink-4)', marginLeft: 6 }}>
                · {profile.timezone}
              </span>
            )}
          </div>

          <h1>
            {profile.name || 'Your Name'}.
            <span className="role">
              {profile.title || 'Software Engineer'}{' '}
              <span style={{ color: 'var(--ink-4)' }}>×</span>{' '}
              {profile.title_alt || 'Competitive Programmer'}
            </span>
          </h1>

          <p className="bio">{profile.bio}</p>

          <div className="hero-cta">
            <a className="btn primary" href="#projects">
              <span>View projects</span>
              <ArrowDown size={14} />
            </a>
            {profile.github && (
              <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
                <Github size={14} />
                <span>github</span>
              </a>
            )}
            {profile.email && (
              <a className="btn ghost" href={`mailto:${profile.email}`}>
                <Mail size={14} />
                <span>{profile.email}</span>
              </a>
            )}
          </div>

          <div className="hero-meta">
            <div className="cell">
              <div className="k">Location</div>
              <div className="v">{profile.location || '—'}</div>
            </div>
            <div className="cell">
              <div className="k">Experience</div>
              <div className="v">{profile.years ? `${profile.years}+ years` : '—'}</div>
            </div>
            <div className="cell">
              <div className="k">Handle</div>
              <div className="v mono">@{profile.handle || '—'}</div>
            </div>
          </div>
        </div>

        {/* Right: avatar card */}
        <div className="avatar-card card bracket">
          <span className="br-bl" /><span className="br-br" />
          <span className="crosshair tl" />
          <span className="crosshair tr" />
          <span className="crosshair bl" />
          <span className="crosshair br" />

          <div className="avatar-wrap">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <AvatarPlaceholder />
            )}
          </div>

          <div className="avatar-meta">
            <div className="row">
              <span>◦ identifier</span>
              <span className="v">{profile.handle || 'portfolio'}</span>
            </div>
            <div className="row">
              <span>◦ status</span>
              <span className="v" style={{ color: 'var(--good)' }}>online</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

function AvatarPlaceholder() {
  return (
    <svg viewBox="0 0 320 320" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="var(--line-strong)" />
        </pattern>
        <linearGradient id="face" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.08" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" fill="url(#dots)" />
      <path d="M40 320 Q40 220 160 220 Q280 220 280 320 Z" fill="var(--ink)" />
      <path d="M40 320 Q40 230 160 230 Q280 230 280 320 Z" fill="var(--accent)" opacity="0.08" />
      <rect x="140" y="190" width="40" height="40" fill="var(--ink)" />
      <circle cx="160" cy="140" r="72" fill="url(#face)" stroke="var(--ink)" strokeWidth="1.5" />
      <path d="M96 132 Q100 78 160 70 Q222 78 224 132 Q210 105 160 100 Q112 105 96 132Z" fill="var(--ink)" />
      <circle cx="138" cy="140" r="14" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="182" cy="140" r="14" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="152" y1="140" x2="168" y2="140" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="138" cy="140" r="2" fill="var(--ink)" />
      <circle cx="182" cy="140" r="2" fill="var(--ink)" />
      <path d="M158 152 Q160 160 162 166" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
      <path d="M148 178 Q160 184 172 178" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
      <g stroke="var(--ink)" strokeWidth="1.2" fill="none">
        <path d="M16 16 h10 M16 16 v10" />
        <path d="M304 16 h-10 M304 16 v10" />
        <path d="M16 304 h10 M16 304 v-10" />
        <path d="M304 304 h-10 M304 304 v-10" />
      </g>
      <text x="16" y="312" fontFamily="JetBrains Mono" fontSize="9" fill="var(--ink-3)">PORTRAIT</text>
      <text x="304" y="312" fontFamily="JetBrains Mono" fontSize="9" fill="var(--ink-3)" textAnchor="end">320 × 320</text>
    </svg>
  )
}
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000` — verify hero splits 2-col (text left, avatar card right), status dot pulses green, bracket corners show on avatar card, theme toggle works.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: Hero section with avatar card and bracket corners"
```

---

### Task 8: Competitive Programming section

**Files:**
- Create: `src/components/sections/Competitive.tsx`
- Create: `src/lib/db/judges.ts`
- Create: `src/lib/db/contests.ts`

- [ ] **Step 1: DB queries**

```typescript
// src/lib/db/judges.ts
import { createAdminClient } from '@/lib/supabase-server'
import type { Judge } from '@/types'

export async function getJudges(): Promise<Judge[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('judges')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Judge[]
}

export async function createJudge(judge: Omit<Judge, 'id'>): Promise<Judge> {
  const db = createAdminClient()
  const { data, error } = await db.from('judges').insert(judge).select().single()
  if (error) throw error
  return data as Judge
}

export async function updateJudge(id: string, judge: Partial<Judge>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('judges').update(judge).eq('id', id)
  if (error) throw error
}

export async function deleteJudge(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('judges').delete().eq('id', id)
  if (error) throw error
}
```

```typescript
// src/lib/db/contests.ts
import { createAdminClient } from '@/lib/supabase-server'
import type { Contest } from '@/types'

export async function getContests(): Promise<Contest[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('contests')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Contest[]
}

export async function createContest(contest: Omit<Contest, 'id'>): Promise<Contest> {
  const db = createAdminClient()
  const { data, error } = await db.from('contests').insert(contest).select().single()
  if (error) throw error
  return data as Contest
}

export async function updateContest(id: string, contest: Partial<Contest>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('contests').update(contest).eq('id', id)
  if (error) throw error
}

export async function deleteContest(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('contests').delete().eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 2: JudgeCard and ContestTabs client components**

```tsx
// src/components/sections/Competitive.tsx
'use client'
import { useState } from 'react'
import Sparkline from '@/components/ui/Sparkline'
import type { Judge, Contest } from '@/types'

function JudgeCard({ j }: { j: Judge }) {
  const delta = j.rating - j.max_rating
  return (
    <div className="judge card bracket">
      <span className="br-bl" /><span className="br-br" />
      <div className="judge-head">
        <div>
          <div className="judge-name">{j.name}</div>
          <div className="judge-handle">@{j.handle}</div>
        </div>
        <div className="judge-title" style={{ color: j.title_color }}>{j.title}</div>
      </div>

      <div className="rating-block">
        <div className="rating-peak">
          <div className="peak-eyebrow" style={{ color: j.title_color }}>
            <span className="peak-dot" style={{ background: j.title_color }} />
            peak rating
          </div>
          <div className="judge-rating" style={{ color: j.title_color }}>{j.max_rating}</div>
        </div>
        <div className="rating-current">
          <div className="rc-label">current</div>
          <div className="rc-row">
            <span className="rc-val">{j.rating}</span>
            {delta !== 0 && (
              <span className="rc-delta" style={{ color: delta < 0 ? 'var(--ink-3)' : 'var(--good)' }}>
                {delta > 0 ? '+' : ''}{delta} from peak
              </span>
            )}
            {delta === 0 && (
              <span className="rc-delta" style={{ color: 'var(--good)' }}>at peak</span>
            )}
          </div>
        </div>
      </div>

      <Sparkline data={(j.trend ?? []).map((p) => p.rating)} stroke={j.title_color} />

      <div className="judge-stats">
        <div className="s">Contests<strong>{j.contests_count}</strong></div>
        <div className="s">Solved<strong>{j.problems_count.toLocaleString()}</strong></div>
      </div>
    </div>
  )
}

function ContestRow({ c }: { c: Contest }) {
  const suffix = c.rank === 1 ? 'st' : c.rank === 2 ? 'nd' : c.rank === 3 ? 'rd' : 'th'
  return (
    <div className="contest">
      <div className="rank">
        #{c.rank}<sup>{suffix}</sup>
      </div>
      <div className="detail">
        <div className="title">
          {c.title}
          {c.position && <span className="position">{c.position}</span>}
        </div>
        <div className="sub">{c.sub}</div>
      </div>
      <div className="year">{c.year}</div>
    </div>
  )
}

interface CompetitiveProps {
  judges: Judge[]
  teamContests: Contest[]
  individualContests: Contest[]
}

export default function Competitive({ judges, teamContests, individualContests }: CompetitiveProps) {
  const [tab, setTab] = useState<'team' | 'individual'>('team')
  const contests = tab === 'team' ? teamContests : individualContests

  return (
    <section className="section container" id="competitive">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 01 — The Sport</div>
          <h2>Competitive programming</h2>
        </div>
        <div className="idx">
          {judges.length} judges · {teamContests.length + individualContests.length} contests
        </div>
      </div>

      <div className="cp-grid">
        <div>
          <div className="label-row" style={{ marginBottom: 16 }}>Online judge ratings</div>
          <div className="judges">
            {judges.map((j) => <JudgeCard key={j.id} j={j} />)}
          </div>
        </div>

        <div>
          <div className="label-row" style={{ marginBottom: 16 }}>Contest achievements</div>
          <div className="cp-tabs">
            <button
              className={`cp-tab ${tab === 'team' ? 'active' : ''}`}
              onClick={() => setTab('team')}
            >
              Team<span className="n">{teamContests.length}</span>
            </button>
            <button
              className={`cp-tab ${tab === 'individual' ? 'active' : ''}`}
              onClick={() => setTab('individual')}
            >
              Individual<span className="n">{individualContests.length}</span>
            </button>
          </div>
          <div className="contests">
            {contests.map((c) => <ContestRow key={c.id} c={c} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Competitive.tsx src/lib/db/judges.ts src/lib/db/contests.ts
git commit -m "feat: Competitive section with judge cards, sparklines, contest tabs"
```

---

### Task 9: Skills section

**Files:**
- Create: `src/components/sections/Skills.tsx`
- Create: `src/lib/db/skills.ts`

- [ ] **Step 1: DB queries**

```typescript
// src/lib/db/skills.ts
import { createAdminClient } from '@/lib/supabase-server'
import type { Skill } from '@/types'

export async function getSkills(): Promise<Skill[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('skills')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Skill[]
}

export async function createSkill(skill: Omit<Skill, 'id'>): Promise<Skill> {
  const db = createAdminClient()
  const { data, error } = await db.from('skills').insert(skill).select().single()
  if (error) throw error
  return data as Skill
}

export async function updateSkill(id: string, skill: Partial<Skill>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('skills').update(skill).eq('id', id)
  if (error) throw error
}

export async function deleteSkill(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('skills').delete().eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 2: Skills client component**

```tsx
// src/components/sections/Skills.tsx
'use client'
import { useState } from 'react'
import type { Skill } from '@/types'

function groupByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})
}

function SkillPill({ skill }: { skill: Skill }) {
  return (
    <div className="skill-pill">
      <span>{skill.name}</span>
      <span className="lvl">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} className={i < skill.level ? 'on' : ''} />
        ))}
      </span>
    </div>
  )
}

interface SkillsProps {
  skills: Skill[]
  skillsTop: string[]
}

export default function Skills({ skills, skillsTop }: SkillsProps) {
  const grouped = groupByCategory(skills)
  const cats = Object.keys(grouped)
  const [activeCat, setActiveCat] = useState(cats[0] ?? '')

  const marqueeItems = skillsTop.length ? skillsTop : cats.flatMap((c) => grouped[c].map((s) => s.name))
  const doubled = [...marqueeItems, ...marqueeItems]

  return (
    <section className="section container" id="skills">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 02 — Toolbox</div>
          <h2>Key skills</h2>
        </div>
        <div className="idx">
          {skills.length} entries / {cats.length} domains
        </div>
      </div>

      <div className="skills-wrap">
        <div className="skills-cats">
          {cats.map((c) => (
            <button
              key={c}
              className={`skills-cat ${c === activeCat ? 'active' : ''}`}
              onClick={() => setActiveCat(c)}
            >
              {c}
              <span className="n">{String(grouped[c].length).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
        <div className="skills-cloud">
          {(grouped[activeCat] ?? []).map((s) => (
            <SkillPill key={s.id} skill={s} />
          ))}
        </div>
      </div>

      {doubled.length > 0 && (
        <div className="marquee">
          <div className="marquee-track">
            {doubled.map((s, i) => (
              <div className="marquee-item" key={i}>
                <span className="star">✦</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Skills.tsx src/lib/db/skills.ts
git commit -m "feat: Skills section with category tabs, skill pills, marquee"
```

---

### Task 10: Career section

**Files:**
- Create: `src/components/sections/Career.tsx`
- Create: `src/lib/db/career.ts`

- [ ] **Step 1: DB queries**

```typescript
// src/lib/db/career.ts
import { createAdminClient } from '@/lib/supabase-server'
import type { CareerEntry } from '@/types'

export async function getCareer(): Promise<CareerEntry[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('career')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as CareerEntry[]
}

export async function createCareerEntry(entry: Omit<CareerEntry, 'id'>): Promise<CareerEntry> {
  const db = createAdminClient()
  const { data, error } = await db.from('career').insert(entry).select().single()
  if (error) throw error
  return data as CareerEntry
}

export async function updateCareerEntry(id: string, entry: Partial<CareerEntry>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('career').update(entry).eq('id', id)
  if (error) throw error
}

export async function deleteCareerEntry(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('career').delete().eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 2: Career server component**

```tsx
// src/components/sections/Career.tsx
import Chip from '@/components/ui/Chip'
import type { CareerEntry } from '@/types'

export default function Career({ entries }: { entries: CareerEntry[] }) {
  return (
    <section className="section container" id="career">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 03 — The Path</div>
          <h2>Career timeline</h2>
        </div>
        <div className="idx">{entries.length} roles</div>
      </div>

      <div className="timeline">
        {entries.map((r) => (
          <div key={r.id} className={`t-item${r.is_current ? ' current' : ''}`}>
            <div className="t-card">
              <div className="t-head">
                <div>
                  <div className="role">{r.role}</div>
                  <div className="co">
                    {r.company_url
                      ? <a href={r.company_url} target="_blank" rel="noreferrer">{r.company}</a>
                      : <span>{r.company}</span>}
                    {r.location && (
                      <>
                        <span style={{ color: 'var(--ink-4)', margin: '0 8px' }}>·</span>
                        <span>{r.location}</span>
                      </>
                    )}
                    {r.is_current && (
                      <span style={{ marginLeft: 8, color: 'var(--good)' }}>● now</span>
                    )}
                  </div>
                </div>
                <div className="t-date">{r.date_label}</div>
              </div>

              {r.bullets?.length > 0 && (
                <ul className="t-bullets">
                  {r.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}

              {r.stack?.length > 0 && (
                <div className="t-stack">
                  {r.stack.map((s) => <Chip key={s} dot>{s}</Chip>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Career.tsx src/lib/db/career.ts
git commit -m "feat: Career timeline section"
```

---

### Task 11: Projects section

**Files:**
- Create: `src/components/sections/Projects.tsx`
- Create: `src/components/sections/ProjectCarousel.tsx`
- Create: `src/lib/db/projects.ts`

- [ ] **Step 1: DB queries**

```typescript
// src/lib/db/projects.ts
import { createAdminClient } from '@/lib/supabase-server'
import type { Project } from '@/types'

export async function getProjects(): Promise<Project[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('projects')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Project[]
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const db = createAdminClient()
  const { data, error } = await db.from('projects').insert(project).select().single()
  if (error) throw error
  return data as Project
}

export async function updateProject(id: string, project: Partial<Project>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('projects').update(project).eq('id', id)
  if (error) throw error
}

export async function deleteProject(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('projects').delete().eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 2: ProjectCarousel client component**

```tsx
// src/components/sections/ProjectCarousel.tsx
'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProjectCarousel({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0)
  const n = images.length
  if (!n) return <div className="p-visual" style={{ background: 'var(--bg)' }} />

  const prev = () => setIdx((idx - 1 + n) % n)
  const next = () => setIdx((idx + 1) % n)

  return (
    <div className="p-visual">
      <div className="p-images">
        {images.map((src, i) => (
          <div key={i} className={`p-img${i === idx ? ' active' : ''}`}>
            <div className="frame">
              <img
                src={src}
                alt={`${title} screenshot ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="p-img-ctrl">
        <div>
          <span style={{ color: 'var(--ink-4)' }}>screen </span>
          <span>{String(idx + 1).padStart(2, '0')}/{String(n).padStart(2, '0')}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={i === idx ? 'on' : ''}
                onClick={() => setIdx(i)}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
          <div className="arrows">
            <button onClick={prev} aria-label="Previous"><ChevronLeft size={12} /></button>
            <button onClick={next} aria-label="Next"><ChevronRight size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Projects server component**

```tsx
// src/components/sections/Projects.tsx
import { Github, ExternalLink } from 'lucide-react'
import Chip from '@/components/ui/Chip'
import ProjectCarousel from './ProjectCarousel'
import type { Project } from '@/types'

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="project card bracket">
      <span className="br-bl" /><span className="br-br" />
      <div className="p-body">
        <div className="p-head">
          <div>
            <div className="p-num">PROJECT · {p.num}</div>
            <div className="p-title" style={{ marginTop: 6 }}>{p.title}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {p.github_url && (
              <a className="icon-btn" href={p.github_url} target="_blank" rel="noreferrer" title="GitHub">
                <Github size={14} />
              </a>
            )}
            {p.live_url && (
              <a className="icon-btn" href={p.live_url} target="_blank" rel="noreferrer" title="Live">
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {p.tagline && (
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.35 }}>
            {p.tagline}
          </div>
        )}

        <div className="p-desc">{p.description}</div>

        {p.bullets?.length > 0 && (
          <ul className="p-bullets">
            {p.bullets.map((b, i) => (
              <li key={i}><b>{b.b}:</b> {b.t}</li>
            ))}
          </ul>
        )}

        {p.stack?.length > 0 && (
          <div className="p-stack">
            {p.stack.map((s) => <Chip key={s}>{s}</Chip>)}
          </div>
        )}

        <div className="p-actions">
          {p.github_url && (
            <a className="btn primary" href={p.github_url} target="_blank" rel="noreferrer">
              <Github size={12} />
              <span>Source</span>
              <span style={{ color: 'var(--accent)', marginLeft: 6 }}>→</span>
            </a>
          )}
          {p.live_url && (
            <a className="btn" href={p.live_url} target="_blank" rel="noreferrer">
              <span>Live</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <ProjectCarousel images={p.images ?? []} title={p.title} />
    </article>
  )
}

export default function Projects({ projects }: { projects: Project[] }) {
  return (
    <section className="section container" id="projects">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 04 — Things I&apos;ve made</div>
          <h2>Personal projects</h2>
        </div>
        <div className="idx">{projects.length} projects</div>
      </div>

      <div className="projects">
        {projects.map((p) => <ProjectCard key={p.id} p={p} />)}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Projects.tsx src/components/sections/ProjectCarousel.tsx src/lib/db/projects.ts
git commit -m "feat: Projects section with image carousel"
```

---

### Task 12: Writing section

**Files:**
- Create: `src/components/sections/Writing.tsx`
- Create: `src/lib/db/posts.ts`

- [ ] **Step 1: DB queries**

```typescript
// src/lib/db/posts.ts
import { createAdminClient } from '@/lib/supabase-server'
import type { Post } from '@/types'

export async function getPublishedPosts(): Promise<Post[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Post[]
}

export async function getAllPosts(): Promise<Post[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Post[]
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) return null
  return data as Post
}

export async function createPost(post: Omit<Post, 'id' | 'created_at'>): Promise<Post> {
  const db = createAdminClient()
  const { data, error } = await db.from('posts').insert(post).select().single()
  if (error) throw error
  return data as Post
}

export async function updatePost(id: string, post: Partial<Post>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('posts').update(post).eq('id', id)
  if (error) throw error
}

export async function deletePost(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('posts').delete().eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 2: Writing server component**

```tsx
// src/components/sections/Writing.tsx
import Link from 'next/link'
import type { Post } from '@/types'

export default function Writing({ posts }: { posts: Post[] }) {
  return (
    <section className="section container" id="writing">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 05 — Notes</div>
          <h2>Writing</h2>
        </div>
        <div className="idx">selected posts · read all →</div>
      </div>

      <div className="writing">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="post-card card bracket"
          >
            <span className="br-bl" /><span className="br-br" />
            <div>
              <div className="date">
                {p.date_label} · <span style={{ color: 'var(--accent-ink)' }}>{p.tag}</span>
              </div>
              <div className="title" style={{ marginTop: 10 }}>{p.title}</div>
              <div className="excerpt" style={{ marginTop: 8 }}>{p.excerpt}</div>
            </div>
            <div className="read">
              <span>{p.read_time}</span>
              <span>read →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Writing.tsx src/lib/db/posts.ts
git commit -m "feat: Writing section and posts DB queries"
```

---

### Task 13: Certifications section

**Files:**
- Create: `src/components/sections/Certifications.tsx`
- Create: `src/lib/db/certifications.ts`

- [ ] **Step 1: DB queries**

```typescript
// src/lib/db/certifications.ts
import { createAdminClient } from '@/lib/supabase-server'
import type { Certification } from '@/types'

export async function getCertifications(): Promise<Certification[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('certifications')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Certification[]
}

export async function createCertification(cert: Omit<Certification, 'id'>): Promise<Certification> {
  const db = createAdminClient()
  const { data, error } = await db.from('certifications').insert(cert).select().single()
  if (error) throw error
  return data as Certification
}

export async function updateCertification(id: string, cert: Partial<Certification>): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('certifications').update(cert).eq('id', id)
  if (error) throw error
}

export async function deleteCertification(id: string): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('certifications').delete().eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 2: Certifications server component**

```tsx
// src/components/sections/Certifications.tsx
import { ExternalLink } from 'lucide-react'
import type { Certification } from '@/types'

export default function Certifications({ certs }: { certs: Certification[] }) {
  if (!certs.length) return null

  return (
    <section className="section container" id="certifications">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 06 — Credentials</div>
          <h2>Certifications</h2>
        </div>
        <div className="idx">{certs.length} credentials</div>
      </div>

      <div className="certs-grid">
        {certs.map((c) => (
          <div key={c.id} className="cert-card card bracket">
            <span className="br-bl" /><span className="br-br" />
            <div className="issuer">{c.issuer}</div>
            <div className="cert-title">{c.title}</div>
            {c.date_label && <div className="cert-date">{c.date_label}</div>}
            {c.description && <div className="cert-desc">{c.description}</div>}
            {c.credential_url && (
              <a
                className="btn"
                href={c.credential_url}
                target="_blank"
                rel="noreferrer"
                style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
              >
                <ExternalLink size={12} />
                <span>View credential</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Certifications.tsx src/lib/db/certifications.ts
git commit -m "feat: Certifications section"
```

---

### Task 14: Footer

**Files:**
- Create: `src/components/sections/Footer.tsx`

- [ ] **Step 1: Footer server component**

```tsx
// src/components/sections/Footer.tsx
import { Github, Linkedin, Twitter, Mail, Download, ArrowRight, Trophy } from 'lucide-react'
import type { Profile } from '@/types'

export default function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="container" id="contact">
      <div className="footer-grid">

        {/* Big CTA */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 20 }}>§ 07 — Ping</div>
          <div className="footer-big">
            Have something{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--ink-3)' }}>
              interesting
            </span>{' '}
            to build?
            {profile.email && (
              <div style={{ marginTop: 10 }}>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </div>
            )}
          </div>
        </div>

        {/* Elsewhere */}
        <div className="footer-links">
          <div className="h">Elsewhere</div>
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noreferrer">
              <Github size={14} />
              <span>GitHub</span>
              <span className="arr">/ @{profile.handle}</span>
            </a>
          )}
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              <Linkedin size={14} />
              <span>LinkedIn</span>
              <span className="arr">/ in/{profile.handle}</span>
            </a>
          )}
          {profile.twitter && (
            <a href={profile.twitter} target="_blank" rel="noreferrer">
              <Twitter size={14} />
              <span>Twitter</span>
              <span className="arr">/ @{profile.handle}</span>
            </a>
          )}
          {profile.email && (
            <a href={`mailto:${profile.email}`}>
              <Mail size={14} />
              <span>Email</span>
              <span className="arr">/ direct</span>
            </a>
          )}
        </div>

        {/* Artifacts */}
        <div className="footer-links">
          <div className="h">Artifacts</div>
          {profile.resume_url && (
            <a href={profile.resume_url} target="_blank" rel="noreferrer">
              <Download size={14} />
              <span>Résumé</span>
              <span className="arr">/ PDF</span>
            </a>
          )}
          <a href="#writing">
            <ArrowRight size={14} />
            <span>Blog archive</span>
          </a>
          {profile.github && (
            <a href={`${profile.github}?tab=repositories`} target="_blank" rel="noreferrer">
              <ArrowRight size={14} />
              <span>All repos</span>
            </a>
          )}
          <a href="#competitive">
            <Trophy size={14} />
            <span>Contest log</span>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} {profile.name} · built with Next.js</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>uptime · 99.9%</span>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/Footer.tsx
git commit -m "feat: Footer section"
```

---

### Task 15: Homepage page.tsx

**Files:**
- Create: `src/app/(public)/page.tsx`

- [ ] **Step 1: Write homepage — fetches all data server-side, renders all sections**

```tsx
// src/app/(public)/page.tsx
import { getProfile } from '@/lib/db/profile'
import { getJudges } from '@/lib/db/judges'
import { getContests } from '@/lib/db/contests'
import { getSkills } from '@/lib/db/skills'
import { getCareer } from '@/lib/db/career'
import { getProjects } from '@/lib/db/projects'
import { getPublishedPosts } from '@/lib/db/posts'
import { getCertifications } from '@/lib/db/certifications'

import Hero from '@/components/sections/Hero'
import Competitive from '@/components/sections/Competitive'
import Skills from '@/components/sections/Skills'
import Career from '@/components/sections/Career'
import Projects from '@/components/sections/Projects'
import Writing from '@/components/sections/Writing'
import Certifications from '@/components/sections/Certifications'
import Footer from '@/components/sections/Footer'

export const revalidate = 60

export default async function HomePage() {
  const [profile, judges, contests, skills, career, projects, posts, certs] =
    await Promise.all([
      getProfile(),
      getJudges(),
      getContests(),
      getSkills(),
      getCareer(),
      getProjects(),
      getPublishedPosts(),
      getCertifications(),
    ])

  const teamContests = contests.filter((c) => c.type === 'team')
  const individualContests = contests.filter((c) => c.type === 'individual')

  return (
    <main>
      <Hero profile={profile} />
      <Competitive
        judges={judges}
        teamContests={teamContests}
        individualContests={individualContests}
      />
      <Skills skills={skills} skillsTop={profile.skills_top ?? []} />
      <Career entries={career} />
      <Projects projects={projects} />
      <Writing posts={posts} />
      <Certifications certs={certs} />
      <Footer profile={profile} />
    </main>
  )
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
# Open http://localhost:3000
# Verify all 8 sections render in order
# Verify empty sections (no DB data yet) show gracefully — no crashes
# Verify theme toggle persists across reload
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/page.tsx
git commit -m "feat: homepage wires all sections with parallel server-side data fetching"
```

---

### Task 16: Blog post reader page

**Files:**
- Create: `src/app/(public)/blog/[slug]/page.tsx`

- [ ] **Step 1: Write blog post page**

The body is stored as markdown. Render it using `react-markdown` + `remark-gfm`.

```tsx
// src/app/(public)/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPostBySlug, getPublishedPosts } from '@/lib/db/posts'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <main>
      <article className="post-reader">
        <div className="post-meta">
          <span style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>{post.tag}</span>
          <span>{post.date_label}</span>
          <span>{post.read_time}</span>
        </div>

        <h1>{post.title}</h1>

        <div className="body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.body}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  )
}
```

- [ ] **Step 2: Verify 404 handling**

```bash
# With dev server running:
# Open http://localhost:3000/blog/non-existent-slug
# Expected: Next.js 404 page (not a crash)
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/blog/[slug]/page.tsx
git commit -m "feat: blog post reader page with markdown rendering"
```

---

## Phase 2 — API Routes

### Task 17: Profile API route

**Files:**
- Create: `src/app/api/admin/profile/route.ts`

- [ ] **Step 1: Write test**

```typescript
// src/app/api/admin/profile/__tests__/route.test.ts
import { GET, PUT } from '../route'

jest.mock('@/lib/supabase-server', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({ single: async () => ({ data: { id: '1', name: 'Test' }, error: null }) }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  }),
}))

jest.mock('@/lib/auth', () => ({
  auth: async () => ({ user: { email: 'admin@test.com' } }),
}))

describe('GET /api/admin/profile', () => {
  it('returns profile data', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.name).toBe('Test')
  })
})
```

- [ ] **Step 2: Run test — expect fail**

```bash
npx jest src/app/api/admin/profile --no-coverage 2>&1 | tail -5
# Expected: FAIL — route file does not exist yet
```

- [ ] **Step 3: Implement route**

```typescript
// src/app/api/admin/profile/route.ts
import { NextResponse } from 'next/server'
import { getProfile, updateProfile } from '@/lib/db/profile'

export async function GET() {
  try {
    const profile = await getProfile()
    return NextResponse.json(profile)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    await updateProfile(body)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npx jest src/app/api/admin/profile --no-coverage 2>&1 | tail -5
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/profile/
git commit -m "feat: profile admin API route"
```

---

### Task 18: Judges API routes

**Files:**
- Create: `src/app/api/admin/judges/route.ts`
- Create: `src/app/api/admin/judges/[id]/route.ts`

- [ ] **Step 1: Collection route**

```typescript
// src/app/api/admin/judges/route.ts
import { NextResponse } from 'next/server'
import { getJudges, createJudge } from '@/lib/db/judges'

export async function GET() {
  try {
    const judges = await getJudges()
    return NextResponse.json(judges)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch judges' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const judge = await createJudge(body)
    return NextResponse.json(judge, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create judge' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Item route**

```typescript
// src/app/api/admin/judges/[id]/route.ts
import { NextResponse } from 'next/server'
import { updateJudge, deleteJudge } from '@/lib/db/judges'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    const body = await req.json()
    await updateJudge(id, body)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update judge' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await deleteJudge(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete judge' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/judges/
git commit -m "feat: judges admin API routes"
```

---

### Task 19: Contests, Skills, Career API routes

**Files:**
- Create: `src/app/api/admin/contests/route.ts`
- Create: `src/app/api/admin/contests/[id]/route.ts`
- Create: `src/app/api/admin/skills/route.ts`
- Create: `src/app/api/admin/skills/[id]/route.ts`
- Create: `src/app/api/admin/career/route.ts`
- Create: `src/app/api/admin/career/[id]/route.ts`

All three entities follow the same pattern. Create all six files:

- [ ] **Step 1: Contests routes**

```typescript
// src/app/api/admin/contests/route.ts
import { NextResponse } from 'next/server'
import { getContests, createContest } from '@/lib/db/contests'

export async function GET() {
  try { return NextResponse.json(await getContests()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    return NextResponse.json(await createContest(body), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
```

```typescript
// src/app/api/admin/contests/[id]/route.ts
import { NextResponse } from 'next/server'
import { updateContest, deleteContest } from '@/lib/db/contests'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await updateContest(id, await req.json())
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await deleteContest(id)
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
```

- [ ] **Step 2: Skills routes**

```typescript
// src/app/api/admin/skills/route.ts
import { NextResponse } from 'next/server'
import { getSkills, createSkill } from '@/lib/db/skills'

export async function GET() {
  try { return NextResponse.json(await getSkills()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    return NextResponse.json(await createSkill(await req.json()), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
```

```typescript
// src/app/api/admin/skills/[id]/route.ts
import { NextResponse } from 'next/server'
import { updateSkill, deleteSkill } from '@/lib/db/skills'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await updateSkill(id, await req.json())
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await deleteSkill(id)
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
```

- [ ] **Step 3: Career routes**

```typescript
// src/app/api/admin/career/route.ts
import { NextResponse } from 'next/server'
import { getCareer, createCareerEntry } from '@/lib/db/career'

export async function GET() {
  try { return NextResponse.json(await getCareer()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    return NextResponse.json(await createCareerEntry(await req.json()), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
```

```typescript
// src/app/api/admin/career/[id]/route.ts
import { NextResponse } from 'next/server'
import { updateCareerEntry, deleteCareerEntry } from '@/lib/db/career'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await updateCareerEntry(id, await req.json())
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await deleteCareerEntry(id)
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/contests/ src/app/api/admin/skills/ src/app/api/admin/career/
git commit -m "feat: contests, skills, career admin API routes"
```

---

### Task 20: Projects, Posts, Certifications API routes

**Files:**
- Create: `src/app/api/admin/projects/route.ts`
- Create: `src/app/api/admin/projects/[id]/route.ts`
- Create: `src/app/api/admin/posts/route.ts`
- Create: `src/app/api/admin/posts/[id]/route.ts`
- Create: `src/app/api/admin/certifications/route.ts`
- Create: `src/app/api/admin/certifications/[id]/route.ts`

- [ ] **Step 1: Projects routes**

```typescript
// src/app/api/admin/projects/route.ts
import { NextResponse } from 'next/server'
import { getProjects, createProject } from '@/lib/db/projects'

export async function GET() {
  try { return NextResponse.json(await getProjects()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    return NextResponse.json(await createProject(await req.json()), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
```

```typescript
// src/app/api/admin/projects/[id]/route.ts
import { NextResponse } from 'next/server'
import { updateProject, deleteProject } from '@/lib/db/projects'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await updateProject(id, await req.json())
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await deleteProject(id)
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
```

- [ ] **Step 2: Posts routes**

```typescript
// src/app/api/admin/posts/route.ts
import { NextResponse } from 'next/server'
import { getAllPosts, createPost } from '@/lib/db/posts'

export async function GET() {
  try { return NextResponse.json(await getAllPosts()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Auto-generate slug from title if not provided
    if (!body.slug) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 80)
    }
    return NextResponse.json(await createPost(body), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
```

```typescript
// src/app/api/admin/posts/[id]/route.ts
import { NextResponse } from 'next/server'
import { updatePost, deletePost } from '@/lib/db/posts'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await updatePost(id, await req.json())
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await deletePost(id)
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
```

- [ ] **Step 3: Certifications routes**

```typescript
// src/app/api/admin/certifications/route.ts
import { NextResponse } from 'next/server'
import { getCertifications, createCertification } from '@/lib/db/certifications'

export async function GET() {
  try { return NextResponse.json(await getCertifications()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    return NextResponse.json(await createCertification(await req.json()), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
```

```typescript
// src/app/api/admin/certifications/[id]/route.ts
import { NextResponse } from 'next/server'
import { updateCertification, deleteCertification } from '@/lib/db/certifications'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await updateCertification(id, await req.json())
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await deleteCertification(id)
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/projects/ src/app/api/admin/posts/ src/app/api/admin/certifications/
git commit -m "feat: projects, posts, certifications admin API routes"
```

---

### Task 21: Upload API route

**Files:**
- Create: `src/app/api/admin/upload/route.ts`

- [ ] **Step 1: Implement multipart upload route**

Accepts a `file` field in `FormData` and a `bucket` query param (`avatars` | `resumes` | `project-images`). Returns the public URL.

```typescript
// src/app/api/admin/upload/route.ts
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

const ALLOWED_BUCKETS = ['avatars', 'resumes', 'project-images'] as const
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const bucket = url.searchParams.get('bucket') ?? ''

    if (!ALLOWED_BUCKETS.includes(bucket as (typeof ALLOWED_BUCKETS)[number])) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })

    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const db = createAdminClient()
    const { error } = await db.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = db.storage.from(bucket).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (e) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/admin/upload/route.ts
git commit -m "feat: file upload API route for Supabase Storage"
```

---

## Phase 3 — Admin Panel

### Task 22: Admin login page

**Files:**
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Add admin login CSS to globals.css**

Append to `src/app/globals.css`:

```css
/* ---- Admin login ---- */
.admin-login-wrap {
  min-height: 100vh; display: grid; place-items: center;
  background: #0b0c0f;
  font-family: var(--font-mono);
}
.admin-login-card {
  width: 100%; max-width: 400px;
  border: 1px solid #26272c;
  background: #121317;
  position: relative;
  padding: 32px;
}
.admin-login-card .br-bl,
.admin-login-card .br-br,
.admin-login-card::before,
.admin-login-card::after {
  border-color: #f4f4f5 !important;
}
.admin-login-eyebrow {
  font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
  color: #71717a; margin-bottom: 24px;
  display: flex; align-items: center; gap: 8px;
}
.admin-login-eyebrow .dot {
  width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;
}
.admin-login-title {
  font-family: var(--font-sans); font-size: 22px; font-weight: 500;
  color: #f4f4f5; margin: 0 0 8px; letter-spacing: -0.02em;
}
.admin-login-sub {
  font-size: 12px; color: #71717a; margin-bottom: 32px; line-height: 1.5;
}
.google-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 12px 16px;
  background: #f4f4f5; color: #0a0a0a;
  border: none; cursor: pointer; font-size: 14px; font-weight: 500;
  font-family: var(--font-sans);
  transition: background .15s;
}
.google-btn:hover { background: #ffffff; }
.google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.admin-login-error {
  margin-top: 16px; padding: 12px 16px;
  border: 1px solid #ef4444;
  background: rgba(239,68,68,0.08);
  color: #ef4444; font-size: 12px; line-height: 1.5;
}
```

- [ ] **Step 2: Write login page**

```tsx
// src/app/admin/login/page.tsx
import { redirect } from 'next/navigation'
import { auth, signIn } from '@/lib/auth'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session) redirect('/admin')

  const { error } = await searchParams

  return (
    <div className="admin-login-wrap" data-theme="dark">
      <div className="admin-login-card bracket">
        <span className="br-bl" /><span className="br-br" />

        <div className="admin-login-eyebrow">
          <span className="dot" />
          <span>PORTFOLIO · ADMIN</span>
        </div>

        <h1 className="admin-login-title">Sign in</h1>
        <p className="admin-login-sub">
          Access is restricted to the portfolio owner.<br />
          Sign in with your authorised Google account.
        </p>

        {error && (
          <div className="admin-login-error">
            Access denied. This Google account is not authorised.
          </div>
        )}

        <form
          action={async () => {
            'use server'
            await signIn('google', { redirectTo: '/admin' })
          }}
        >
          <button type="submit" className="google-btn">
            {/* Google G mark */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify**

```bash
# With dev server running:
# Open http://localhost:3000/admin/login
# Verify: dark centered card, bracket corners, Google button
# Verify: /admin redirects to /admin/login when not signed in
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/login/page.tsx src/app/globals.css
git commit -m "feat: admin login page with Google OAuth"
```

---

### Task 23: Admin protected layout + sidebar

**Files:**
- Create: `src/app/admin/(protected)/layout.tsx`
- Create: `src/components/admin/AdminNav.tsx`

- [ ] **Step 1: Add admin layout CSS to globals.css**

Append to `src/app/globals.css`:

```css
/* ---- Admin layout ---- */
.admin-shell {
  min-height: 100vh; display: flex;
  background: var(--bg); color: var(--ink);
}
.admin-sidebar {
  width: 220px; flex-shrink: 0;
  background: var(--bg-elev);
  border-right: 1px solid var(--line);
  display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
}
.admin-sidebar-brand {
  padding: 20px 16px;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-mono); font-size: 12px;
}
.admin-sidebar-brand .mark {
  font-weight: 700; color: var(--accent);
  display: block; margin-bottom: 2px;
}
.admin-nav-links { padding: 8px 0; flex: 1; }
.admin-nav-link {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 16px;
  font-family: var(--font-mono); font-size: 12px;
  color: var(--ink-3); text-decoration: none;
  transition: color .15s, background .15s;
  border-left: 2px solid transparent;
}
.admin-nav-link:hover { color: var(--ink); background: var(--accent-soft); }
.admin-nav-link.active { color: var(--ink); border-left-color: var(--accent); background: var(--accent-soft); }
.admin-sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--line);
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-4);
}
.admin-sidebar-footer .email { color: var(--ink-3); margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-signout-btn {
  width: 100%; padding: 7px 10px; background: none;
  border: 1px solid var(--line); color: var(--ink-3);
  font-family: var(--font-mono); font-size: 11px; cursor: pointer;
  text-align: left; transition: border-color .15s, color .15s;
}
.admin-signout-btn:hover { border-color: var(--red); color: var(--red); }
.admin-content { flex: 1; padding: 40px; overflow-y: auto; }
.admin-page-title {
  font-size: 24px; font-weight: 500; letter-spacing: -0.02em;
  margin: 0 0 32px; color: var(--ink);
}
```

- [ ] **Step 2: AdminNav client component (active link detection)**

```tsx
// src/components/admin/AdminNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User, Gauge, Trophy, Star, Briefcase, FolderOpen,
  PenLine, Award, LayoutDashboard, LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/profile', label: 'Profile', icon: User },
  { href: '/admin/judges', label: 'Judges', icon: Gauge },
  { href: '/admin/contests', label: 'Contests', icon: Trophy },
  { href: '/admin/skills', label: 'Skills', icon: Star },
  { href: '/admin/career', label: 'Career', icon: Briefcase },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/posts', label: 'Posts', icon: PenLine },
  { href: '/admin/certifications', label: 'Certifications', icon: Award },
]

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="mark">◉ ADMIN</span>
        <span style={{ color: 'var(--ink-4)' }}>portfolio cms</span>
      </div>

      <nav className="admin-nav-links">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`admin-nav-link${active ? ' active' : ''}`}
            >
              <Icon size={14} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="email">{email}</div>
        <button
          className="admin-signout-btn"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
        >
          <LogOut size={11} style={{ display: 'inline', marginRight: 6 }} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Protected layout**

```tsx
// src/app/admin/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div className="admin-shell" data-theme="dark">
      <AdminNav email={session.user?.email ?? ''} />
      <main className="admin-content">{children}</main>
    </div>
  )
}
```

- [ ] **Step 4: Verify**

```bash
# With dev server running and signed in:
# Open http://localhost:3000/admin
# Verify: dark sidebar, all 9 nav links, active link highlighted
# Verify: sign-out button sends to /admin/login
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/(protected)/layout.tsx src/components/admin/AdminNav.tsx src/app/globals.css
git commit -m "feat: admin protected layout with sidebar nav"
```

---

### Task 24: Admin shared form primitives + Profile panel

**Files:**
- Create: `src/components/admin/FormField.tsx`
- Create: `src/components/admin/ChipsInput.tsx`
- Create: `src/components/admin/ImageUpload.tsx`
- Create: `src/components/admin/ProfilePanel.tsx`
- Create: `src/app/admin/(protected)/profile/page.tsx`

- [ ] **Step 1: Add admin form CSS to globals.css**

Append to `src/app/globals.css`:

```css
/* ---- Admin forms ---- */
.admin-form { display: flex; flex-direction: column; gap: 20px; max-width: 680px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); letter-spacing: 0.08em; text-transform: uppercase; }
.field-input, .field-textarea, .field-select {
  width: 100%; padding: 9px 12px;
  background: var(--bg-elev); color: var(--ink);
  border: 1px solid var(--line); border-radius: 2px;
  font-family: var(--font-sans); font-size: 14px;
  transition: border-color .15s; outline: none;
}
.field-input:focus, .field-textarea:focus, .field-select:focus { border-color: var(--accent); }
.field-textarea { resize: vertical; min-height: 100px; line-height: 1.5; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.admin-save-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; background: var(--ink); color: var(--bg);
  border: none; cursor: pointer; font-family: var(--font-mono); font-size: 12px;
  transition: background .15s; align-self: flex-start;
}
.admin-save-btn:hover { background: var(--accent-ink); }
.admin-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.admin-status { font-family: var(--font-mono); font-size: 12px; color: var(--good); }
.admin-error { font-family: var(--font-mono); font-size: 12px; color: var(--red); }
.chips-wrap { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.chip-tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 8px; border: 1px solid var(--line);
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-2);
  background: var(--bg-elev); border-radius: 2px;
}
.chip-tag button { background: none; border: none; color: var(--ink-4); cursor: pointer; padding: 0; line-height: 1; font-size: 14px; }
.chip-tag button:hover { color: var(--red); }
.upload-zone {
  border: 1px dashed var(--line); padding: 20px; text-align: center;
  font-family: var(--font-mono); font-size: 12px; color: var(--ink-3);
  cursor: pointer; transition: border-color .15s;
}
.upload-zone:hover { border-color: var(--accent); }
.upload-preview { width: 80px; height: 80px; object-fit: cover; border: 1px solid var(--line); }
```

- [ ] **Step 2: FormField primitive**

```tsx
// src/components/admin/FormField.tsx
interface FormFieldProps {
  label: string
  name: string
  value: string
  onChange: (val: string) => void
  type?: 'text' | 'url' | 'email' | 'number' | 'color'
  multiline?: boolean
  placeholder?: string
}

export default function FormField({ label, name, value, onChange, type = 'text', multiline, placeholder }: FormFieldProps) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor={name}>{label}</label>
      {multiline ? (
        <textarea
          id={name}
          className="field-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={name}
          type={type}
          className="field-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: ChipsInput primitive**

```tsx
// src/components/admin/ChipsInput.tsx
'use client'
import { useState } from 'react'

interface ChipsInputProps {
  label: string
  value: string[]
  onChange: (val: string[]) => void
  placeholder?: string
}

export default function ChipsInput({ label, value, onChange, placeholder = 'Add...' }: ChipsInputProps) {
  const [draft, setDraft] = useState('')

  function add() {
    const v = draft.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setDraft('')
  }

  return (
    <div className="field-group">
      <div className="field-label">{label}</div>
      <div className="chips-wrap">
        {value.map((chip) => (
          <span key={chip} className="chip-tag">
            {chip}
            <button onClick={() => onChange(value.filter((c) => c !== chip))} aria-label={`Remove ${chip}`}>×</button>
          </span>
        ))}
        <input
          className="field-input"
          style={{ width: 140, flex: 'none' }}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: ImageUpload primitive**

```tsx
// src/components/admin/ImageUpload.tsx
'use client'
import { useRef, useState } from 'react'

interface ImageUploadProps {
  label: string
  currentUrl: string
  bucket: 'avatars' | 'resumes' | 'project-images'
  onUploaded: (url: string) => void
  accept?: string
}

export default function ImageUpload({ label, currentUrl, bucket, onUploaded, accept = 'image/*' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(`/api/admin/upload?bucket=${bucket}`, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      onUploaded(json.url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="field-group">
      <div className="field-label">{label}</div>
      {currentUrl && (
        <img src={currentUrl} alt="Current" className="upload-preview" style={{ marginBottom: 8 }} />
      )}
      <div
        className="upload-zone"
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Uploading…' : 'Click to upload'}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>
      {error && <div className="admin-error">{error}</div>}
    </div>
  )
}
```

- [ ] **Step 5: ProfilePanel client component**

```tsx
// src/components/admin/ProfilePanel.tsx
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
```

- [ ] **Step 6: Profile admin page**

```tsx
// src/app/admin/(protected)/profile/page.tsx
import { getProfile } from '@/lib/db/profile'
import ProfilePanel from '@/components/admin/ProfilePanel'

export default async function AdminProfilePage() {
  const profile = await getProfile()
  return (
    <>
      <h1 className="admin-page-title">Profile</h1>
      <ProfilePanel initial={profile} />
    </>
  )
}
```

- [ ] **Step 7: Verify**

```bash
# Open http://localhost:3000/admin/profile
# Verify: all fields render, save button hits PUT /api/admin/profile
# Verify: avatar upload opens file picker, shows preview after upload
# Verify: chips input adds/removes top skills
```

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/ src/app/admin/(protected)/profile/ src/app/globals.css
git commit -m "feat: admin profile panel with form primitives and file upload"
```

---

### Task 25: Judges admin panel

**Files:**
- Create: `src/components/admin/JudgesPanel.tsx`
- Create: `src/app/admin/(protected)/judges/page.tsx`

- [ ] **Step 1: Add admin list/table CSS to globals.css**

Append to `src/app/globals.css`:

```css
/* ---- Admin list panels ---- */
.admin-list { display: flex; flex-direction: column; gap: 12px; max-width: 820px; }
.admin-list-item {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 16px;
  background: var(--bg-elev); border: 1px solid var(--line); border-radius: 2px;
}
.admin-list-item-info { flex: 1; min-width: 0; }
.admin-list-item-title { font-weight: 500; font-size: 14px; color: var(--ink); }
.admin-list-item-sub { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); margin-top: 2px; }
.admin-list-actions { display: flex; gap: 6px; flex-shrink: 0; }
.admin-action-btn {
  padding: 6px 12px; font-family: var(--font-mono); font-size: 11px;
  border: 1px solid var(--line); background: var(--bg); color: var(--ink-2);
  cursor: pointer; border-radius: 2px; transition: all .15s;
}
.admin-action-btn:hover { border-color: var(--ink); color: var(--ink); }
.admin-action-btn.danger:hover { border-color: var(--red); color: var(--red); }
.admin-add-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 16px; background: none;
  border: 1px dashed var(--line); color: var(--ink-3);
  font-family: var(--font-mono); font-size: 12px; cursor: pointer;
  transition: all .15s; border-radius: 2px;
}
.admin-add-btn:hover { border-color: var(--accent); color: var(--accent); }
.admin-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: grid; place-items: center; z-index: 200;
}
.admin-modal {
  background: var(--bg-elev); border: 1px solid var(--line);
  padding: 32px; width: 100%; max-width: 560px;
  max-height: 90vh; overflow-y: auto;
}
.admin-modal-title { font-size: 18px; font-weight: 500; margin: 0 0 24px; }
.admin-modal-actions { display: flex; gap: 10px; margin-top: 24px; }
.trend-editor { display: flex; flex-direction: column; gap: 8px; }
.trend-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: center; }
```

- [ ] **Step 2: JudgesPanel client component**

```tsx
// src/components/admin/JudgesPanel.tsx
'use client'
import { useState } from 'react'
import FormField from './FormField'
import type { Judge, TrendPoint } from '@/types'

const EMPTY: Omit<Judge, 'id'> = {
  name: '', handle: '', rating: 0, max_rating: 0,
  title: '', title_color: '#38bdf8',
  contests_count: 0, problems_count: 0, trend: [], order: 0,
}

function TrendEditor({ trend, onChange }: { trend: TrendPoint[]; onChange: (t: TrendPoint[]) => void }) {
  function update(i: number, field: keyof TrendPoint, val: string) {
    const next = trend.map((p, j) =>
      j === i ? { ...p, [field]: field === 'rating' ? parseInt(val) || 0 : val } : p
    )
    onChange(next)
  }
  function add() { onChange([...trend, { contest: '', rating: 0 }]) }
  function remove(i: number) { onChange(trend.filter((_, j) => j !== i)) }

  return (
    <div className="field-group">
      <div className="field-label">Rating history (for sparkline)</div>
      <div className="trend-editor">
        {trend.map((p, i) => (
          <div key={i} className="trend-row">
            <input className="field-input" value={p.contest} placeholder="Contest name"
              onChange={(e) => update(i, 'contest', e.target.value)} />
            <input className="field-input" type="number" value={p.rating} placeholder="Rating"
              onChange={(e) => update(i, 'rating', e.target.value)} />
            <button className="admin-action-btn danger" onClick={() => remove(i)}>×</button>
          </div>
        ))}
        <button className="admin-add-btn" onClick={add}>+ Add point</button>
      </div>
    </div>
  )
}

function JudgeModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Omit<Judge, 'id'>
  onSave: (j: Omit<Judge, 'id'>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  function set(key: keyof Omit<Judge, 'id'>, val: unknown) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function submit() {
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="admin-modal-title">{initial.name ? 'Edit Judge' : 'Add Judge'}</h2>
        <div className="admin-form">
          <div className="field-row">
            <FormField label="Platform name" name="name" value={form.name} onChange={(v) => set('name', v)} />
            <FormField label="Handle" name="handle" value={form.handle} onChange={(v) => set('handle', v)} />
          </div>
          <div className="field-row">
            <FormField label="Current rating" name="rating" value={String(form.rating)} onChange={(v) => set('rating', parseInt(v) || 0)} type="number" />
            <FormField label="Peak rating" name="max_rating" value={String(form.max_rating)} onChange={(v) => set('max_rating', parseInt(v) || 0)} type="number" />
          </div>
          <div className="field-row">
            <FormField label="Title (e.g. Master)" name="title" value={form.title} onChange={(v) => set('title', v)} />
            <FormField label="Title colour" name="title_color" value={form.title_color} onChange={(v) => set('title_color', v)} type="color" />
          </div>
          <div className="field-row">
            <FormField label="Contests count" name="contests_count" value={String(form.contests_count)} onChange={(v) => set('contests_count', parseInt(v) || 0)} type="number" />
            <FormField label="Problems solved" name="problems_count" value={String(form.problems_count)} onChange={(v) => set('problems_count', parseInt(v) || 0)} type="number" />
          </div>
          <FormField label="Display order" name="order" value={String(form.order)} onChange={(v) => set('order', parseInt(v) || 0)} type="number" />
          <TrendEditor trend={form.trend} onChange={(t) => set('trend', t)} />
        </div>
        <div className="admin-modal-actions">
          <button className="admin-save-btn" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="admin-action-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function JudgesPanel({ initial }: { initial: Judge[] }) {
  const [judges, setJudges] = useState(initial)
  const [editing, setEditing] = useState<Judge | null>(null)
  const [adding, setAdding] = useState(false)

  async function handleSave(data: Omit<Judge, 'id'>) {
    if (editing) {
      await fetch(`/api/admin/judges/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setJudges((j) => j.map((jj) => jj.id === editing.id ? { ...jj, ...data } : jj))
    } else {
      const res = await fetch('/api/admin/judges', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const created = await res.json()
      setJudges((j) => [...j, created])
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this judge?')) return
    await fetch(`/api/admin/judges/${id}`, { method: 'DELETE' })
    setJudges((j) => j.filter((jj) => jj.id !== id))
  }

  return (
    <>
      <div className="admin-list">
        {judges.map((j) => (
          <div key={j.id} className="admin-list-item">
            <div className="admin-list-item-info">
              <div className="admin-list-item-title" style={{ color: j.title_color }}>
                {j.name}
              </div>
              <div className="admin-list-item-sub">
                @{j.handle} · Peak {j.max_rating} · Current {j.rating} · {j.title}
              </div>
            </div>
            <div className="admin-list-actions">
              <button className="admin-action-btn" onClick={() => { setEditing(j); setAdding(false) }}>Edit</button>
              <button className="admin-action-btn danger" onClick={() => handleDelete(j.id)}>Delete</button>
            </div>
          </div>
        ))}
        <button className="admin-add-btn" onClick={() => { setAdding(true); setEditing(null) }}>
          + Add judge
        </button>
      </div>

      {(adding || editing) && (
        <JudgeModal
          initial={editing ?? EMPTY}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 3: Judges admin page**

```tsx
// src/app/admin/(protected)/judges/page.tsx
import { getJudges } from '@/lib/db/judges'
import JudgesPanel from '@/components/admin/JudgesPanel'

export default async function AdminJudgesPage() {
  const judges = await getJudges()
  return (
    <>
      <h1 className="admin-page-title">Online Judges</h1>
      <JudgesPanel initial={judges} />
    </>
  )
}
```

- [ ] **Step 4: Verify**

```bash
# Open http://localhost:3000/admin/judges
# Verify: list of judges, edit opens modal with all fields + trend editor
# Verify: add judge → appears in list, delete → removes with confirm
# Verify: trend editor adds/removes rating points
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/JudgesPanel.tsx src/app/admin/(protected)/judges/
git commit -m "feat: judges admin panel with trend point editor"
```

---

### Task 26: Contests admin panel

**Files:**
- Create: `src/components/admin/ContestsPanel.tsx`
- Create: `src/app/admin/(protected)/contests/page.tsx`

- [ ] **Step 1: ContestsPanel component**

```tsx
// src/components/admin/ContestsPanel.tsx
'use client'
import { useState } from 'react'
import type { Contest } from '@/types'

const EMPTY_TEAM: Omit<Contest, 'id'> = { type: 'team', rank: 0, title: '', sub: '', year: '', position: '', order: 0 }
const EMPTY_IND: Omit<Contest, 'id'> = { ...EMPTY_TEAM, type: 'individual' }

function ContestModal({ initial, onSave, onClose }: {
  initial: Omit<Contest, 'id'>
  onSave: (data: Omit<Contest, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: k === 'rank' || k === 'order' ? Number(e.target.value) : e.target.value }))
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <span>{initial.title ? 'Edit Contest' : 'Add Contest'}</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="admin-form">
          <label className="admin-label">Rank</label>
          <input className="admin-input" type="number" value={form.rank ?? ''} onChange={set('rank')} />
          <label className="admin-label">Title</label>
          <input className="admin-input" value={form.title ?? ''} onChange={set('title')} />
          <label className="admin-label">Sub-label</label>
          <input className="admin-input" value={form.sub ?? ''} onChange={set('sub')} />
          <label className="admin-label">Year</label>
          <input className="admin-input" value={form.year ?? ''} onChange={set('year')} />
          <label className="admin-label">Position / Award</label>
          <input className="admin-input" value={form.position ?? ''} onChange={set('position')} />
          <label className="admin-label">Order</label>
          <input className="admin-input" type="number" value={form.order} onChange={set('order')} />
        </div>
        <div className="admin-modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function ContestsPanel({ initial }: { initial: Contest[] }) {
  const [contests, setContests] = useState(initial)
  const [tab, setTab] = useState<'team' | 'individual'>('team')
  const [editing, setEditing] = useState<Contest | null>(null)
  const [adding, setAdding] = useState(false)

  const visible = contests.filter(c => c.type === tab).sort((a, b) => a.order - b.order)

  const handleSave = async (data: Omit<Contest, 'id'>) => {
    const full = { ...data, type: tab }
    if (editing) {
      const res = await fetch(`/api/admin/contests/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(full)
      })
      const updated: Contest = await res.json()
      setContests(prev => prev.map(c => c.id === editing.id ? updated : c))
      setEditing(null)
    } else {
      const res = await fetch('/api/admin/contests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(full)
      })
      const created: Contest = await res.json()
      setContests(prev => [...prev, created])
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contest?')) return
    await fetch(`/api/admin/contests/${id}`, { method: 'DELETE' })
    setContests(prev => prev.filter(c => c.id !== id))
  }

  return (
    <>
      <div className="admin-tabs">
        {(['team', 'individual'] as const).map(t => (
          <button key={t} className={`admin-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'team' ? 'Team' : 'Individual'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn primary" onClick={() => setAdding(true)}>+ Add {tab}</button>
      </div>
      <div className="admin-list">
        {visible.map(c => (
          <div key={c.id} className="admin-list-item">
            <div>
              <span className="admin-list-num">#{c.rank}</span>
              <strong>{c.title}</strong>
              {c.position && <span className="chip" style={{ marginLeft: 8 }}>{c.position}</span>}
              {c.year && <span style={{ color: 'var(--ink-3)', marginLeft: 8, fontSize: 12 }}>{c.year}</span>}
              {c.sub && <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>{c.sub}</div>}
            </div>
            <div className="admin-item-actions">
              <button className="btn ghost" onClick={() => setEditing(c)}>Edit</button>
              <button className="btn ghost" style={{ color: 'var(--red)' }} onClick={() => handleDelete(c.id)}>Delete</button>
            </div>
          </div>
        ))}
        {visible.length === 0 && <div style={{ color: 'var(--ink-3)', padding: '24px 0' }}>No {tab} contests yet.</div>}
      </div>
      {(adding || editing) && (
        <ContestModal
          initial={editing ? { type: editing.type, rank: editing.rank, title: editing.title, sub: editing.sub, year: editing.year, position: editing.position, order: editing.order } : (tab === 'team' ? EMPTY_TEAM : EMPTY_IND)}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Contests admin page**

```tsx
// src/app/admin/(protected)/contests/page.tsx
import { getContests } from '@/lib/db/contests'
import ContestsPanel from '@/components/admin/ContestsPanel'

export default async function AdminContestsPage() {
  const contests = await getContests()
  return (
    <>
      <h1 className="admin-page-title">Contests</h1>
      <ContestsPanel initial={contests} />
    </>
  )
}
```

- [ ] **Step 3: Verify**

```bash
# Open http://localhost:3000/admin/contests
# Verify: team tab shows team contests, individual tab shows individual
# Verify: add/edit/delete work for each tab type
# Verify: rank, position chip, year, sub-label display correctly
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/ContestsPanel.tsx src/app/admin/(protected)/contests/
git commit -m "feat: contests admin panel with team/individual tabs"
```

---

### Task 27: Skills admin panel

**Files:**
- Create: `src/components/admin/SkillsPanel.tsx`
- Create: `src/app/admin/(protected)/skills/page.tsx`

- [ ] **Step 1: SkillsPanel component**

```tsx
// src/components/admin/SkillsPanel.tsx
'use client'
import { useState } from 'react'
import type { Skill } from '@/types'

function SkillRow({ skill, onUpdate, onDelete }: {
  skill: Skill
  onUpdate: (s: Skill) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(skill.name)
  const [level, setLevel] = useState(skill.level)

  const save = async () => {
    const res = await fetch(`/api/admin/skills/${skill.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, level, category: skill.category, order: skill.order })
    })
    const updated: Skill = await res.json()
    onUpdate(updated)
    setEditing(false)
  }

  if (editing) return (
    <div className="admin-skill-row editing">
      <input className="admin-input" style={{ flex: 1 }} value={name} onChange={e => setName(e.target.value)} />
      <div style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4,5].map(d => (
          <button key={d} className={`skill-dot-btn${level >= d ? ' filled' : ''}`} onClick={() => setLevel(d)}>{d <= level ? '◆' : '◇'}</button>
        ))}
      </div>
      <button className="btn primary" style={{ fontSize: 12 }} onClick={save}>Save</button>
      <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => setEditing(false)}>Cancel</button>
    </div>
  )
  return (
    <div className="admin-skill-row">
      <span style={{ flex: 1 }}>{skill.name}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 2, color: 'var(--accent)' }}>
        {'◆'.repeat(skill.level)}{'◇'.repeat(5 - skill.level)}
      </span>
      <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => setEditing(true)}>Edit</button>
      <button className="btn ghost" style={{ fontSize: 12, color: 'var(--red)' }} onClick={() => onDelete(skill.id)}>×</button>
    </div>
  )
}

export default function SkillsPanel({ initial }: { initial: Skill[] }) {
  const [skills, setSkills] = useState(initial)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [newName, setNewName] = useState('')
  const [newLevel, setNewLevel] = useState(3)
  const [newCategory, setNewCategory] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [catName, setCatName] = useState('')

  const categories = Array.from(new Set(skills.map(s => s.category)))
  const current = activeCategory || categories[0] || ''
  const visible = skills.filter(s => s.category === current).sort((a, b) => a.order - b.order)

  const handleUpdate = (updated: Skill) => setSkills(prev => prev.map(s => s.id === updated.id ? updated : s))
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return
    await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' })
    setSkills(prev => prev.filter(s => s.id !== id))
  }

  const handleAddSkill = async () => {
    if (!newName.trim() || !current) return
    const order = visible.length
    const res = await fetch('/api/admin/skills', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), level: newLevel, category: current, order })
    })
    const created: Skill = await res.json()
    setSkills(prev => [...prev, created])
    setNewName('')
    setNewLevel(3)
  }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Category sidebar */}
      <div style={{ width: 180, flexShrink: 0 }}>
        {categories.map(cat => (
          <button key={cat} className={`admin-cat-btn${current === cat ? ' active' : ''}`} onClick={() => setActiveCategory(cat)}>
            {cat}
          </button>
        ))}
        {addingCategory ? (
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            <input className="admin-input" style={{ flex: 1, fontSize: 12 }} placeholder="Category name" value={catName} onChange={e => setCatName(e.target.value)} />
            <button className="btn primary" style={{ fontSize: 12 }} onClick={() => {
              if (catName.trim()) {
                setActiveCategory(catName.trim())
                setNewCategory(catName.trim())
                setAddingCategory(false)
                setCatName('')
              }
            }}>+</button>
          </div>
        ) : (
          <button className="btn ghost" style={{ width: '100%', marginTop: 8, fontSize: 12 }} onClick={() => setAddingCategory(true)}>+ Category</button>
        )}
      </div>

      {/* Skills list */}
      <div style={{ flex: 1 }}>
        <div className="admin-list" style={{ marginBottom: 16 }}>
          {visible.map(s => (
            <SkillRow key={s.id} skill={s} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
          {visible.length === 0 && <div style={{ color: 'var(--ink-3)', padding: '12px 0' }}>No skills in this category yet.</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="admin-input" style={{ flex: 1 }} placeholder="New skill name" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSkill()} />
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4,5].map(d => (
              <button key={d} className="skill-dot-btn" style={{ color: d <= newLevel ? 'var(--accent)' : 'var(--ink-4)' }} onClick={() => setNewLevel(d)}>
                {d <= newLevel ? '◆' : '◇'}
              </button>
            ))}
          </div>
          <button className="btn primary" onClick={handleAddSkill}>Add</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Skills admin page**

```tsx
// src/app/admin/(protected)/skills/page.tsx
import { getSkills } from '@/lib/db/skills'
import SkillsPanel from '@/components/admin/SkillsPanel'

export default async function AdminSkillsPage() {
  const skills = await getSkills()
  return (
    <>
      <h1 className="admin-page-title">Skills</h1>
      <SkillsPanel initial={skills} />
    </>
  )
}
```

- [ ] **Step 3: Verify**

```bash
# Open http://localhost:3000/admin/skills
# Verify: sidebar shows categories, clicking switches skill list
# Verify: dot level selector works inline
# Verify: add skill → appears in list; edit inline; delete removes
# Verify: adding a new category creates the sidebar button
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/SkillsPanel.tsx src/app/admin/(protected)/skills/
git commit -m "feat: skills admin panel with category sidebar and level picker"
```

---

### Task 28: Career admin panel

**Files:**
- Create: `src/components/admin/CareerPanel.tsx`
- Create: `src/app/admin/(protected)/career/page.tsx`

- [ ] **Step 1: CareerPanel component**

```tsx
// src/components/admin/CareerPanel.tsx
'use client'
import { useState } from 'react'
import type { CareerEntry } from '@/types'
import ChipsInput from './ChipsInput'

const EMPTY: Omit<CareerEntry, 'id'> = {
  role: '', company: '', company_url: '', date_label: '',
  location: '', is_current: false, bullets: [], stack: [], order: 0
}

function CareerModal({ initial, onSave, onClose }: {
  initial: Omit<CareerEntry, 'id'>
  onSave: (data: Omit<CareerEntry, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const [bulletInput, setBulletInput] = useState('')

  const set = <K extends keyof typeof form>(k: K) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: k === 'order' ? Number(e.target.value) : e.target.value }))

  const addBullet = () => {
    if (!bulletInput.trim()) return
    setForm(prev => ({ ...prev, bullets: [...prev.bullets, bulletInput.trim()] }))
    setBulletInput('')
  }

  const removeBullet = (i: number) =>
    setForm(prev => ({ ...prev, bullets: prev.bullets.filter((_, j) => j !== i) }))

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 600 }}>
        <div className="admin-modal-header">
          <span>{form.role ? 'Edit Role' : 'Add Role'}</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="admin-form" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
          <label className="admin-label">Role / Title</label>
          <input className="admin-input" value={form.role ?? ''} onChange={set('role')} />
          <label className="admin-label">Company</label>
          <input className="admin-input" value={form.company ?? ''} onChange={set('company')} />
          <label className="admin-label">Company URL</label>
          <input className="admin-input" value={form.company_url ?? ''} onChange={set('company_url')} />
          <label className="admin-label">Date Label (e.g. "Jan 2024 – Present")</label>
          <input className="admin-input" value={form.date_label ?? ''} onChange={set('date_label')} />
          <label className="admin-label">Location</label>
          <input className="admin-input" value={form.location ?? ''} onChange={set('location')} />
          <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.is_current} onChange={e => setForm(prev => ({ ...prev, is_current: e.target.checked }))} />
            Current role
          </label>
          <label className="admin-label">Bullets</label>
          <div style={{ marginBottom: 8 }}>
            {form.bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <span style={{ flex: 1, fontSize: 13 }}>{b}</span>
                <button className="btn ghost" style={{ fontSize: 11 }} onClick={() => removeBullet(i)}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="admin-input" style={{ flex: 1 }} placeholder="Add bullet point" value={bulletInput} onChange={e => setBulletInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBullet()} />
            <button className="btn ghost" onClick={addBullet}>+</button>
          </div>
          <label className="admin-label" style={{ marginTop: 12 }}>Stack</label>
          <ChipsInput value={form.stack} onChange={stack => setForm(prev => ({ ...prev, stack }))} placeholder="Add tech (Enter)" />
          <label className="admin-label">Order</label>
          <input className="admin-input" type="number" value={form.order} onChange={set('order')} />
        </div>
        <div className="admin-modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function CareerPanel({ initial }: { initial: CareerEntry[] }) {
  const [entries, setEntries] = useState(initial)
  const [editing, setEditing] = useState<CareerEntry | null>(null)
  const [adding, setAdding] = useState(false)

  const sorted = [...entries].sort((a, b) => a.order - b.order)

  const handleSave = async (data: Omit<CareerEntry, 'id'>) => {
    if (editing) {
      const res = await fetch(`/api/admin/career/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const updated: CareerEntry = await res.json()
      setEntries(prev => prev.map(e => e.id === editing.id ? updated : e))
      setEditing(null)
    } else {
      const res = await fetch('/api/admin/career', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const created: CareerEntry = await res.json()
      setEntries(prev => [...prev, created])
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this career entry?')) return
    await fetch(`/api/admin/career/${id}`, { method: 'DELETE' })
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn primary" onClick={() => setAdding(true)}>+ Add Role</button>
      </div>
      <div className="admin-list">
        {sorted.map(e => (
          <div key={e.id} className="admin-list-item">
            <div>
              {e.is_current && <span className="chip" style={{ marginRight: 8, color: 'var(--accent)' }}>Current</span>}
              <strong>{e.role}</strong>
              {e.company && <span style={{ color: 'var(--ink-3)', marginLeft: 8 }}>@ {e.company}</span>}
              {e.date_label && <div style={{ color: 'var(--ink-4)', fontSize: 12 }}>{e.date_label}</div>}
              {e.location && <div style={{ color: 'var(--ink-4)', fontSize: 12 }}>{e.location}</div>}
            </div>
            <div className="admin-item-actions">
              <button className="btn ghost" onClick={() => setEditing(e)}>Edit</button>
              <button className="btn ghost" style={{ color: 'var(--red)' }} onClick={() => handleDelete(e.id)}>Delete</button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <div style={{ color: 'var(--ink-3)', padding: '24px 0' }}>No career entries yet.</div>}
      </div>
      {(adding || editing) && (
        <CareerModal
          initial={editing ? { role: editing.role, company: editing.company, company_url: editing.company_url, date_label: editing.date_label, location: editing.location, is_current: editing.is_current, bullets: editing.bullets, stack: editing.stack, order: editing.order } : EMPTY}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Career admin page**

```tsx
// src/app/admin/(protected)/career/page.tsx
import { getCareer } from '@/lib/db/career'
import CareerPanel from '@/components/admin/CareerPanel'

export default async function AdminCareerPage() {
  const entries = await getCareer()
  return (
    <>
      <h1 className="admin-page-title">Career</h1>
      <CareerPanel initial={entries} />
    </>
  )
}
```

- [ ] **Step 3: Verify**

```bash
# Open http://localhost:3000/admin/career
# Verify: list shows roles with company, date, current badge
# Verify: modal form has all fields, bullet point add/remove, stack chips
# Verify: is_current checkbox shows Current chip in list
# Verify: delete with confirm
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/CareerPanel.tsx src/app/admin/(protected)/career/
git commit -m "feat: career admin panel with bullet list and stack chips"
```

---

### Task 29: Projects admin panel

**Files:**
- Create: `src/components/admin/ProjectsPanel.tsx`
- Create: `src/app/admin/(protected)/projects/page.tsx`

- [ ] **Step 1: ProjectsPanel component**

```tsx
// src/components/admin/ProjectsPanel.tsx
'use client'
import { useState, useRef } from 'react'
import type { Project, ProjectBullet } from '@/types'
import ChipsInput from './ChipsInput'

const EMPTY: Omit<Project, 'id'> = {
  num: '', title: '', tagline: '', description: '',
  bullets: [], stack: [], github_url: '', live_url: '', images: [], order: 0
}

function BulletsEditor({ value, onChange }: { value: ProjectBullet[], onChange: (v: ProjectBullet[]) => void }) {
  const [label, setLabel] = useState('')
  const [text, setText] = useState('')

  const add = () => {
    if (!label.trim() && !text.trim()) return
    onChange([...value, { b: label.trim(), t: text.trim() }])
    setLabel('')
    setText('')
  }

  return (
    <div>
      {value.map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
          <span style={{ fontWeight: 600, minWidth: 80 }}>{b.b}:</span>
          <span style={{ flex: 1, color: 'var(--ink-2)' }}>{b.t}</span>
          <button className="btn ghost" style={{ fontSize: 11 }} onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <input className="admin-input" style={{ width: 100 }} placeholder="Label" value={label} onChange={e => setLabel(e.target.value)} />
        <input className="admin-input" style={{ flex: 1 }} placeholder="Text" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <button className="btn ghost" onClick={add}>+</button>
      </div>
    </div>
  )
}

function ImagesEditor({ value, onChange }: { value: string[], onChange: (v: string[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    const newUrls: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload?bucket=project-images', { method: 'POST', body: fd })
      const { url } = await res.json()
      newUrls.push(url)
    }
    onChange([...value, ...newUrls])
    setUploading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {value.map((url, i) => (
          <div key={i} style={{ position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 2, border: '1px solid var(--line)' }} />
            <button onClick={() => onChange(value.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 2, right: 2, background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 2, width: 16, height: 16, cursor: 'pointer', fontSize: 10 }}>×</button>
          </div>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
      <button className="btn ghost" disabled={uploading} onClick={() => fileRef.current?.click()}>
        {uploading ? 'Uploading…' : '+ Add Images'}
      </button>
    </div>
  )
}

function ProjectModal({ initial, onSave, onClose }: {
  initial: Omit<Project, 'id'>
  onSave: (data: Omit<Project, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: k === 'order' ? Number((e.target as HTMLInputElement).value) : e.target.value }))

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 640 }}>
        <div className="admin-modal-header">
          <span>{form.title ? 'Edit Project' : 'Add Project'}</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="admin-form" style={{ overflowY: 'auto', maxHeight: '72vh' }}>
          <label className="admin-label">Number (e.g. "01")</label>
          <input className="admin-input" value={form.num ?? ''} onChange={set('num')} />
          <label className="admin-label">Title</label>
          <input className="admin-input" value={form.title ?? ''} onChange={set('title')} />
          <label className="admin-label">Tagline (serif italic)</label>
          <input className="admin-input" value={form.tagline ?? ''} onChange={set('tagline')} />
          <label className="admin-label">Description</label>
          <textarea className="admin-input" rows={3} value={form.description ?? ''} onChange={set('description')} />
          <label className="admin-label">Bullets (label + text pairs)</label>
          <BulletsEditor value={form.bullets} onChange={bullets => setForm(prev => ({ ...prev, bullets }))} />
          <label className="admin-label" style={{ marginTop: 12 }}>Stack</label>
          <ChipsInput value={form.stack} onChange={stack => setForm(prev => ({ ...prev, stack }))} placeholder="Add tech (Enter)" />
          <label className="admin-label">GitHub URL</label>
          <input className="admin-input" value={form.github_url ?? ''} onChange={set('github_url')} />
          <label className="admin-label">Live URL</label>
          <input className="admin-input" value={form.live_url ?? ''} onChange={set('live_url')} />
          <label className="admin-label">Images</label>
          <ImagesEditor value={form.images} onChange={images => setForm(prev => ({ ...prev, images }))} />
          <label className="admin-label">Order</label>
          <input className="admin-input" type="number" value={form.order} onChange={set('order')} />
        </div>
        <div className="admin-modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function ProjectsPanel({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState(initial)
  const [editing, setEditing] = useState<Project | null>(null)
  const [adding, setAdding] = useState(false)

  const sorted = [...projects].sort((a, b) => a.order - b.order)

  const handleSave = async (data: Omit<Project, 'id'>) => {
    if (editing) {
      const res = await fetch(`/api/admin/projects/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const updated: Project = await res.json()
      setProjects(prev => prev.map(p => p.id === editing.id ? updated : p))
      setEditing(null)
    } else {
      const res = await fetch('/api/admin/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const created: Project = await res.json()
      setProjects(prev => [...prev, created])
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn primary" onClick={() => setAdding(true)}>+ Add Project</button>
      </div>
      <div className="admin-list">
        {sorted.map(p => (
          <div key={p.id} className="admin-list-item">
            <div>
              {p.num && <span className="eyebrow" style={{ marginRight: 8 }}>{p.num}</span>}
              <strong>{p.title}</strong>
              {p.tagline && <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>{p.tagline}</div>}
              {p.images.length > 0 && <div style={{ color: 'var(--ink-4)', fontSize: 11 }}>{p.images.length} image{p.images.length !== 1 ? 's' : ''}</div>}
            </div>
            <div className="admin-item-actions">
              <button className="btn ghost" onClick={() => setEditing(p)}>Edit</button>
              <button className="btn ghost" style={{ color: 'var(--red)' }} onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <div style={{ color: 'var(--ink-3)', padding: '24px 0' }}>No projects yet.</div>}
      </div>
      {(adding || editing) && (
        <ProjectModal
          initial={editing ? { num: editing.num, title: editing.title, tagline: editing.tagline, description: editing.description, bullets: editing.bullets, stack: editing.stack, github_url: editing.github_url, live_url: editing.live_url, images: editing.images, order: editing.order } : EMPTY}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Projects admin page**

```tsx
// src/app/admin/(protected)/projects/page.tsx
import { getProjects } from '@/lib/db/projects'
import ProjectsPanel from '@/components/admin/ProjectsPanel'

export default async function AdminProjectsPage() {
  const projects = await getProjects()
  return (
    <>
      <h1 className="admin-page-title">Projects</h1>
      <ProjectsPanel initial={projects} />
    </>
  )
}
```

- [ ] **Step 3: Verify**

```bash
# Open http://localhost:3000/admin/projects
# Verify: list shows num, title, tagline, image count
# Verify: modal has all fields; bullet label+text pairs add/remove
# Verify: image upload sends to project-images bucket, preview thumbnails show
# Verify: delete images with × button, save persists
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/ProjectsPanel.tsx src/app/admin/(protected)/projects/
git commit -m "feat: projects admin panel with multi-image upload and bullet editor"
```

---

### Task 30: Posts admin panel

**Files:**
- Create: `src/components/admin/PostsPanel.tsx`
- Create: `src/app/admin/(protected)/posts/page.tsx`

- [ ] **Step 1: PostsPanel component**

```tsx
// src/components/admin/PostsPanel.tsx
'use client'
import { useState } from 'react'
import type { Post } from '@/types'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const EMPTY: Omit<Post, 'id' | 'created_at'> = {
  slug: '', title: '', excerpt: '', body: '',
  tag: '', read_time: '', date_label: '', published: false
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function wordCount(md: string): number {
  return md.trim().split(/\s+/).filter(Boolean).length
}

function autoReadTime(md: string): string {
  const wpm = 200
  const mins = Math.max(1, Math.ceil(wordCount(md) / wpm))
  return `${mins} min read`
}

function PostEditor({ initial, onSave, onClose }: {
  initial: Omit<Post, 'id' | 'created_at'>
  onSave: (data: Omit<Post, 'id' | 'created_at'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const [slugManual, setSlugManual] = useState(!!initial.slug)

  const setTitle = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: slugManual ? prev.slug : slugify(title)
    }))
  }

  const setBody = (body: string = '') => {
    setForm(prev => ({
      ...prev,
      body,
      read_time: autoReadTime(body)
    }))
  }

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 800, width: '90vw' }}>
        <div className="admin-modal-header">
          <span>{form.title ? 'Edit Post' : 'New Post'}</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="admin-form" style={{ overflowY: 'auto', maxHeight: '78vh' }}>
          <label className="admin-label">Title</label>
          <input className="admin-input" value={form.title ?? ''} onChange={e => setTitle(e.target.value)} />
          <label className="admin-label">Slug</label>
          <input className="admin-input" value={form.slug} onChange={e => { setSlugManual(true); setForm(prev => ({ ...prev, slug: e.target.value })) }} />
          <label className="admin-label">Excerpt</label>
          <textarea className="admin-input" rows={2} value={form.excerpt ?? ''} onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))} />
          <label className="admin-label">Tag</label>
          <input className="admin-input" value={form.tag ?? ''} onChange={e => setForm(prev => ({ ...prev, tag: e.target.value }))} />
          <label className="admin-label">Date Label (e.g. "Apr 2026")</label>
          <input className="admin-input" value={form.date_label ?? ''} onChange={e => setForm(prev => ({ ...prev, date_label: e.target.value }))} />
          <label className="admin-label">Read Time (auto: {autoReadTime(form.body ?? '')})</label>
          <input className="admin-input" value={form.read_time ?? ''} onChange={e => setForm(prev => ({ ...prev, read_time: e.target.value }))} placeholder={autoReadTime(form.body ?? '')} />
          <label className="admin-label">Body (Markdown) — {wordCount(form.body ?? '')} words</label>
          <div data-color-mode="dark" style={{ marginBottom: 8 }}>
            <MDEditor value={form.body ?? ''} onChange={setBody} height={380} />
          </div>
          <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.published} onChange={e => setForm(prev => ({ ...prev, published: e.target.checked }))} />
            Published
          </label>
        </div>
        <div className="admin-modal-footer">
          <span style={{ color: 'var(--ink-4)', fontSize: 12 }}>{wordCount(form.body ?? '')} words · {autoReadTime(form.body ?? '')}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={() => onSave(form)}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PostsPanel({ initial }: { initial: Post[] }) {
  const [posts, setPosts] = useState(initial)
  const [editing, setEditing] = useState<Post | null>(null)
  const [adding, setAdding] = useState(false)

  const sorted = [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleSave = async (data: Omit<Post, 'id' | 'created_at'>) => {
    if (editing) {
      const res = await fetch(`/api/admin/posts/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const updated: Post = await res.json()
      setPosts(prev => prev.map(p => p.id === editing.id ? updated : p))
      setEditing(null)
    } else {
      const res = await fetch('/api/admin/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const created: Post = await res.json()
      setPosts(prev => [created, ...prev])
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const togglePublish = async (post: Post) => {
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, published: !post.published })
    })
    const updated: Post = await res.json()
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn primary" onClick={() => setAdding(true)}>+ New Post</button>
      </div>
      <div className="admin-list">
        {sorted.map(p => (
          <div key={p.id} className="admin-list-item">
            <div>
              <span className={`chip${p.published ? '' : ''}`} style={{ marginRight: 8, color: p.published ? 'var(--good)' : 'var(--ink-4)' }}>
                {p.published ? 'Published' : 'Draft'}
              </span>
              {p.tag && <span className="chip" style={{ marginRight: 8, color: 'var(--accent)' }}>{p.tag}</span>}
              <strong>{p.title}</strong>
              <div style={{ color: 'var(--ink-4)', fontSize: 12 }}>
                {p.date_label} · {p.read_time} · /{p.slug}
              </div>
            </div>
            <div className="admin-item-actions">
              <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => togglePublish(p)}>
                {p.published ? 'Unpublish' : 'Publish'}
              </button>
              <button className="btn ghost" onClick={() => setEditing(p)}>Edit</button>
              <button className="btn ghost" style={{ color: 'var(--red)' }} onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <div style={{ color: 'var(--ink-3)', padding: '24px 0' }}>No posts yet.</div>}
      </div>
      {(adding || editing) && (
        <PostEditor
          initial={editing ? { slug: editing.slug, title: editing.title, excerpt: editing.excerpt, body: editing.body, tag: editing.tag, read_time: editing.read_time, date_label: editing.date_label, published: editing.published } : EMPTY}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Posts admin page**

```tsx
// src/app/admin/(protected)/posts/page.tsx
import { getAllPosts } from '@/lib/db/posts'
import PostsPanel from '@/components/admin/PostsPanel'

export default async function AdminPostsPage() {
  const posts = await getAllPosts()
  return (
    <>
      <h1 className="admin-page-title">Blog Posts</h1>
      <PostsPanel initial={posts} />
    </>
  )
}
```

- [ ] **Step 3: Verify**

```bash
# Open http://localhost:3000/admin/posts
# Verify: list shows draft/published badge, tag, title, date, slug
# Verify: "New Post" opens editor; title auto-generates slug
# Verify: MDEditor renders markdown preview; word count and read time update live
# Verify: Publish/Unpublish toggle flips badge without page reload
# Verify: delete with confirmation
# Verify: published post appears at /blog/[slug] on the public site
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/PostsPanel.tsx src/app/admin/(protected)/posts/
git commit -m "feat: posts admin panel with markdown editor and publish toggle"
```

---

### Task 31: Certifications admin panel

**Files:**
- Create: `src/components/admin/CertificationsPanel.tsx`
- Create: `src/app/admin/(protected)/certifications/page.tsx`

- [ ] **Step 1: CertificationsPanel component**

```tsx
// src/components/admin/CertificationsPanel.tsx
'use client'
import { useState } from 'react'
import type { Certification } from '@/types'

const EMPTY: Omit<Certification, 'id'> = {
  title: '', issuer: '', date_label: '', credential_url: '', description: '', order: 0
}

function CertModal({ initial, onSave, onClose }: {
  initial: Omit<Certification, 'id'>
  onSave: (data: Omit<Certification, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: k === 'order' ? Number((e.target as HTMLInputElement).value) : e.target.value }))

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <span>{form.title ? 'Edit Certification' : 'Add Certification'}</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="admin-form">
          <label className="admin-label">Title</label>
          <input className="admin-input" value={form.title} onChange={set('title')} />
          <label className="admin-label">Issuer</label>
          <input className="admin-input" value={form.issuer ?? ''} onChange={set('issuer')} />
          <label className="admin-label">Date Label (e.g. "Mar 2025")</label>
          <input className="admin-input" value={form.date_label ?? ''} onChange={set('date_label')} />
          <label className="admin-label">Credential URL</label>
          <input className="admin-input" value={form.credential_url ?? ''} onChange={set('credential_url')} />
          <label className="admin-label">Description</label>
          <textarea className="admin-input" rows={3} value={form.description ?? ''} onChange={set('description')} />
          <label className="admin-label">Order</label>
          <input className="admin-input" type="number" value={form.order} onChange={set('order')} />
        </div>
        <div className="admin-modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function CertificationsPanel({ initial }: { initial: Certification[] }) {
  const [certs, setCerts] = useState(initial)
  const [editing, setEditing] = useState<Certification | null>(null)
  const [adding, setAdding] = useState(false)

  const sorted = [...certs].sort((a, b) => a.order - b.order)

  const handleSave = async (data: Omit<Certification, 'id'>) => {
    if (editing) {
      const res = await fetch(`/api/admin/certifications/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const updated: Certification = await res.json()
      setCerts(prev => prev.map(c => c.id === editing.id ? updated : c))
      setEditing(null)
    } else {
      const res = await fetch('/api/admin/certifications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const created: Certification = await res.json()
      setCerts(prev => [...prev, created])
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certification?')) return
    await fetch(`/api/admin/certifications/${id}`, { method: 'DELETE' })
    setCerts(prev => prev.filter(c => c.id !== id))
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn primary" onClick={() => setAdding(true)}>+ Add Certification</button>
      </div>
      <div className="admin-list">
        {sorted.map(c => (
          <div key={c.id} className="admin-list-item">
            <div>
              <strong>{c.title}</strong>
              {c.issuer && <span style={{ color: 'var(--ink-3)', marginLeft: 8 }}>{c.issuer}</span>}
              {c.date_label && <div style={{ color: 'var(--ink-4)', fontSize: 12 }}>{c.date_label}</div>}
              {c.description && <div style={{ color: 'var(--ink-3)', fontSize: 12, marginTop: 2 }}>{c.description}</div>}
            </div>
            <div className="admin-item-actions">
              {c.credential_url && (
                <a className="btn ghost" href={c.credential_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>View</a>
              )}
              <button className="btn ghost" onClick={() => setEditing(c)}>Edit</button>
              <button className="btn ghost" style={{ color: 'var(--red)' }} onClick={() => handleDelete(c.id)}>Delete</button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <div style={{ color: 'var(--ink-3)', padding: '24px 0' }}>No certifications yet.</div>}
      </div>
      {(adding || editing) && (
        <CertModal
          initial={editing ? { title: editing.title, issuer: editing.issuer, date_label: editing.date_label, credential_url: editing.credential_url, description: editing.description, order: editing.order } : EMPTY}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Certifications admin page**

```tsx
// src/app/admin/(protected)/certifications/page.tsx
import { getCertifications } from '@/lib/db/certifications'
import CertificationsPanel from '@/components/admin/CertificationsPanel'

export default async function AdminCertificationsPage() {
  const certs = await getCertifications()
  return (
    <>
      <h1 className="admin-page-title">Certifications</h1>
      <CertificationsPanel initial={certs} />
    </>
  )
}
```

- [ ] **Step 3: Verify**

```bash
# Open http://localhost:3000/admin/certifications
# Verify: list shows title, issuer, date, description preview
# Verify: "View" link opens credential_url in new tab
# Verify: add/edit/delete all work; order field controls sort
# Verify: certifications show in public /  section §06
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/CertificationsPanel.tsx src/app/admin/(protected)/certifications/
git commit -m "feat: certifications admin panel"
```

---

### Task 32: Admin dashboard (stats overview)

**Files:**
- Create: `src/app/admin/(protected)/page.tsx`

- [ ] **Step 1: Dashboard page**

```tsx
// src/app/admin/(protected)/page.tsx
import { getProfile } from '@/lib/db/profile'
import { getJudges } from '@/lib/db/judges'
import { getContests } from '@/lib/db/contests'
import { getSkills } from '@/lib/db/skills'
import { getCareer } from '@/lib/db/career'
import { getProjects } from '@/lib/db/projects'
import { getAllPosts } from '@/lib/db/posts'
import { getCertifications } from '@/lib/db/certifications'

export default async function AdminDashboard() {
  const [profile, judges, contests, skills, career, projects, posts, certs] = await Promise.all([
    getProfile(),
    getJudges(),
    getContests(),
    getSkills(),
    getCareer(),
    getProjects(),
    getAllPosts(),
    getCertifications(),
  ])

  const stats = [
    { label: 'Judges', value: judges.length, href: '/admin/judges' },
    { label: 'Contests', value: contests.length, href: '/admin/contests' },
    { label: 'Skills', value: skills.length, href: '/admin/skills' },
    { label: 'Career', value: career.length, href: '/admin/career' },
    { label: 'Projects', value: projects.length, href: '/admin/projects' },
    { label: 'Posts', value: posts.length, sub: `${posts.filter(p => p.published).length} published`, href: '/admin/posts' },
    { label: 'Certifications', value: certs.length, href: '/admin/certifications' },
  ]

  return (
    <>
      <h1 className="admin-page-title">Dashboard</h1>
      {profile && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
          {profile.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.name ?? ''} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{profile.name || 'No name set'}</div>
            <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>{profile.title || 'No title set'}</div>
          </div>
          <a href="/admin/profile" className="btn ghost" style={{ marginLeft: 'auto' }}>Edit Profile</a>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {stats.map(s => (
          <a key={s.label} href={s.href} className="card" style={{ padding: '20px 16px', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            {s.sub && <div style={{ color: 'var(--ink-4)', fontSize: 12, marginTop: 2 }}>{s.sub}</div>}
          </a>
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify**

```bash
# Open http://localhost:3000/admin
# Verify: dashboard shows profile card with avatar + name + title
# Verify: stat cards show counts for all 7 entities
# Verify: clicking a stat card navigates to the correct admin section
# Verify: posts card shows total count + "N published" sub-label
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/(protected)/page.tsx
git commit -m "feat: admin dashboard with stats overview"
```

---

### Task 33: Install dependencies and build verification

**Files:**
- Modify: `package.json` (add missing deps if not present)
- Delete any old API routes not rebuilt (e.g., `src/app/api/contact/`)

- [ ] **Step 1: Install required packages**

```bash
npm install @uiw/react-md-editor @uiw/react-markdown-preview react-markdown remark-gfm
# Verify these are not already in package.json before running
```

- [ ] **Step 2: Check for stale old API or page files**

```bash
# List remaining files that may be leftovers from before the wipe
find src/app/api -name "*.ts" | grep -v "admin\|auth" | sort
find src/app -name "*.tsx" | grep -v "(public)\|admin\|api\|layout\|page" | sort
# Delete any stale files identified above
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -60
# Fix any type errors before proceeding
# Common issues:
#   - Missing 'created_at' on Post type in PostsPanel (it comes from DB; Omit<Post,'id'|'created_at'> is correct)
#   - Supabase client import mismatch — use '@/lib/supabase-server' in server files, '@/lib/supabase' in client files
```

- [ ] **Step 4: Production build**

```bash
npm run build 2>&1 | tail -40
# Fix any build errors. Common issues:
#   - 'use client' missing on components that use useState/useEffect
#   - Dynamic import for MDEditor must be in a 'use client' file
#   - next/image vs <img> — suppress with eslint-disable-next-line if intentional
#   - generateStaticParams in blog/[slug]/page.tsx must be async and return array
```

- [ ] **Step 5: Run dev server and smoke test**

```bash
npm run dev
```

Visit these URLs and verify each:
- `http://localhost:3000` — full homepage loads with all 8 sections
- `http://localhost:3000/blog/[any-slug]` — blog reader renders markdown
- `http://localhost:3000/admin/login` — dark bracketed card, Google button visible
- `http://localhost:3000/admin` — redirects to login if unauthenticated
- After login: `/admin`, `/admin/profile`, `/admin/judges`, `/admin/contests`, `/admin/skills`, `/admin/career`, `/admin/projects`, `/admin/posts`, `/admin/certifications`
- Theme toggle on Nav persists across page navigations
- Dark/light mode switches correctly (blueprint grid visible in both)

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete portfolio redesign — all public sections and admin panels"
```

---

## Implementation Complete

All 33 tasks cover:

| Phase | Tasks | Output |
|-------|-------|--------|
| 0 — Foundation | 1–4 | Schema, types, globals.css, root layout, ThemeToggle, shared UI |
| 1 — Public Pages | 5–21 | All 8 homepage sections + blog reader + API routes |
| 2 — Admin | 22–32 | Login, protected layout, 8 admin panels + dashboard |
| 3 — Build | 33 | Deps, TS check, prod build, smoke test |
