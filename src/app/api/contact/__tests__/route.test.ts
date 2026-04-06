/**
 * @jest-environment node
 */
jest.mock('@/lib/db/messages', () => ({
  createMessage: jest.fn(),
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

import { POST } from '@/app/api/contact/route'
import { createMessage } from '@/lib/db/messages'

function makeRequest(body: object) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any
}

describe('POST /api/contact', () => {
  beforeEach(() => jest.clearAllMocks())

  it('saves a valid message and returns 201', async () => {
    ;(createMessage as jest.Mock).mockResolvedValue(undefined)
    const req = makeRequest({ name: 'Alice', email: 'alice@example.com', message: 'Hello' })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alice', email: 'alice@example.com' })
    )
  })

  it('returns 400 when required fields are missing', async () => {
    const req = makeRequest({ name: 'Alice' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(createMessage).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid email format', async () => {
    const req = makeRequest({ name: 'Alice', email: 'not-an-email', message: 'Hi' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
