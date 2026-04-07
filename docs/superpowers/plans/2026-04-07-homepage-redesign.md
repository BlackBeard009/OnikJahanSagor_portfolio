# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite all public homepage section components to exactly match the stitch design (`docs/superpowers/stitch-design/homepage.md`), keeping Supabase DB integration intact.

**Architecture:** Option A — rewrite each section component in-place, preserve all existing file paths, routing, auth, and admin layers. New DB columns are added via SQL migrations. A new `Footer` component replaces the layout footer.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Supabase, Material Symbols Outlined (Google Fonts CDN), Jest

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Modify | `tailwind.config.ts` | Add new color tokens + box-shadow utilities |
| Modify | `src/app/globals.css` | Add `.glass-card`, `.timeline-line`, `.cp-grid-bg`, scrollbar styles |
| Modify | `src/app/layout.tsx` | Add Material Symbols Outlined `<link>` |
| Modify | `src/app/(public)/layout.tsx` | Minimal sticky navbar, remove footer |
| Modify | `src/app/(public)/page.tsx` | New section composition + `Footer` |
| Modify | `src/types/index.ts` | Add `value`, `color` to `Achievement`; add `highlights` to `Project` |
| Modify | `supabase/schema.sql` | Document new columns |
| Modify | `src/components/sections/Hero.tsx` | Full rewrite to match design |
| Modify | `src/components/sections/Achievements.tsx` | Full rewrite to match design |
| Modify | `src/components/sections/Experience.tsx` | Full rewrite to match design |
| Modify | `src/components/sections/Skills.tsx` | Full rewrite to match design |
| Modify | `src/components/sections/Projects.tsx` | Full rewrite to match design |
| Create | `src/components/sections/Footer.tsx` | New footer/contact section |
| Modify | `src/lib/db/__tests__/projects.test.ts` | Update mock type for `highlights` |

---

## Task 1: DB Schema Migrations

**Files:**
- Modify: `supabase/schema.sql`

Run the following SQL in your Supabase project SQL editor (Dashboard → SQL Editor).

- [ ] **Step 1: Run migrations in Supabase SQL editor**

```sql
-- Add value and color to achievements
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS value text;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS color text;

-- Add highlights to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}';
```

- [ ] **Step 2: Update schema.sql to document the new columns**

In `supabase/schema.sql`, update the `achievements` table definition:

```sql
-- Competitive programming achievements
CREATE TABLE achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform        text NOT NULL,
  rating          integer,
  rank            text,
  problems_solved integer,
  badge           text,
  profile_url     text,
  category        text,   -- 'rating' | 'team' | 'individual'
  value           text,   -- right-side display text for individual achievement cards
  color           text,   -- tailwind color key e.g. 'blue', 'indigo', 'primary'
  "order"         integer DEFAULT 0
);
```

And update the `projects` table definition:

```sql
-- Projects
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  tech_stack  text[] DEFAULT '{}',
  highlights  text[] DEFAULT '{}',  -- 2-3 bullet achievement strings
  image_url   text,
  github_url  text,
  live_url    text,
  featured    boolean DEFAULT false,
  "order"     integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
```

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add value/color to achievements, highlights to projects"
```

---

## Task 2: Update TypeScript Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Update `Achievement` and `Project` interfaces**

Replace the `Achievement` and `Project` interfaces in `src/types/index.ts`:

```typescript
export interface Project {
  id: string
  title: string
  slug: string
  description: string | null
  tech_stack: string[]
  highlights: string[]
  image_url: string | null
  github_url: string | null
  live_url: string | null
  featured: boolean
  order: number
  created_at: string
}

