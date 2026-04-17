/**
 * @jest-environment node
 */

const mockUpload = jest.fn()
const mockGetPublicUrl = jest.fn()
const mockStorageFrom = jest.fn(() => ({
  upload: mockUpload,
  getPublicUrl: mockGetPublicUrl,
}))

jest.mock('@/lib/supabase-server', () => ({
  createAdminClient: jest.fn(() => ({
    storage: { from: mockStorageFrom },
  })),
}))

jest.mock('@/lib/db/about', () => ({
  getAbout: jest.fn(),
  updateAbout: jest.fn(),
}))

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body,
    })),
  },
}))

import { POST } from '@/app/api/admin/resume/route'
import { getAbout, updateAbout } from '@/lib/db/about'

const PUBLIC_URL = 'https://supabase.co/storage/v1/object/public/resume/resume.pdf'

function makeRequest(file: File | null) {
  const fd = new FormData()
  if (file) fd.append('file', file)
  return { formData: jest.fn().mockResolvedValue(fd) } as any
}

function makePdf(name = 'cv.pdf') {
  return new File(['%PDF-1.4'], name, { type: 'application/pdf' })
}

describe('POST /api/admin/resume', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpload.mockResolvedValue({ error: null })
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: PUBLIC_URL } })
    ;(getAbout as jest.Mock).mockResolvedValue({ id: 'about-1', resume_url: null })
    ;(updateAbout as jest.Mock).mockResolvedValue({})
  })

  it('uploads PDF and returns public URL', async () => {
    const req = makeRequest(makePdf())
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ url: PUBLIC_URL })
    expect(mockStorageFrom).toHaveBeenCalledWith('resume')
    expect(mockUpload).toHaveBeenCalledWith(
      'resume.pdf',
      expect.any(Buffer),
      { contentType: 'application/pdf', upsert: true }
    )
    expect(updateAbout).toHaveBeenCalledWith('about-1', { resume_url: PUBLIC_URL })
  })

  it('returns 400 when no file is provided', async () => {
    const req = makeRequest(null)
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'No file provided' })
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('returns 400 when file is not a PDF', async () => {
    const notPdf = new File(['hello'], 'cv.txt', { type: 'text/plain' })
    const req = makeRequest(notPdf)
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'File must be a PDF' })
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase upload fails', async () => {
    mockUpload.mockResolvedValue({ error: { message: 'bucket not found' } })
    const req = makeRequest(makePdf())
    const res = await POST(req)
    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: 'bucket not found' })
  })
})
