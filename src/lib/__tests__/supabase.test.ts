jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ mockClient: true })),
}))

import { supabase } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase-server'

describe('Supabase clients', () => {
  it('supabase anon client is defined', () => {
    expect(supabase).toBeDefined()
  })

  it('createAdminClient returns a client', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    const client = createAdminClient()
    expect(client).toBeDefined()
  })
})
