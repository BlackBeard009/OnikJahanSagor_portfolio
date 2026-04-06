// Test the auth check logic, not the full Next.js middleware
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  })),
}))

jest.mock('next-auth/providers/google', () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: 'google' })),
}))

import { isAdminEmail } from '@/lib/auth'

describe('isAdminEmail', () => {
  const originalEnv = process.env.ADMIN_EMAIL

  afterEach(() => {
    process.env.ADMIN_EMAIL = originalEnv
  })

  it('returns true for the configured admin email', () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    expect(isAdminEmail('admin@example.com')).toBe(true)
  })

  it('returns false for a different email', () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    expect(isAdminEmail('other@example.com')).toBe(false)
  })

  it('returns false when email is undefined', () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    expect(isAdminEmail(undefined)).toBe(false)
  })
})
