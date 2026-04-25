// src/app/api/admin/profile/__tests__/route.test.ts
import { GET, PUT } from '../route'

jest.mock('@/lib/supabase-server', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({ single: async () => ({ data: { id: '1', name: 'Test' }, error: null }) }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  }),
}))

jest.mock('@/lib/auth', () => ({
  auth: async () => ({ user: { email: 'admin@test.com' } }),
}))

describe('GET /api/admin/profile', () => {
  it('returns profile data', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.name).toBe('Test')
  })
})
