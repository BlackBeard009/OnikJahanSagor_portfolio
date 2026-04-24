import { NextResponse } from 'next/server'
import { updateCareerEntry, deleteCareerEntry } from '@/lib/db/career'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await updateCareerEntry(id, await req.json())
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await deleteCareerEntry(id)
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
