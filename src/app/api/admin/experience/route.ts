import { NextRequest, NextResponse } from 'next/server'
import { getExperience, createExperience } from '@/lib/db/experience'

export async function GET() {
  const data = await getExperience()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = await createExperience(body)
  return NextResponse.json(entry, { status: 201 })
}
