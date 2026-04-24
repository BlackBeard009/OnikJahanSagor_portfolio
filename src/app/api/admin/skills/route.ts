import { NextResponse } from 'next/server'
import { getSkills, createSkill } from '@/lib/db/skills'

export async function GET() {
  try { return NextResponse.json(await getSkills()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    return NextResponse.json(await createSkill(await req.json()), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
