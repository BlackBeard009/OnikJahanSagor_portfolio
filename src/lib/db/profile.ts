import { createAdminClient } from '@/lib/supabase-server'
import type { Profile } from '@/types'

export async function getProfile(): Promise<Profile> {
  const db = createAdminClient()
  const { data, error } = await db.from('profile').select('*').single()
  if (error || !data) {
    return {
      id: '', name: '', handle: '', title: '', title_alt: '',
      location: '', timezone: '', status: '', years: 0,
      email: '', bio: '', github: '', linkedin: '', twitter: '',
      resume_url: '', avatar_url: '', skills_top: [],
    }
  }
  return data as Profile
}

export async function updateProfile(profile: Partial<Profile>): Promise<void> {
  const db = createAdminClient()
  const { data } = await db.from('profile').select('id').single()
  if (!data) throw new Error('No profile row found')
  const { error } = await db.from('profile').update(profile).eq('id', data.id)
  if (error) throw error
}
