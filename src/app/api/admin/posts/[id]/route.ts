import { NextResponse } from 'next/server'
import { updatePost, deletePost } from '@/lib/db/posts'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await updatePost(id, await req.json())
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await deletePost(id)
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
