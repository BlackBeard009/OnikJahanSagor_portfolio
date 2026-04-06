import { NextRequest, NextResponse } from 'next/server'
import { getBlogPosts, createBlogPost } from '@/lib/db/blog'

export async function GET() {
  const posts = await getBlogPosts(false)
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const post = await createBlogPost(body)
  return NextResponse.json(post, { status: 201 })
}
