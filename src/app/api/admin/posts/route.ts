import { NextResponse } from 'next/server'
import { getAllPosts, createPost } from '@/lib/db/posts'

export async function GET() {
  try { return NextResponse.json(await getAllPosts()) }
  catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.slug) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 80)
    }
    return NextResponse.json(await createPost(body), { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