export interface Achievement {
  id: string
  platform: string
  rating: number | null
  rank: string | null
  problems_solved: number | null
  badge: string | null
  profile_url: string | null
  category: string | null   // 'rating' | 'team' | 'individual'
  value: string | null      // right-side text for individual cards
  color: string | null      // tailwind color key
  order: number
}
```

Also add `codeforces` to `SocialLinks` (the existing index signature already allows it, but add it explicitly for type safety):

```typescript
export interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  codeforces?: string
  email?: string
  [key: string]: string | undefined
}
```

- [ ] **Step 2: Update the projects test mock to include `highlights`**

In `src/lib/db/__tests__/projects.test.ts`, update `mockProject`:

```typescript
const mockProject: Project = {
  id: 'abc-123',
  title: 'My Project',
  slug: 'my-project',
  description: 'A cool project',
  tech_stack: ['TypeScript', 'React'],
  highlights: [],
  image_url: null,
  github_url: null,
  live_url: null,
  featured: false,
  order: 0,
  created_at: '2026-01-01T00:00:00Z',
}
```

- [ ] **Step 3: Run tests to confirm no type errors**

```bash
cd /Users/onikjahansagor/onikjahansagor_portfolio && npm test -- --testPathPattern="projects" --no-coverage
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/lib/db/__tests__/projects.test.ts
git commit -m "feat: add highlights to Project type, value/color to Achievement type"
```

---

## Task 3: Tailwind Config & Global Styles

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace `tailwind.config.ts` with updated theme**

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
        primary: {
          DEFAULT: '#0dccf2',
          dark: '#0ab8da',
        },
        'background-dark': '#102023',
        'surface-dark': '#16282c',
        'surface-darker': '#0b1719',
        // keep legacy tokens so admin/blog pages don't break
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
        display: ['var(--font-inter)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      boxShadow: {
        glow: '0 0 15px -3px rgba(13, 204, 242, 0.3)',
        'glow-lg': '0 0 25px -5px rgba(13, 204, 242, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Replace `src/app/globals.css` with updated styles**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-background-dark text-white font-sans antialiased overflow-x-hidden;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #102023; }
  ::-webkit-scrollbar-thumb { background: #224249; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #315f68; }
}

@layer components {
  /* New design system */
  .glass-card {
    background: rgba(22, 40, 44, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .timeline-line {
    box-shadow: 0 0 8px rgba(13, 204, 242, 0.6);
  }
  .cp-grid-bg {
    background-image: radial-gradient(circle at 1px 1px, rgba(13, 204, 242, 0.1) 1px, transparent 0);
    background-size: 20px 20px;
  }

  /* Legacy — kept for admin/blog pages */
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
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: update tailwind theme and global styles for new design"
```

---

## Task 4: Root Layout — Add Material Symbols

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add Material Symbols Outlined font link**

Replace `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Onik Jahan Sagor — Software Engineer',
  description: 'Software engineer & competitive programmer portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add Material Symbols Outlined font, update page title"
```

---

## Task 5: Public Layout — Minimal Navbar

**Files:**
- Modify: `src/app/(public)/layout.tsx`

- [ ] **Step 1: Replace layout with minimal sticky navbar**

```typescript
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-dark">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-darker/80 backdrop-blur-sm border-b border-[#224249]">
        <div className="max-w-[1100px] mx-auto px-6 py-3 flex items-center justify-end">
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>
      <main className="pt-14">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(public)/layout.tsx
git commit -m "feat: replace navbar with minimal anchor-link nav, remove layout footer"
```

---

## Task 6: Homepage Page Composition

**Files:**
- Modify: `src/app/(public)/page.tsx`

- [ ] **Step 1: Rewrite page.tsx with new section order**

```typescript
import { Hero } from '@/components/sections/Hero'
import { Achievements } from '@/components/sections/Achievements'
import { Experience } from '@/components/sections/Experience'
import { Skills } from '@/components/sections/Skills'
import { Projects } from '@/components/sections/Projects'
import { Footer } from '@/components/sections/Footer'
import { getAbout } from '@/lib/db/about'
import { getAchievements } from '@/lib/db/achievements'
import { getExperience } from '@/lib/db/experience'
import { getFeaturedProjects } from '@/lib/db/projects'

export const revalidate = 60

export default async function HomePage() {
  const [about, achievements, experience, projects] = await Promise.all([
    getAbout().catch(() => null),
    getAchievements().catch(() => []),
    getExperience().catch(() => []),
    getFeaturedProjects().catch(() => []),
  ])

  const skills = about?.skills ?? []

  return (
    <>
      <main className="pt-8 pb-12 flex flex-col items-center w-full">
        <div className="max-w-[1100px] w-full px-6 flex flex-col gap-16">
          <Hero about={about} />
          <Achievements achievements={achievements} />
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16" id="experience">
            <div className="lg:col-span-7">
              <Experience experience={experience} />
            </div>
            <div className="lg:col-span-5">
              <Skills skills={skills} />
            </div>
          </section>
          <Projects projects={projects} about={about} />
        </div>
      </main>
      <Footer about={about} />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(public)/page.tsx
git commit -m "feat: update homepage composition with new section layout"
```

