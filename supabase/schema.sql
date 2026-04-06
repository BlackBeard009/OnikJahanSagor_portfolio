-- Projects
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  tech_stack  text[] DEFAULT '{}',
  image_url   text,
  github_url  text,
  live_url    text,
  featured    boolean DEFAULT false,
  "order"     integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- Work Experience
CREATE TABLE experience (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company      text NOT NULL,
  role         text NOT NULL,
  start_date   date NOT NULL,
  end_date     date,
  description  text,
  achievements text[] DEFAULT '{}',
  logo_url     text,
  "order"      integer DEFAULT 0
);

-- Competitive programming achievements
CREATE TABLE achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform        text NOT NULL,
  rating          integer,
  rank            text,
  problems_solved integer,
  badge           text,
  profile_url     text,
  category        text,
  "order"         integer DEFAULT 0
);

-- Blog posts
CREATE TABLE blog_posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text UNIQUE NOT NULL,
  content      text,
  excerpt      text,
  cover_image  text,
  published    boolean DEFAULT false,
  published_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

-- Contact messages
CREATE TABLE contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  subject    text,
  message    text NOT NULL,
  read       boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- About (single row)
CREATE TABLE about (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bio          text,
  avatar_url   text,
  resume_url   text,
  social_links jsonb DEFAULT '{}',
  skills       jsonb DEFAULT '[]',
  education    jsonb DEFAULT '[]'
);

-- Seed one about row
INSERT INTO about (bio) VALUES ('Your bio here');

-- Row Level Security: allow public reads on portfolio tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_projects" ON projects FOR SELECT USING (true);
CREATE POLICY "public_read_experience" ON experience FOR SELECT USING (true);
CREATE POLICY "public_read_achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "public_read_blog_posts" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "public_read_about" ON about FOR SELECT USING (true);
-- contact_messages: no public read (admin only via service role)
-- all writes go through service role key (bypasses RLS)
CREATE POLICY "allow_insert_contact" ON contact_messages FOR INSERT WITH CHECK (true);
