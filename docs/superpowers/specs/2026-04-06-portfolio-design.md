# Portfolio Website Design Spec

**Date:** 2026-04-06  
**Project:** Software Engineer Portfolio — Next.js + Supabase + NextAuth.js

---

## Overview

A personal portfolio website for a software engineer, featuring a public-facing site and a password-protected admin panel. The public site presents the engineer's profile, projects, work history, competitive programming achievements, blog, and contact form. The admin panel allows the owner to manage all content via a secure Google-OAuth-only login.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth.js v5 with Google provider |
| File storage | Supabase Storage (images, resume) |
| Deployment | Vercel |
| Font | Inter |

---

## Design System

- **Color mode:** Dark
- **Accent:** `#0dccf2` (cyan)
- **Style:** Glass-morphism (frosted glass cards, backdrop blur)
- **Border radius:** 8px
- **Font:** Inter (Google Fonts)
- **Source:** Stitch project `4441938516836591006` (desktop)

---

## Public Routes

| Route | Description | Rendering |
|-------|-------------|-----------|
| `/` | Main single-page portfolio — Hero, About, Projects, Skills, Experience, Blog preview, Contact | ISR (revalidate: 60s) |
| `/projects/[slug]` | Individual project detail page | ISR (revalidate: 60s) |
| `/blog` | Blog post listing | ISR (revalidate: 60s) |
| `/blog/[slug]` | Individual blog post (Markdown rendered) | ISR (revalidate: 60s) |

### Main page sections (in order)

1. **Hero** — Name, tagline, "Open to Work" badge, CTA buttons (View Projects, Download Resume)
2. **About** — Bio text, avatar, social links (GitHub, LinkedIn, Twitter)
3. **Competitive Programming** — Platform stats (Codeforces, LeetCode), achievements, problems solved
4. **Work Experience** — Timeline of roles with company, dates, description, achievements
5. **Education** — Degree, institution, dates
6. **Skills / Tech Stack** — Grouped by category (Languages, Frameworks, Infrastructure)
7. **Projects** — Card grid of featured projects; each links to `/projects/[slug]`
8. **Blog** — Preview of latest 3 posts; links to `/blog`
9. **Contact** — Form with name, email, subject, message; POST to `/api/contact`

---

## Admin Routes (Google OAuth protected)

All admin routes are protected by NextAuth middleware. Only the owner's specific Gmail address is allowed.

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard — overview stats (message count, project count, etc.) |
| `/admin/projects` | List, create, edit, delete projects |
| `/admin/experience` | List, create, edit, delete work experience entries |
| `/admin/achievements` | List, create, edit, delete competitive programming stats |
| `/admin/blog` | List, create, edit (Markdown editor), delete blog posts; toggle published |
| `/admin/messages` | View contact form submissions; mark as read |
| `/admin/about` | Edit bio, avatar, resume URL, social links, skills |

---

## API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/[...nextauth]` | ANY | — | NextAuth.js handler |
| `/api/contact` | POST | None | Submit contact form; saves to `contact_messages` table |
| `/api/admin/projects` | GET, POST | Admin | List / create projects |
| `/api/admin/projects/[id]` | PUT, DELETE | Admin | Update / delete project |
| `/api/admin/experience/[id]` | PUT, DELETE | Admin | Update / delete experience |
| `/api/admin/achievements/[id]` | PUT, DELETE | Admin | Update / delete achievement |
| `/api/admin/blog/[id]` | PUT, DELETE | Admin | Update / delete blog post |
| `/api/admin/messages/[id]` | PUT | Admin | Mark message as read |
| `/api/admin/about` | PUT | Admin | Update about/skills content |

---

## Data Model (Supabase / PostgreSQL)

### `projects`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
title        text NOT NULL
slug         text UNIQUE NOT NULL
description  text
tech_stack   text[]
image_url    text
github_url   text
live_url     text
featured     boolean DEFAULT false
order        integer DEFAULT 0
created_at   timestamptz DEFAULT now()
```

### `experience`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
company      text NOT NULL
role         text NOT NULL
start_date   date NOT NULL
end_date     date  -- null means "present"
description  text
achievements text[]
logo_url     text
order        integer DEFAULT 0
```

### `achievements`
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
platform         text NOT NULL  -- e.g. "Codeforces", "LeetCode"
rating           integer
rank             text
problems_solved  integer
badge            text
profile_url      text
category         text  -- e.g. "Competitive Programming"
order            integer DEFAULT 0
```

### `blog_posts`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
title        text NOT NULL
slug         text UNIQUE NOT NULL
content      text  -- Markdown
excerpt      text
cover_image  text
published    boolean DEFAULT false
published_at timestamptz
created_at   timestamptz DEFAULT now()
```

### `contact_messages`
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
name       text NOT NULL
email      text NOT NULL
subject    text
message    text NOT NULL
read       boolean DEFAULT false
created_at timestamptz DEFAULT now()
```

### `about` (single row)
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
bio          text
avatar_url   text
resume_url   text
social_links jsonb  -- { github, linkedin, twitter, ... }
skills       jsonb  -- [{ name, category, level }]
education    jsonb  -- [{ degree, institution, start_year, end_year }]
```

---

## Authentication

- **Provider:** Google OAuth via NextAuth.js v5
- **Restriction:** Only one email address allowed (set via `ADMIN_EMAIL` env var)
- **Session:** JWT stored in HTTP-only cookie
- **Protection:** Next.js middleware (`middleware.ts`) checks session on all `/admin/*` and `/api/admin/*` routes; redirects unauthenticated users to `/api/auth/signin`

---

## File Structure

```
src/
  app/
    (public)/
      page.tsx               # Main portfolio page
      projects/[slug]/
        page.tsx
      blog/
        page.tsx
        [slug]/page.tsx
    admin/
      layout.tsx             # Auth guard wrapper
      page.tsx               # Dashboard
      projects/page.tsx
      experience/page.tsx
      achievements/page.tsx
      blog/page.tsx
      messages/page.tsx
      about/page.tsx
    api/
      auth/[...nextauth]/route.ts
      contact/route.ts
      admin/
        projects/route.ts
        projects/[id]/route.ts
        experience/[id]/route.ts
        achievements/[id]/route.ts
        blog/[id]/route.ts
        messages/[id]/route.ts
        about/route.ts
  components/
    sections/                # Hero, About, Projects, etc.
    admin/                   # Admin UI components
    ui/                      # Shared (Button, Card, Input, etc.)
  lib/
    supabase.ts              # Supabase client
    auth.ts                  # NextAuth config
    db/                      # Data access functions per entity
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
ADMIN_EMAIL=                 # your Gmail address
```

---

## Rendering Strategy

Public pages use **ISR** (Incremental Static Regeneration) with a 60-second revalidation window. This means the public site is fast (served from CDN cache) and auto-updates within 60 seconds after any admin edit. Admin pages are fully server-rendered (no caching).