---

## Task 7: Hero Component

**Files:**
- Modify: `src/components/sections/Hero.tsx`

- [ ] **Step 1: Rewrite Hero.tsx**

```typescript
'use client'
import { About } from '@/types'

interface HeroProps {
  about: About | null
}

function SocialIconButton({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300"
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </a>
  )
}

export function Hero({ about }: HeroProps) {
  const socialLinks = about?.social_links ?? {}

  const socialButtons = (
    <div className="flex gap-4">
      {socialLinks.linkedin && (
        <SocialIconButton href={socialLinks.linkedin} label="LinkedIn" icon="work" />
      )}
      {socialLinks.github && (
        <SocialIconButton href={socialLinks.github} label="GitHub" icon="terminal" />
      )}
      {socialLinks.codeforces && (
        <SocialIconButton href={socialLinks.codeforces} label="Codeforces" icon="bar_chart" />
      )}
    </div>
  )

  return (
    <section
      id="about"
      className="flex flex-col-reverse md:flex-row items-center gap-10 py-10 md:py-16 relative"
    >
      {/* Desktop social icons — top right */}
      <div className="absolute top-0 right-0 hidden md:flex gap-4">
        {socialLinks.linkedin && (
          <SocialIconButton href={socialLinks.linkedin} label="LinkedIn" icon="work" />
        )}
        {socialLinks.github && (
          <SocialIconButton href={socialLinks.github} label="GitHub" icon="terminal" />
        )}
        {socialLinks.codeforces && (
          <SocialIconButton href={socialLinks.codeforces} label="Codeforces" icon="bar_chart" />
        )}
      </div>

      {/* Left: text content */}
      <div className="flex-1 flex flex-col gap-6 text-center md:text-left pt-12 md:pt-0">
        <div className="flex flex-col gap-3">
          {/* Name badge */}
          <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
            <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <span className="material-symbols-outlined text-2xl">code</span>
            </div>
            <h2 className="text-white text-2xl font-bold tracking-tight">Onik Jahan Sagor</h2>
          </div>

          {/* Open to Work pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 self-center md:self-start w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-primary text-xs font-bold uppercase tracking-wide">Open to Work</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
            Software Engineer &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-200">
              Competitive Programmer
            </span>
          </h1>

          {/* Bio */}
          <p className="text-gray-400 text-base md:text-lg max-w-[600px] mx-auto md:mx-0 leading-relaxed">
            {about?.bio ?? 'Passionate about algorithms, distributed systems, and building scalable web applications.'}
          </p>
        </div>

        {/* Mobile social icons */}
        <div className="flex md:hidden gap-4 justify-center mb-2">
          {socialLinks.linkedin && (
            <SocialIconButton href={socialLinks.linkedin} label="LinkedIn" icon="work" />
          )}
          {socialLinks.github && (
            <SocialIconButton href={socialLinks.github} label="GitHub" icon="terminal" />
          )}
          {socialLinks.codeforces && (
            <SocialIconButton href={socialLinks.codeforces} label="Codeforces" icon="bar_chart" />
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="h-12 px-6 bg-primary hover:bg-primary-dark text-[#102023] rounded-lg font-bold text-base transition-all shadow-glow hover:-translate-y-[2px]"
          >
            View Work
          </button>
          {about?.resume_url ? (
            <a
              href={about.resume_url}
              download
              className="h-12 px-6 bg-transparent border border-gray-600 hover:border-primary text-gray-300 hover:text-white rounded-lg font-bold text-base transition-all hover:bg-primary/5 flex items-center"
            >
              Download CV
            </a>
          ) : (
            <button className="h-12 px-6 bg-transparent border border-gray-600 hover:border-primary text-gray-300 hover:text-white rounded-lg font-bold text-base transition-all hover:bg-primary/5">
              Download CV
            </button>
          )}
        </div>
      </div>

      {/* Right: avatar */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl"></div>
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/30 shadow-2xl">
          {about?.avatar_url ? (
            <img
              src={about.avatar_url}
              alt="Onik Jahan Sagor"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-surface-dark flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-primary/40">person</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: rewrite Hero section to match new design"
```

