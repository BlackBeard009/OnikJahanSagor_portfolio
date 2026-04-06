# Homepage Redesign — Design Spec

**Date:** 2026-04-07  
**Source design:** `docs/superpowers/stitch-design/homepage.md`  
**Approach:** Option A — rewrite section components in-place, keep DB integration, keep routing/auth/admin untouched.

---

## 1. Theme & Global Styles

### Tailwind config additions (`tailwind.config.ts`)
| Token | Value |
|---|---|
| `background-dark` | `#102023` |
| `surface-dark` | `#16282c` |
| `surface-darker` | `#0b1719` |
| `primary` | `#0dccf2` (keep existing) |
| `primary-dark` | `#0ab8da` |
| `glow` box-shadow | `0 0 15px -3px rgba(13,204,242,0.3)` |
| `glow-lg` box-shadow | `0 0 25px -5px rgba(13,204,242,0.4)` |

Border color `#224249` and `#315f68` used as Tailwind arbitrary values throughout.

### globals.css additions
- `.glass-card` — `background: rgba(22,40,44,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05)`
- `.timeline-line` — `box-shadow: 0 0 8px rgba(13,204,242,0.6)`
- `.cp-grid-bg` — radial dot grid: `radial-gradient(circle at 1px 1px, rgba(13,204,242,0.1) 1px, transparent 0)` at `20px 20px`
- Custom scrollbar: 8px wide, `#102023` track, `#224249` thumb, `#315f68` on hover

