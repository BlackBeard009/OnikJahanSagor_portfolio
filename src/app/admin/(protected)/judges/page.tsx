import { getJudges } from '@/lib/db/judges'
import JudgesPanel from '@/components/admin/JudgesPanel'

export default async function AdminJudgesPage() {
  const judges = await getJudges()
  return <JudgesPanel initial={judges} />
}
