import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

const ALLOWED_BUCKETS = ['avatars', 'resumes', 'project-images'] as const
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const bucket = url.searchParams.get('bucket') ?? ''

    if (!ALLOWED_BUCKETS.includes(bucket as (typeof ALLOWED_BUCKETS)[number])) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })

    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const db = createAdminClient()
    const { error } = await db.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = db.storage.from(bucket).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (e) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