### Root layout (`src/app/layout.tsx`)
Add Material Symbols Outlined `<link>` tag:
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```
Remove any existing icon library imports that are replaced by Material Symbols.

---

## 2. Layout & Navbar

**`src/app/(public)/layout.tsx`:**
- Minimal sticky navbar only — `fixed top-0 w-full bg-[#0b1719]/80 backdrop-blur-sm border-b border-[#224249] z-50`
- Anchor links only: About, Experience, Projects, Contact — no branding, no social icons
- Remove footer from layout (footer becomes an inline page section)

**`src/app/(public)/page.tsx`:**
- Renders sections: `<Hero />`, `<Achievements />`, experience+skills grid, `<Projects />`, `<Footer />`
- Outer wrapper: `pt-8 pb-12 flex flex-col items-center w-full`
- Inner max-width container: `max-w-[1100px] w-full px-6 flex flex-col gap-16`
- Remove `<About />`, `<BlogPreview />`, standalone `<Contact />` from homepage render (files kept for admin)

---

## 3. Hero Component

**File:** `src/components/sections/Hero.tsx`

**Layout:** `flex-col-reverse md:flex-row items-center gap-10 py-10 md:py-16 relative`

**Left column (text):**
- Name badge: `size-10 rounded-lg bg-primary/20` logo square + "Onik Jahan Sagor" bold text
- "Open to Work" pill: pulsing cyan dot (`animate-ping`) + uppercase label — `bg-primary/10 border border-primary/20`
- Heading: `text-4xl md:text-5xl lg:text-6xl font-black` — "Software Engineer &" + line break + gradient span "Competitive Programmer" (`bg-gradient-to-r from-primary to-cyan-200`)
- Bio: `about.bio` from DB, `text-gray-400 text-base md:text-lg leading-relaxed`
- Mobile social icons (`md:hidden`): LinkedIn, GitHub, Codeforces — `size-10 rounded-full bg-[#16282c] border border-[#224249]`, hover to `bg-primary`
- CTAs: "View Work" (`bg-primary text-[#102023] shadow-glow hover:-translate-y-[2px]`) + "Download CV" (`border border-gray-600 hover:border-primary`, links to `about.resume_url`)

**Right column (avatar):**
- `w-64 h-64 md:w-80 md:h-80 shrink-0 relative`
- Blur glow: `absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl`
- Image: `rounded-full overflow-hidden border-2 border-primary/30 shadow-2xl`, src from `about.avatar_url`

**Desktop social icons:** `absolute top-0 right-0 hidden md:flex gap-4` — same style as mobile

**Social link sources:** `about.social_links` object from DB (keys: `linkedin`, `github`, `codeforces`)

---

## 4. Competitive Programming (Achievements)

**File:** `src/components/sections/Achievements.tsx`

**Section header:** `emoji_events` icon + "Competitive Programming" h2

**Outer card:** `rounded-2xl border border-[#224249] bg-[#16282c]/30 backdrop-blur-sm overflow-hidden`

### Online Judge Ratings panel (top, `border-b border-[#224249]`)
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4`
- 4 platform cards (Codeforces, LeetCode, CodeChef, AtCoder) + 1 "Problems Solved" summary card
- Platform card: `glass-card p-4 rounded-xl`, platform label (mono uppercase), logo/icon, rating number (`text-2xl font-bold`), rank label (colored), progress bar with glow
- Color scheme per platform: Codeforces→purple, LeetCode→yellow, CodeChef→orange, AtCoder→blue
- "Problems Solved" card: primary accent, large number, "Across all platforms" note
- Data: `achievements` table where `category = 'rating'`; fields: `platform`, `rating`, `rank`, `problems_solved`

### Bottom grid (`grid-cols-1 lg:grid-cols-2`)

**Left — Team Contests** (`border-b lg:border-b-0 lg:border-r border-[#224249]`):
- `groups` icon + "Team Contests" header
- Each item: `flex items-start gap-4 p-3 hover:bg-[#16282c] rounded-lg border border-transparent hover:border-[#224249]`
- Icon square (`size-10 rounded-md bg-[#0b1719] border border-[#224249]`) + title + subtitle
- Data: `achievements` where `category = 'team'`; fields: `platform` (contest name), `rank` (subtitle), `icon` (material symbol name)

**Right — Individual Achievements** (cp-grid-bg):
- `military_tech` icon + "Individual Achievements" header
- Each card: `glass-card p-4 rounded-xl border-l-4` (color varies), title + subtitle left, value right (`text-2xl font-black text-gray-600 group-hover:text-[color]/50`)
- Data: `achievements` where `category = 'individual'`; fields: `platform` (name), `rank` (subtitle), `value` (right-side text), `color` (border color)

### DB schema changes
Add to `achievements` table:
- `category`: `text` — values: `'rating'` | `'team'` | `'individual'`
- `value`: `text` — used for right-side display on individual achievement cards
- `color`: `text` — Tailwind color name used for border/icon tinting

---

## 5. Experience & Skills

**`src/app/(public)/page.tsx`** renders these two side-by-side:
```tsx
<section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16" id="experience">
  <div className="lg:col-span-7"><Experience /></div>
  <div className="lg:col-span-5"><Skills /></div>
</section>
```

### Experience (`src/components/sections/Experience.tsx`)
- Header: `history_edu` icon + "Career Timeline"
- Grid layout: `grid grid-cols-[40px_1fr] gap-x-4`
- Left column: alternating circle dots + vertical connector lines
  - Active/current entry: `border-primary shadow-glow text-primary`
  - Past entries: `border-[#315f68] text-gray-400`
  - Connector line: `w-[2px] bg-gradient-to-b from-primary to-[#224249]` (first), `bg-[#224249]` (rest)
- Right column: role (`text-xl font-bold`), date pill (primary for current, gray mono for past), company (`text-gray-300 font-medium`), description (`text-gray-400 text-sm`)
- Data: `experience` table — existing fields reused

### Skills (`src/components/sections/Skills.tsx`)
- Header: `build` icon + "Technical Expertise"
- Three stacked cards: `bg-[#16282c]/50 border border-[#224249] rounded-xl p-6`
  - Card 1: Languages — each tag uniquely color-coded (C++→blue, Python→yellow, JS→yellow-300, TS→blue-400, Java→orange, Go→purple)
  - Card 2: Frameworks & Libraries
  - Card 3: Tools & Platforms
- Tag style: `px-3 py-1.5 rounded-md text-sm font-medium bg-[color]/10 text-[color] border border-[color]/20`
- Data: `skills` table grouped by `category` field — existing structure

---

## 6. Projects

**File:** `src/components/sections/Projects.tsx`

- Header: `rocket_launch` icon + "Featured Projects" + "View GitHub →" anchor link (right-aligned)
- `grid grid-cols-1 md:grid-cols-2 gap-6`
- Card: `group relative bg-[#16282c] rounded-xl border border-[#224249] p-6 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden`
- Hover-reveal icons (top-right): `opacity-0 group-hover:opacity-100` — `code` (GitHub) + `open_in_new` (live demo)
- Card body: title (hover→primary), mono subtitle, description, highlights bullet list (`check_circle` icon + text), tech stack badges (`bg-primary/10 text-primary text-xs font-bold`)
- Data: `projects` table — existing fields plus new `highlights: text[]` column for bullet points

### DB schema changes
Add to `projects` table:
- `highlights`: `text[]` — 2-3 bullet point strings per project

---

## 7. Footer (new component)

**File:** `src/components/sections/Footer.tsx` (new file)

- `bg-[#0b1719] border-t border-[#224249]`
- Inner: `max-w-[1100px] mx-auto px-6 py-12`
- Left: "Let's Connect" h3 + tagline paragraph
- Right: email link (`mail` icon + email address) + social icon row (LinkedIn, GitHub, Codeforces)
- Bottom divider bar: copyright "© 2026 Onik Jahan Sagor" + location (`location_on` icon) + timezone (`schedule` icon)
- Data: `about.social_links` and `about.email` from DB

---

## Summary of DB Schema Changes

| Table | Column | Type | Purpose |
|---|---|---|---|
| `achievements` | `category` | `text` | `'rating'` / `'team'` / `'individual'` |
| `achievements` | `value` | `text` | Right-side display text for individual cards |
| `achievements` | `color` | `text` | Color key for border/icon tinting |
| `projects` | `highlights` | `text[]` | 2-3 bullet achievement strings |
| `about` | `email` | `text` | Contact email shown in footer |

All existing columns remain unchanged.
