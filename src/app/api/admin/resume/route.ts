import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { getAbout, updateAbout } from '@/lib/db/about'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
  }

  const db = createAdminClient()
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error: uploadError } = await db.storage
    .from('resume')
    .upload('resume.pdf', buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = db.storage
    .from('resume')
    .getPublicUrl('resume.pdf')

  const about = await getAbout()
  if (about) {
    await updateAbout(about.id, { resume_url: publicUrl })
  }

  return NextResponse.json({ url: publicUrl })
}
