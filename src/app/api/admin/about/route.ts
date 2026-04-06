import { NextRequest, NextResponse } from 'next/server'
import { getAbout, updateAbout } from '@/lib/db/about'

export async function GET() {
  const about = await getAbout()
  return NextResponse.json(about)
}

export async function PUT(req: NextRequest) {
  const { id, ...updates } = await req.json()
  const about = await updateAbout(id, updates)
  return NextResponse.json(about)
}
