import { NextResponse } from 'next/server'
import { getCareer, createCareerEntry } from '@/lib/db/career'

export async function GET() {
  try { return NextResponse.json(await getCareer()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    return NextResponse.json(await createCareerEntry(await req.json()), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
