# Portfolio Redesign — Design Spec
_Date: 2026-04-24_

## Overview

Complete ground-up redesign of the portfolio site. Wipe all existing Supabase tables, remove all existing src/components, and rebuild pixel-perfect to the Claude Design handoff bundle (`Portfolio.html` + admin files). The design is a light/dark blueprint-grid portfolio with Geist/JetBrains Mono/Instrument Serif typography and a cyan accent (#38bdf8).

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS + CSS variables, Supabase (DB + Storage), NextAuth 5 (Google OAuth).

---

## 1. Architecture

### App Router Structure

```
src/app/
  (public)/
    layout.tsx                     # Public layout: grid-bg, Nav, theme init
    page.tsx                       # Homepage (all 8 sections)
    blog/
      [slug]/page.tsx              # Blog post reader (static generation)
  admin/
    login/page.tsx                 # Google OAuth login (dark theme, bracketed card)
    (protected)/
      layout.tsx                   # Protected layout: sidebar nav, auth guard
      page.tsx                     # Admin dashboard (stats overview)
      profile/page.tsx
      judges/page.tsx
      contests/page.tsx
      skills/page.tsx
      career/page.tsx
      projects/page.tsx
      posts/page.tsx
      certifications/page.tsx
  api/
    admin/
      profile/route.ts             # GET / PUT
      judges/route.ts              # GET / POST
      judges/[id]/route.ts         # PUT / DELETE
      contests/route.ts            # GET / POST
      contests/[id]/route.ts       # PUT / DELETE
      skills/route.ts              # GET / POST
      skills/[id]/route.ts         # PUT / DELETE
      career/route.ts              # GET / POST
      career/[id]/route.ts         # PUT / DELETE
      projects/route.ts            # GET / POST
      projects/[id]/route.ts       # PUT / DELETE
      posts/route.ts               # GET / POST
      posts/[id]/route.ts          # PUT / DELETE
      certifications/route.ts      # GET / POST
      certifications/[id]/route.ts # PUT / DELETE
      upload/route.ts              # POST multipart (avatar, resume, project images)
    auth/[...nextauth]/route.ts    # NextAuth handlers
```

### Authentication
- NextAuth 5 beta, Google OAuth provider, same `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `isAdminEmail()` checks against `ADMIN_EMAIL` env var
- Middleware protects `/admin/*` and `/api/admin/*`
- Admin login page: `/admin/login` — dark-themed, bracketed card, real Google button

### Theme
- `localStorage` key `portfolio_theme` stores `"light"` | `"dark"`
- Applied as `data-theme` attribute on `<html>` in a client layout wrapper
- Theme toggle icon-button in Nav, present on all pages
- Default: dark

---

## 2. Supabase Schema (fresh — wipe all existing tables)

```sql
-- Single-row profile
CREATE TABLE profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text, handle text, title text, title_alt text,
  location text, timezone text, status text, years int,
  email text, bio text,
  github text, linkedin text, twitter text,
  resume_url text, avatar_url text,
  skills_top jsonb DEFAULT '[]'
);

-- Online judge platforms
CREATE TABLE judges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, handle text,
  rating int, max_rating int,
  title text, title_color text,
  contests_count int DEFAULT 0, problems_count int DEFAULT 0,
  trend jsonb DEFAULT '[]',   -- array of {contest: string, rating: int}
  "order" int DEFAULT 0
);

-- Contest achievements
CREATE TABLE contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('team', 'individual')),
  rank int, title text, sub text, year text, position text,
  "order" int DEFAULT 0
);

-- Skills
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL, name text NOT NULL,
  level int CHECK (level BETWEEN 1 AND 5),
  "order" int DEFAULT 0
);

-- Career timeline
CREATE TABLE career (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text, company text, company_url text,
  date_label text, location text, is_current boolean DEFAULT false,
  bullets jsonb DEFAULT '[]',   -- array of strings
  stack jsonb DEFAULT '[]',     -- array of strings
  "order" int DEFAULT 0
);

-- Projects
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  num text, title text, tagline text, description text,
  bullets jsonb DEFAULT '[]',   -- array of {b: string, t: string}
  stack jsonb DEFAULT '[]',
  github_url text, live_url text,
  images jsonb DEFAULT '[]',    -- array of Supabase Storage URLs
  "order" int DEFAULT 0
);

-- Blog posts
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL, title text, excerpt text,
  body text,                    -- HTML from rich editor
  tag text, read_time text, date_label text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Certifications
CREATE TABLE certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, issuer text, date_label text,
  credential_url text, description text,
  "order" int DEFAULT 0
);
```

**RLS:** Public tables (profile, judges, contests, skills, career, projects, certifications) have `SELECT` open to anon. `posts` restricts anon `SELECT` to `published = true`. All writes go through service role key.

**Supabase Storage:** Two buckets — `avatars` (single file, public), `resumes` (single file, public), `project-images` (multiple, public).

---

## 3. Design System

### CSS Variables (globals.css)
```css
:root {
  --accent: #38bdf8;
  --accent-ink: #0284c7;
  --accent-soft: rgba(56,189,248,0.12);
  --bg: #fafaf7; --bg-elev: #ffffff;
  --ink: #0a0a0a; --ink-2: #3f3f46; --ink-3: #71717a; --ink-4: #a1a1aa;
  --line: #e4e4e7; --line-strong: #d4d4d8;
  --grid: rgba(10,10,10,0.045); --grid-strong: rgba(10,10,10,0.09);
  --good: #16a34a; --warn: #eab308; --hot: #f97316; --red: #ef4444;
  --font-sans: 'Geist', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;
  --font-serif: 'Instrument Serif', ui-serif, Georgia, serif;
}
[data-theme="dark"] {
  --bg: #0b0c0f; --bg-elev: #121317;
  --ink: #f4f4f5; --ink-2: #d4d4d8; --ink-3: #a1a1aa; --ink-4: #71717a;
  --line: #26272c; --line-strong: #3f3f46;
  --grid: rgba(255,255,255,0.05); --grid-strong: rgba(255,255,255,0.09);
  --accent-soft: rgba(56,189,248,0.15);
}
```

### CSS Primitives (used via className)
- `.grid-bg` — fixed blueprint grid overlay (48px fine + 240px major lines, fade mask)
- `.card` — `bg-elev`, 1px line border, border-radius 2px
- `.bracket` — CSS pseudo-element corner marks (10×10px L-shapes)
- `.crosshair` — absolute positioned cross marker
- `.chip` — mono font, 11px, border, dot accent
- `.eyebrow` — mono 11px, 0.14em spacing, uppercase
- `.label-row` — mono 11px, preceded by 24px hairline
- `.skill-pill` — mono 13px, 5-dot level indicator
- `.btn`, `.btn.primary`, `.btn.ghost`, `.icon-btn`

### Fonts
Google Fonts: `Geist:wght@300;400;500;600;700`, `JetBrains+Mono:wght@400;500;600;700`, `Instrument+Serif:ital@0;1`

---

## 4. Public Pages

### Homepage (`/`)

Sections rendered server-side (data fetched from Supabase at request time), with minimal client interactivity:

1. **Nav** — sticky, blur backdrop, brand mark (initials), numbered anchor links (#competitive #skills #career #projects #writing #certifications #contact), theme toggle icon-btn, résumé download btn
2. **Hero** — 2-col grid: left = status dot eyebrow, h1 name + italic role subtitle, bio paragraph, CTA buttons (View Projects, GitHub, email), 3-cell meta strip (Location / Experience / Handle); right = bracket+crosshair avatar card (uploaded img or SVG placeholder), mono metadata rows
3. **Competitive `§01`** — 2-col: left = 2×2 judge cards (peak rating in title color, sparkline SVG, current rating + delta, contests/solved stats); right = tabbed team/individual contest rows (rank number, title + position chip, sub-label, year badge). Tab switching is client component.
4. **Skills `§02`** — sidebar category buttons (border-left accent when active) + skill pill cloud (5 dot level indicator). Category switching is client component. Marquee strip below.
5. **Career `§03`** — vertical timeline, current role has filled accent dot + glow ring, each card: role, company link, date, location, bullet list (`+` prefix in accent), stack chips
6. **Projects `§04`** — alternating left/right layout per project. Text body: num label, title, serif italic tagline, description, `▸` prefixed bullets, stack chips, Source + Live buttons. Visual: image carousel with dot/arrow controls (client component), uploaded images or SVG placeholder.
7. **Writing `§05`** — 3-col blog card grid. Each card links to `/blog/[slug]`. Shows date, tag (accent color), title, excerpt, read time.
8. **Certifications `§06`** — grid of cards: title, issuer, date label, description, credential URL button.
9. **Footer `§07`** — 3-col: "Have something interesting to build?" big text + email link; Elsewhere (GitHub, LinkedIn, Twitter, Email); Artifacts (Résumé download, Blog, Repos, Contest log). Bottom strip: copyright + build info.

### Blog Post (`/blog/[slug]`)
- Server component, fetches post by slug from Supabase
- Nav present (with theme toggle)
- Article layout: tag + date + read-time meta, Instrument Serif h1 title, 70ch measure body
- Body is stored HTML, rendered with `dangerouslySetInnerHTML` (sanitized server-side)
- `generateStaticParams` for published posts

---

## 5. Admin Panel

### Login (`/admin/login`)
- Dark theme forced (no toggle on this page)
- Centered bracketed card, corner marks, status indicator
- Real Google OAuth button via NextAuth `signIn('google')`
- Error state for unauthorized email

### Protected Layout
- Sidebar: logo/brand, nav links to all 8 panels, current user email, sign-out button
- Content area scrollable

### Admin Panels

Each panel follows the same pattern: fetch data on load → list view → modal/inline form for create/edit → delete with confirmation → ⌘S to save.

**Profile** — Single form: all profile fields, avatar upload (drag-drop or browse, preview, stores to Supabase Storage), résumé upload (PDF, stores to Storage), skills_top chip editor (add/remove tags).

**Judges** — Cards list. Edit form: name, handle, rating, max_rating, title, title_color (color picker), contests_count, problems_count. Rating points editor: table of {contest name, rating} pairs to build sparkline data. Reorder ↑/↓.

**Contests** — Tabs: Team / Individual. Each tab shows contest rows. Form: rank, title, sub, year, position (free text). Reorder within tab.

**Skills** — Category list. Per-category: skill rows with name + level 1–5 picker. Add/rename/delete categories. Reorder skills.

**Career** — Timeline cards. Form: role, company, url, date_label, location, is_current toggle, bullets (dynamic list), stack chips. Reorder.

**Projects** — Cards. Form: num, title, tagline, description, bullets (label+text pairs), stack chips, github_url, live_url, image gallery editor (upload images → Supabase Storage, reorder, delete). Reorder.

**Posts** — Post list with publish status, read time, date. Rich editor (contentEditable toolbar: paragraph style, font size, B/I/U/S, color, lists, blockquote, code, link ⌘K, image insert, undo/redo). Live word count + auto read-time. Publish/unpublish toggle. Slug auto-generated from title.

**Certifications** — Cards list. Form: title, issuer, date_label, credential_url, description. Reorder.

---

## 6. Data Flow

- **Public pages:** Server Components fetch from Supabase using service role client → render HTML → minimal JS for interactivity (tab switches, image carousel, theme toggle)
- **Admin CRUD:** Client form → `fetch('/api/admin/...')` → API route validates session → Supabase service role upsert
- **File uploads:** Client `FormData` → `POST /api/admin/upload?bucket=avatars|resumes|project-images` → API streams to Supabase Storage → returns public URL
- **Theme:** Client reads `localStorage` on mount → sets `data-theme` on `<html>` → CSS variables cascade

---

## 7. Key Implementation Notes

- **Sparkline:** SVG rendered client-side from `trend` jsonb array. Normalize points to fit the SVG viewBox.
- **Marquee:** CSS animation (`scroll` keyframe, `translateX(-50%)`), content duplicated for seamless loop.
- **Scroll reveal:** IntersectionObserver adds `.in` class to `.reveal` elements.
- **Blog body sanitization:** Use `isomorphic-dompurify` or strip on server before storing/rendering.
- **Image carousel:** Client component with `useState` for current index; dot and arrow controls.
- **Bracket corners:** Pure CSS using `::before`/`::after` and child span elements.
- **No contact form** — footer shows email link only.
- **No tweaks/floating panel** — theme toggle only in Nav.
