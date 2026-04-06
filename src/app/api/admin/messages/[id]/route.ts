import { NextResponse } from 'next/server'
import { markMessageRead } from '@/lib/db/messages'

export async function PUT(_req: Request, { params }: { params: { id: string } }) {
  await markMessageRead(params.id)
  return NextResponse.json({ success: true })
}
