import { NextResponse } from 'next/server'
import { getContests, createContest } from '@/lib/db/contests'

export async function GET() {
  try { return NextResponse.json(await getContests()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    return NextResponse.json(await createContest(body), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
