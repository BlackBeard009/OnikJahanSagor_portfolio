import { NextRequest, NextResponse } from 'next/server'
import { getAbout, updateAbout } from '@/lib/db/about'
import type { Skill } from '@/types'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const skillName = decodeURIComponent(name)

  const about = await getAbout()
  if (!about) return NextResponse.json({ error: 'About row not found' }, { status: 500 })

  const updates: Skill = await req.json()
  const skills = (about.skills ?? []).map((s) =>
    s.name === skillName ? updates : s
  )

  const updated = await updateAbout(about.id, { skills })
  return NextResponse.json(updated.skills)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const skillName = decodeURIComponent(name)

  const about = await getAbout()
  if (!about) return NextResponse.json({ error: 'About row not found' }, { status: 500 })

  const skills = (about.skills ?? []).filter((s) => s.name !== skillName)
  const updated = await updateAbout(about.id, { skills })
  return NextResponse.json(updated.skills)
}