---

## Task 8: Achievements Component

**Files:**
- Modify: `src/components/sections/Achievements.tsx`

- [ ] **Step 1: Rewrite Achievements.tsx**

```typescript
import { Achievement } from '@/types'

interface AchievementsProps {
  achievements: Achievement[]
}

const PLATFORM_STYLES: Record<string, { color: string; barColor: string; barWidth: string; icon?: string }> = {
  Codeforces: { color: 'text-purple-400', barColor: 'bg-purple-500', barWidth: 'w-[85%]', icon: 'bar_chart' },
  LeetCode:   { color: 'text-yellow-400', barColor: 'bg-yellow-500', barWidth: 'w-[95%]', icon: 'code_blocks' },
  CodeChef:   { color: 'text-orange-400', barColor: 'bg-orange-500', barWidth: 'w-[70%]', icon: 'restaurant_menu' },
  AtCoder:    { color: 'text-blue-300',   barColor: 'bg-blue-400',   barWidth: 'w-[60%]', icon: 'deployed_code' },
}

const BORDER_COLOR_MAP: Record<string, string> = {
  blue:    'border-l-blue-500',
  indigo:  'border-l-indigo-500',
  primary: 'border-l-primary',
  purple:  'border-l-purple-500',
  green:   'border-l-green-500',
  yellow:  'border-l-yellow-500',
  orange:  'border-l-orange-500',
}

const HOVER_COLOR_MAP: Record<string, string> = {
  blue:    'group-hover:text-blue-400',
  indigo:  'group-hover:text-indigo-400',
  primary: 'group-hover:text-primary',
  purple:  'group-hover:text-purple-400',
  green:   'group-hover:text-green-400',
  yellow:  'group-hover:text-yellow-400',
  orange:  'group-hover:text-orange-400',
}

const VALUE_HOVER_MAP: Record<string, string> = {
  blue:    'group-hover:text-blue-500/50',
  indigo:  'group-hover:text-indigo-500/50',
  primary: 'group-hover:text-primary/50',
  purple:  'group-hover:text-purple-500/50',
  green:   'group-hover:text-green-500/50',
  yellow:  'group-hover:text-yellow-500/50',
  orange:  'group-hover:text-orange-500/50',
}

const TEAM_ICON_COLOR: Record<string, string> = {
  globe:      'text-primary',
  flag:       'text-yellow-400',
  leaderboard:'text-blue-400',
  trophy:     'text-green-400',
}

export function Achievements({ achievements }: AchievementsProps) {
  const ratingAchievements = achievements.filter((a) => a.category === 'rating')
  const teamAchievements   = achievements.filter((a) => a.category === 'team')
  const individualAchievements = achievements.filter((a) => a.category === 'individual')

  const totalProblemsSolved = ratingAchievements.reduce(
    (sum, a) => sum + (a.problems_solved ?? 0), 0
  )

  return (
    <section id="achievements" className="w-full">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-primary text-4xl">emoji_events</span>
        <h2 className="text-3xl font-bold text-white">Competitive Programming</h2>
      </div>

      <div className="rounded-2xl border border-[#224249] bg-[#16282c]/30 backdrop-blur-sm overflow-hidden">

        {/* Online Judge Ratings */}
        <div className="p-6 md:p-8 border-b border-[#224249]">
          <h3 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">terminal</span>
            Online Judge Ratings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ratingAchievements.map((a) => {
              const style = PLATFORM_STYLES[a.platform] ?? { color: 'text-gray-400', barColor: 'bg-gray-500', barWidth: 'w-[50%]', icon: 'code' }
              return (
                <div
                  key={a.id}
                  className="glass-card p-4 rounded-xl flex flex-col gap-2 hover:border-primary/40 transition-all hover:bg-[#16282c]/80 group relative overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
                  <div className="flex items-center justify-between z-10">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{a.platform}</span>
                    <span className={`material-symbols-outlined ${style.color}`}>{style.icon}</span>
                  </div>
                  <div className="mt-2 z-10">
                    <p className="text-2xl font-bold text-white">{a.rating?.toLocaleString() ?? '—'}</p>
                    <p className={`text-sm font-medium ${style.color}`}>{a.rank ?? ''}</p>
                  </div>
                  <div className="w-full bg-gray-700 h-1 rounded-full mt-3 overflow-hidden">
                    <div className={`${style.barColor} h-full ${style.barWidth}`}></div>
                  </div>
                </div>
              )
            })}

            {/* Problems Solved summary card */}
            <div className="glass-card p-4 rounded-xl flex flex-col justify-center items-center gap-1 hover:border-primary/60 border-primary/20 transition-all hover:bg-primary/5 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
              <span className="material-symbols-outlined text-3xl text-primary mb-1">checklist</span>
              <p className="text-3xl font-black text-white tracking-tight">
                {totalProblemsSolved > 0 ? `${totalProblemsSolved.toLocaleString()}+` : '—'}
              </p>
              <p className="text-xs text-primary font-bold uppercase tracking-wider">Problems Solved</p>
              <p className="text-[10px] text-gray-500 mt-2">Across all platforms</p>
            </div>
          </div>
        </div>

        {/* Team Contests + Individual Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Team Contests */}
          <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-[#224249]">
            <h3 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">groups</span>
              Team Contests
            </h3>
            <div className="flex flex-col gap-4">
              {teamAchievements.map((a) => {
                const iconName = a.badge ?? 'public'
                const iconColor = TEAM_ICON_COLOR[iconName] ?? 'text-primary'
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-4 p-3 hover:bg-[#16282c] rounded-lg transition-colors border border-transparent hover:border-[#224249]"
                  >
                    <div className={`size-10 rounded-md bg-[#0b1719] border border-[#224249] flex items-center justify-center ${iconColor} shrink-0`}>
                      <span className="material-symbols-outlined">{iconName}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{a.platform}</h4>
                      <p className="text-sm text-gray-400">{a.rank ?? ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Individual Achievements */}
          <div className="p-6 md:p-8 cp-grid-bg relative">
            <h3 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-primary">military_tech</span>
              Individual Achievements
            </h3>
            <div className="space-y-4 relative z-10">
              {individualAchievements.map((a) => {
                const colorKey = a.color ?? 'primary'
                const borderClass = BORDER_COLOR_MAP[colorKey] ?? 'border-l-primary'
                const hoverTitle = HOVER_COLOR_MAP[colorKey] ?? 'group-hover:text-primary'
                const hoverValue = VALUE_HOVER_MAP[colorKey] ?? 'group-hover:text-primary/50'
                return (
                  <div
                    key={a.id}
                    className={`glass-card p-4 rounded-xl border-l-4 ${borderClass} flex justify-between items-center group`}
                  >
                    <div>
                      <h4 className={`font-bold text-white transition-colors ${hoverTitle}`}>{a.platform}</h4>
                      <p className="text-xs text-gray-400 mt-1">{a.rank ?? ''}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-black text-gray-600 transition-colors ${hoverValue}`}>
                        {a.value ?? ''}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/Achievements.tsx
git commit -m "feat: rewrite Achievements section to match new design"
```

---

## Task 9: Experience Component

**Files:**
- Modify: `src/components/sections/Experience.tsx`

- [ ] **Step 1: Rewrite Experience.tsx**

```typescript
import React from 'react'
import { Experience as ExperienceType } from '@/types'

interface ExperienceProps {
  experience: ExperienceType[]
}

function formatDate(date: string | null): string {
  if (!date) return 'Present'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

const TIMELINE_ICONS = ['work', 'code', 'school', 'build', 'rocket_launch']

export function Experience({ experience }: ExperienceProps) {
  return (
    <div className="flex flex-col">
      <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">history_edu</span>
        Career Timeline
      </h3>

      <div className="grid grid-cols-[40px_1fr] gap-x-4">
        {experience.map((exp, index) => {
          const isFirst = index === 0
          const isLast = index === experience.length - 1
          const iconName = TIMELINE_ICONS[index % TIMELINE_ICONS.length]

          return (
            <React.Fragment key={exp.id}>
              {/* Timeline spine */}
              <div className="flex flex-col items-center">
                <div
                  className={`size-10 rounded-full bg-[#16282c] flex items-center justify-center z-10 ${
                    isFirst
                      ? 'border border-primary text-primary shadow-glow'
                      : 'border border-[#315f68] text-gray-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{iconName}</span>
                </div>
                {!isLast && (
                  <div
                    className={`w-[2px] grow ${
                      isFirst
                        ? 'bg-gradient-to-b from-primary to-[#224249] timeline-line'
                        : 'bg-[#224249]'
                    }`}
                  ></div>
                )}
              </div>

              {/* Content */}
              <div className={isLast ? 'pt-2' : 'pb-10 pt-2'}>
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                  <h4 className="text-xl font-bold text-white">{exp.role}</h4>
                  {isFirst ? (
                    <span className="text-primary text-sm font-mono bg-primary/10 px-2 py-1 rounded">
                      {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm font-mono">
                      {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                    </span>
                  )}
                </div>
                <p className="text-gray-300 font-medium mb-2">{exp.company}</p>
                {exp.description && (
                  <p className="text-gray-400 text-sm leading-relaxed">{exp.description}</p>
                )}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/Experience.tsx
git commit -m "feat: rewrite Experience section to match new design"
```

---

## Task 10: Skills Component

**Files:**
- Modify: `src/components/sections/Skills.tsx`

- [ ] **Step 1: Rewrite Skills.tsx**

```typescript
import { Skill } from '@/types'

interface SkillsProps {
  skills: Skill[]
}

const SKILL_COLORS: Record<string, string> = {
  // Languages
  'C++':        'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Python':     'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'JavaScript': 'bg-yellow-300/10 text-yellow-200 border-yellow-300/20',
  'TypeScript': 'bg-blue-400/10 text-blue-300 border-blue-400/20',
  'Java':       'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Go':         'bg-purple-500/10 text-purple-400 border-purple-500/20',
  // Frameworks
  'React':      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Next.js':    'bg-white/5 text-gray-200 border-gray-600',
  'Node.js':    'bg-green-500/10 text-green-400 border-green-500/20',
  'Express':    'bg-red-500/10 text-red-400 border-red-500/20',
  'Tailwind CSS': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'GraphQL':    'bg-pink-500/10 text-pink-400 border-pink-500/20',
  // Tools
  'Docker':     'bg-blue-600/10 text-blue-400 border-blue-600/20',
  'Kubernetes': 'bg-blue-300/10 text-blue-200 border-blue-300/20',
  'AWS':        'bg-orange-600/10 text-orange-400 border-orange-600/20',
  'Git':        'bg-white/5 text-gray-200 border-gray-600',
  'PostgreSQL': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'MongoDB':    'bg-green-600/10 text-green-400 border-green-600/20',
}

const DEFAULT_SKILL_COLOR = 'bg-primary/10 text-primary border-primary/20'

export function Skills({ skills }: SkillsProps) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || 'Other'
    acc[cat] = [...(acc[cat] ?? []), skill]
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-8">
      <h3 className="text-2xl font-bold text-white mb-0 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">build</span>
        Technical Expertise
      </h3>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="bg-[#16282c]/50 border border-[#224249] rounded-xl p-6">
          <h4 className="text-sm uppercase tracking-wider text-gray-400 font-bold mb-4">{category}</h4>
          <div className="flex flex-wrap gap-2">
            {items.map((skill) => {
              const colorClass = SKILL_COLORS[skill.name] ?? DEFAULT_SKILL_COLOR
              return (
                <span
                  key={skill.name}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border ${colorClass}`}
                >
                  {skill.name}
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/Skills.tsx
git commit -m "feat: rewrite Skills section to match new design"
```

---

## Task 11: Projects Component

**Files:**
- Modify: `src/components/sections/Projects.tsx`

- [ ] **Step 1: Rewrite Projects.tsx**

Note: `about` prop is added to get the GitHub profile URL for the "View GitHub" header link.

```typescript
import { Project, About } from '@/types'

interface ProjectsProps {
  projects: Project[]
  about: About | null
}

export function Projects({ projects, about }: ProjectsProps) {
  const githubUrl = about?.social_links?.github ?? '#'

  return (
    <section id="projects" className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl">rocket_launch</span>
          Featured Projects
        </h3>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-white transition-colors text-sm font-bold flex items-center gap-1"
        >
          View GitHub <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group relative bg-[#16282c] rounded-xl border border-[#224249] p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
          >
            {/* Hover-reveal action icons */}
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-background-dark rounded-full hover:text-primary transition-colors"
                  title="View Code"
                >
                  <span className="material-symbols-outlined text-lg">code</span>
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-background-dark rounded-full hover:text-primary transition-colors"
                  title="Live Demo"
                >
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                </a>
              )}
            </div>

            {/* Title */}
            <div className="mb-4">
              <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                {project.title}
              </h4>
              {project.tech_stack.length > 0 && (
                <p className="text-xs text-gray-500 font-mono mt-1">{project.tech_stack[0]}</p>
              )}
            </div>

            {/* Description */}
            {project.description && (
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">{project.description}</p>
            )}

            {/* Highlights */}
            {project.highlights && project.highlights.length > 0 && (
              <ul className="space-y-2 mb-6">
                {project.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="material-symbols-outlined text-primary text-base shrink-0 mt-[2px]">check_circle</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Tech stack badges */}
            <div className="flex flex-wrap gap-2 mt-auto">
              {project.tech_stack.map((tech) => (
                <span key={tech} className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/Projects.tsx
git commit -m "feat: rewrite Projects section to match new design"
```

---

## Task 12: Footer Component

**Files:**
- Create: `src/components/sections/Footer.tsx`

- [ ] **Step 1: Create Footer.tsx**

```typescript
import { About } from '@/types'

interface FooterProps {
  about: About | null
}

export function Footer({ about }: FooterProps) {
  const socialLinks = about?.social_links ?? {}
  const email = socialLinks.email ?? ''

  return (
    <footer className="bg-surface-darker border-t border-[#224249]" id="contact">
      <div className="max-w-[1100px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Left */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">Let&apos;s Connect</h3>
            <p className="text-gray-400 max-w-md">
              Open to new opportunities and interesting projects. Feel free to reach out if you&apos;d like to collaborate.
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center md:items-end gap-4">
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-white hover:text-primary transition-colors text-lg font-medium"
              >
                <span className="material-symbols-outlined">mail</span>
                {email}
              </a>
            )}
            <div className="flex gap-4">
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-xl">work</span>
                </a>
              )}
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-xl">terminal</span>
                </a>
              )}
              {socialLinks.codeforces && (
                <a
                  href={socialLinks.codeforces}
                  aria-label="Codeforces"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-xl">bar_chart</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#224249] flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2026 Onik Jahan Sagor. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">location_on</span>
              Bangladesh
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">schedule</span>
              UTC+6
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/Footer.tsx
git commit -m "feat: create Footer section component"
```

---

## Task 13: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
cd /Users/onikjahansagor/onikjahansagor_portfolio && npm test -- --no-coverage
```

Expected: all tests pass (no type regressions from the `Project` / `Achievement` type changes).

- [ ] **Step 2: Start dev server and verify visually**

```bash
cd /Users/onikjahansagor/onikjahansagor_portfolio && npm run dev
```

Open `http://localhost:3000` and verify:
- [ ] Dark `#102023` background, cyan `#0dccf2` accents visible
- [ ] Material Symbols icons render (not blank squares)
- [ ] Hero: name badge, pulsing pill, gradient heading, avatar circle, social buttons
- [ ] Achievements: rating cards grid, team contests list, individual cards with left border
- [ ] Experience + Skills side-by-side on desktop (stacked on mobile)
- [ ] Projects: 2-column grid, hover lifts card + reveals icons
- [ ] Footer: "Let's Connect", email link, social icons, copyright bar
- [ ] Minimal sticky navbar with anchor links only

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: homepage redesign complete — all sections match stitch design"
```
