import { NextResponse } from 'next/server'
import { updateContest, deleteContest } from '@/lib/db/contests'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await updateContest(id, await req.json())
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await deleteContest(id)
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
