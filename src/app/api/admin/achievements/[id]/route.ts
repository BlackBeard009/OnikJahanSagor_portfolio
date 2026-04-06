import { NextRequest, NextResponse } from 'next/server'
import { updateAchievement, deleteAchievement } from '@/lib/db/achievements'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const entry = await updateAchievement(params.id, body)
  return NextResponse.json(entry)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await deleteAchievement(params.id)
  return NextResponse.json({ success: true })
}
