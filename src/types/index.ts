export interface Project {
  id: string
  title: string
  slug: string
  description: string | null
  tech_stack: string[]
  highlights: string[]
  image_url: string | null
  github_url: string | null
  live_url: string | null
  featured: boolean
  order: number
  created_at: string
}

export interface Experience {
  id: string
  company: string
  role: string
  start_date: string
  end_date: string | null
  description: string | null
  achievements: string[]
  logo_url: string | null
  order: number
}

export interface Achievement {
  id: string
  platform: string
  rating: number | null
  rank: string | null
  problems_solved: number | null
  badge: string | null
  profile_url: string | null
  category: string | null   // 'rating' | 'team' | 'individual'
  value: string | null      // right-side text for individual cards
  color: string | null      // tailwind color key
  order: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  cover_image: string | null
  published: boolean
  published_at: string | null
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

export interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  codeforces?: string
  email?: string
  [key: string]: string | undefined
}

export interface Skill {
  name: string
  category: string
  level?: string
}

export interface EducationEntry {
  degree: string
  institution: string
  start_year: number
  end_year: number | null
}

export interface About {
  id: string
  bio: string | null
  avatar_url: string | null
  resume_url: string | null
  social_links: SocialLinks
  skills: Skill[]
  education: EducationEntry[]
}
