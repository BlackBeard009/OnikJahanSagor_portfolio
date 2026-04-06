import { NextRequest, NextResponse } from 'next/server'
import { getAchievements, createAchievement } from '@/lib/db/achievements'

export async function GET() {
  const data = await getAchievements()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = await createAchievement(body)
  return NextResponse.json(entry, { status: 201 })
}
