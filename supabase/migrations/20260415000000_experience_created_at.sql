ALTER TABLE experience ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
