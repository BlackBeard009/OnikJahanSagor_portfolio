import { NextResponse } from 'next/server'
import { getProjects, createProject } from '@/lib/db/projects'

export async function GET() {
  try { return NextResponse.json(await getProjects()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    return NextResponse.json(await createProject(await req.json()), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
