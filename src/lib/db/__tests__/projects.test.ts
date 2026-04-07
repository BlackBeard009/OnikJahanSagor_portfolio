jest.mock('@/lib/supabase-server', () => ({
  createAdminClient: jest.fn(),
}))

import { createAdminClient } from '@/lib/supabase-server'
import { getProjects, getProjectBySlug, createProject, updateProject, deleteProject } from '@/lib/db/projects'
import type { Project } from '@/types'

const mockProject: Project = {
  id: 'abc-123',
  title: 'My Project',
  slug: 'my-project',
  description: 'A cool project',
  tech_stack: ['TypeScript', 'React'],
  highlights: [],
  image_url: null,
  github_url: null,
  live_url: null,
  featured: false,
  order: 0,
  created_at: '2026-01-01T00:00:00Z',
}

function makeClient(data: unknown, error: null | { message: string } = null) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  }
  chain.select.mockReturnValue({ ...chain, order: jest.fn().mockResolvedValue({ data, error }) })
  chain.insert.mockReturnValue({ ...chain, select: jest.fn().mockReturnValue({ ...chain, single: jest.fn().mockResolvedValue({ data, error }) }) })
  chain.update.mockReturnValue({ ...chain, eq: jest.fn().mockReturnValue({ ...chain, select: jest.fn().mockReturnValue({ ...chain, single: jest.fn().mockResolvedValue({ data, error }) }) }) })
  chain.delete.mockReturnValue({ ...chain, eq: jest.fn().mockResolvedValue({ data: null, error }) })
  return { from: jest.fn().mockReturnValue(chain) }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getProjects', () => {
  it('returns projects ordered by order field', async () => {
    ;(createAdminClient as jest.Mock).mockReturnValue(makeClient([mockProject]))
    const result = await getProjects()
    expect(result).toEqual([mockProject])
  })
})

describe('getProjectBySlug', () => {
  it('returns a single project by slug', async () => {
    ;(createAdminClient as jest.Mock).mockReturnValue(makeClient(mockProject))
    const result = await getProjectBySlug('my-project')
    expect(result?.slug).toBe('my-project')
  })
})
