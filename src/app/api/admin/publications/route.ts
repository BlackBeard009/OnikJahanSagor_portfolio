import { NextResponse } from 'next/server'
import { getPublications, createPublication } from '@/lib/db/publications'

export async function GET() {
  try { return NextResponse.json(await getPublications()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    return NextResponse.json(await createPublication(await req.json()), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
