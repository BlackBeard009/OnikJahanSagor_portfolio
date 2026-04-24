import { NextResponse } from 'next/server'
import { getJudges, createJudge } from '@/lib/db/judges'

export async function GET() {
  try {
    const judges = await getJudges()
    return NextResponse.json(judges)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch judges' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const judge = await createJudge(body)
    return NextResponse.json(judge, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create judge' }, { status: 500 })
  }
}
