import { NextRequest, NextResponse } from 'next/server'
import { updateExperience, deleteExperience } from '@/lib/db/experience'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const entry = await updateExperience(id, body)
  return NextResponse.json(entry)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteExperience(id)
  return NextResponse.json({ success: true })
}
