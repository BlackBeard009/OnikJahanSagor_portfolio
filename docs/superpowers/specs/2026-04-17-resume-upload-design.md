# Resume Upload & PDF Viewer — Design Spec

**Date:** 2026-04-17
**Status:** Approved

## Overview

Replace the manual "Resume URL" text input in the admin About form with a PDF file upload that stores the resume in Supabase Storage. Clicking "Download CV" on the public site opens the PDF in a new browser tab using the browser's native PDF viewer instead of triggering a file download.

## Goals

- Admin can upload a PDF resume directly from the About admin page
- Uploading a new resume automatically replaces the old one
- Public visitors see the resume in-browser (new tab, PDF viewer) instead of downloading it
- No orphaned files accumulate in storage

## Architecture

### Storage

- **Supabase Storage bucket:** `resume` (public)
- **Fixed file path:** `resume/resume.pdf`
- Upload uses `upsert: true` so any existing file is silently overwritten
- Public URL is stable — does not change between uploads, so `about.resume_url` only needs to be written once (on first upload)
- On subsequent uploads, `resume_url` in the DB is updated again to keep it consistent

### API Route

**`POST /api/admin/resume`** (protected, admin only)

- Accepts a `multipart/form-data` request with the PDF file
- Validates: file must be present, MIME type must be `application/pdf`
- Uploads to Supabase Storage at `resume/resume.pdf` with `upsert: true`
- Retrieves the public URL from Supabase Storage
- Updates `about.resume_url` in the DB with the public URL
- Returns `{ url: string }` on success

### Database

No schema changes required. The existing `resume_url` text field in the `about` table is reused.

## Components

### `AboutForm` (admin)

- Remove the "Resume URL" `<Input>` text field
- Add a file picker: `<input type="file" accept=".pdf">`
- Below the picker, display resume status:
  - If `resume_url` exists: "Resume on file — [View](url)" link
  - If not: "No resume uploaded"
- On form submit, if a file is selected: call `POST /api/admin/resume` first, then proceed with the rest of the About form save
- If no file is selected, skip the resume upload step entirely

### `Hero.tsx` (public)

- Remove the `download` attribute from the resume anchor tag
- Add `target="_blank"` and `rel="noopener noreferrer"`
- Clicking the button opens the PDF URL in a new tab where the browser renders it inline

## Data Flow

```
Admin selects PDF → form submit → POST /api/admin/resume
  → Supabase Storage upsert (resume/resume.pdf)
  → get public URL
  → update about.resume_url in DB
  → return { url }
→ rest of About form saves normally

Public user clicks "Download CV"
  → new tab opens with Supabase Storage public URL
  → browser renders PDF inline
```

## Error Handling

- Non-PDF file selected: show validation error before upload, do not submit
- Upload fails (network/storage error): show error toast, do not save other About fields
- `resume_url` is null: "Download CV" button is rendered but visually disabled (existing behavior)

## Out of Scope

- Resume version history
- File size limit enforcement beyond browser defaults
- Support for non-PDF formats
