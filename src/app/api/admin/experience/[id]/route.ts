import { NextRequest, NextResponse } from 'next/server'
import { updateExperience, deleteExperience } from '@/lib/db/experience'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const entry = await updateExperience(params.id, body)
  return NextResponse.json(entry)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await deleteExperience(params.id)
  return NextResponse.json({ success: true })
}
