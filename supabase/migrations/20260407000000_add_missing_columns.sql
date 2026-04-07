ALTER TABLE projects     ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS value       text;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS color       text;
