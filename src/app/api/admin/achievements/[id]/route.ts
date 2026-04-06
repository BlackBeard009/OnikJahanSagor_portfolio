import { NextRequest, NextResponse } from 'next/server'
import { updateAchievement, deleteAchievement } from '@/lib/db/achievements'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const entry = await updateAchievement(id, body)
  return NextResponse.json(entry)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteAchievement(id)
  return NextResponse.json({ success: true })
}
