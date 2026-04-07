import { NextRequest, NextResponse } from 'next/server'
import { getAbout, updateAbout } from '@/lib/db/about'
import type { Skill } from '@/types'

export async function GET() {
  const about = await getAbout()
  return NextResponse.json(about?.skills ?? [])
}

export async function POST(req: NextRequest) {
  const about = await getAbout()
  if (!about) return NextResponse.json({ error: 'About row not found' }, { status: 500 })

  const skill: Skill = await req.json()
  const existing = about.skills ?? []

  if (existing.some((s) => s.name === skill.name)) {
    return NextResponse.json({ error: 'A skill with this name already exists' }, { status: 409 })
  }

  const updated = await updateAbout(about.id, { skills: [...existing, skill] })
  return NextResponse.json(updated.skills, { status: 201 })
}
