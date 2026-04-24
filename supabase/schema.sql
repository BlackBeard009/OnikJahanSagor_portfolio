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
