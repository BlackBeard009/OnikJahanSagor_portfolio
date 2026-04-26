import { getContests } from '@/lib/db/contests'
import ContestsPanel from '@/components/admin/ContestsPanel'

export default async function AdminContestsPage() {
  const contests = await getContests()
  return <ContestsPanel initial={contests} />
}
