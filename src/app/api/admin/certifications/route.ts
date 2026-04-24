import { NextResponse } from 'next/server'
import { getCertifications, createCertification } from '@/lib/db/certifications'

export async function GET() {
  try { return NextResponse.json(await getCertifications()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    return NextResponse.json(await createCertification(await req.json()), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
