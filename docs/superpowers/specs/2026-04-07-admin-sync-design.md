# Admin/API Sync Design

**Date:** 2026-04-07  
**Status:** Approved

## Problem

The public-facing portfolio sections were redesigned. Several fields now displayed publicly cannot be edited through the admin UI, and two DB columns are missing entirely. The goal is full CRUD parity between the public display and the admin interface.

---

## Gaps Identified

| Section | Gap |
|---------|-----|
| Projects | `highlights[]` shown publicly, no admin field, missing DB column |
| Achievements | `value` and `color` used for individual cards, no admin fields, missing DB columns |
| About | `codeforces` and `email` social links shown in Hero/Footer, no admin fields |
| Skills | Stored in `about.skills` JSONB as raw JSON text — no proper CRUD UI |

---

## 1. Database Migration

A new migration file `supabase/migrations/20260407000000_add_missing_columns.sql` adds the three missing columns:

```sql
ALTER TABLE projects     ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS value       text;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS color       text;
```

`supabase/schema.sql` is updated to match so it stays the source of truth.

No columns are dropped. `projects.image_url` remains in the DB (removed only from the admin form).

---

## 2. ProjectForm Changes

- **Remove** `image_url` input (field stays in DB but is no longer editable — data is stale/unused)
- **Add** `highlights` textarea — one highlight per line, split on newline before save, joined with `\n` when editing (same pattern as `achievements` in ExperienceForm)

---

## 3. AchievementForm Changes

The form becomes **context-aware** based on the selected `category`. Only relevant fields are shown per category.

### Category: `rating` (Online Judges)
- `platform` — **dropdown**: Codeforces / LeetCode / CodeChef / AtCoder
- `rating` — number input
- `rank` — text input (e.g. "Expert", "Guardian")
- `problems_solved` — number input
- `order` — number input

### Category: `team` (Team Contests)
- `platform` — free text (contest name, e.g. "ICPC Asia West Regional")
- `rank` — text input (description, e.g. "Top 10, Regionals 2024")
- `badge` — **dropdown**: globe / flag / leaderboard / trophy (maps to Material Symbol icon + color)
- `order` — number input

### Category: `individual` (Individual Achievements)
- `platform` — free text (title, e.g. "Codeforces")
- `rank` — text input (description, e.g. "Solved 500+ problems")
- `value` — text input (right-side large text, e.g. "500+", "Top 5%")
- `color` — **dropdown**: blue / indigo / primary / purple / green / yellow / orange
- `order` — number input

`profile_url` remains in the form (available across all categories) as it is in the existing type and schema.

---

## 4. AboutForm Changes

Add two new fields to the **Social Links** section (alongside existing github, linkedin, twitter):

- `codeforces` — text input (URL)
- `email` — text input (email address)

No API changes needed — the existing PUT route accepts `Partial<About>` and `social_links` is a JSONB object that already supports arbitrary keys.

---

## 5. Skills Admin Page (new)

### Data storage
Skills remain stored in `about.skills` as a JSONB array (`Skill[]`). No schema change.

### Admin page: `/admin/skills`
- Lists all skills in a table with columns: Name, Category, Level
- "Add Skill" button opens an inline form
- Edit and Delete buttons per row (same UX pattern as Achievements page)
- Skill form fields: `name` (text, required), `category` (text, required), `level` (text)

### API routes (new)

All routes read the current About row, mutate `about.skills`, then write back via the existing `updateAbout()` helper.

| Method | Route | Behaviour |
|--------|-------|-----------|
| GET | `/api/admin/skills` | Returns `about.skills` array |
| POST | `/api/admin/skills` | Appends one skill to the array |
| PUT | `/api/admin/skills/[name]` | Finds skill by name, replaces it |
| DELETE | `/api/admin/skills/[name]` | Finds skill by name, removes it |

`name` is URL-encoded in the path. Names must be unique within the skills array — the POST route returns 409 if a skill with the same name already exists.

---

## Implementation Order

1. DB migration + schema.sql update
2. ProjectForm — remove `image_url`, add `highlights`
3. AchievementForm — dynamic fields, dropdowns
4. AboutForm — add `codeforces` + `email` social links
5. `/api/admin/skills` routes
6. `/admin/skills` page

---

## Out of Scope

- Removing `image_url` from the DB
- Adding image display to the Projects public section
- Displaying `experience.achievements` or `experience.logo_url` publicly
- Any changes to public-facing section components
