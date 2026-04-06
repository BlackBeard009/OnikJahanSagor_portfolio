import { NextResponse } from 'next/server'
import { markMessageRead } from '@/lib/db/messages'

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await markMessageRead(id)
  return NextResponse.json({ success: true })
}
