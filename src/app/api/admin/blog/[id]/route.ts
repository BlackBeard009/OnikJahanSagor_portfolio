import { NextRequest, NextResponse } from 'next/server'
import { updateBlogPost, deleteBlogPost } from '@/lib/db/blog'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const post = await updateBlogPost(id, body)
  return NextResponse.json(post)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteBlogPost(id)
  return NextResponse.json({ success: true })
}
