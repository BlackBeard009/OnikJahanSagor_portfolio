import { NextRequest, NextResponse } from 'next/server'
import { updateProject, deleteProject } from '@/lib/db/projects'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const project = await updateProject(params.id, body)
  return NextResponse.json(project)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await deleteProject(params.id)
  return NextResponse.json({ success: true })
}
