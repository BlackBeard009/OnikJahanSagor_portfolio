-- Research & publications section
ALTER TABLE profile ADD COLUMN IF NOT EXISTS research_summary   text  DEFAULT '';
ALTER TABLE profile ADD COLUMN IF NOT EXISTS research_interests jsonb DEFAULT '[]';
ALTER TABLE profile ADD COLUMN IF NOT EXISTS scholar_url        text  DEFAULT '';
ALTER TABLE profile ADD COLUMN IF NOT EXISTS orcid_url          text  DEFAULT '';

CREATE TABLE IF NOT EXISTS publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  authors jsonb DEFAULT '[]',
  venue text DEFAULT '',
  year text DEFAULT '',
  status text DEFAULT 'preprint',
  abstract text DEFAULT '',
  highlights jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  pdf_url text DEFAULT '',
  arxiv_url text DEFAULT '',
  doi_url text DEFAULT '',
  code_url text DEFAULT '',
  bibtex text DEFAULT '',
  featured boolean DEFAULT false,
  "order" int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read publications" ON publications;
CREATE POLICY "Public read publications" ON publications FOR SELECT TO anon USING (true);
