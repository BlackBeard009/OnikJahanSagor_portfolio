import { NextRequest, NextResponse } from 'next/server'
import { updateBlogPost, deleteBlogPost } from '@/lib/db/blog'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const post = await updateBlogPost(params.id, body)
  return NextResponse.json(post)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await deleteBlogPost(params.id)
  return NextResponse.json({ success: true })
}
