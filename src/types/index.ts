// src/types/index.ts

export interface Profile {
  id: string
  name: string
  handle: string
  title: string
  title_alt: string
  location: string
  timezone: string
  status: string
  years: number
  email: string
  bio: string
  github: string
  linkedin: string
  twitter: string
  resume_url: string
  avatar_url: string
  skills_top: string[]
}

export interface Judge {
  id: string
  name: string
  handle: string
  rating: number
  max_rating: number
  title: string
  title_color: string
  contests_count: number
  problems_count: number
  trend: TrendPoint[]
  order: number
}

export interface TrendPoint {
  contest: string
  rating: number
}

export interface Contest {
  id: string
  type: 'team' | 'individual'
  rank: number
  title: string
  sub: string
  year: string
  position: string
  order: number
}

export interface Skill {
  id: string
  category: string
  name: string
  level: number
  order: number
}

export interface CareerEntry {
  id: string
  role: string
  company: string
  company_url: string
  date_label: string
  location: string
  is_current: boolean
  bullets: string[]
  stack: string[]
  order: number
}

export interface ProjectBullet {
  b: string
  t: string
}

export interface Project {
  id: string
  num: string
  title: string
  tagline: string
  description: string
  bullets: ProjectBullet[]
  stack: string[]
  github_url: string
  live_url: string
  images: string[]
  order: number
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  tag: string
  read_time: string
  date_label: string
  published: boolean
  created_at: string
}

export interface Certification {
  id: string
  title: string
  issuer: string
  date_label: string
  credential_url: string
  description: string
  order: number
}
