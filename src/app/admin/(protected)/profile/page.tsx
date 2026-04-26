import { getProfile } from '@/lib/db/profile'
import ProfilePanel from '@/components/admin/ProfilePanel'

export default async function AdminProfilePage() {
  const profile = await getProfile()
  return <ProfilePanel initial={profile} />
}
