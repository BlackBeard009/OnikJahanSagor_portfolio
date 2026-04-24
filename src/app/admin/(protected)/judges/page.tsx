import { getJudges } from '@/lib/db/judges'
import JudgesPanel from '@/components/admin/JudgesPanel'

export default async function AdminJudgesPage() {
  const judges = await getJudges()
  return (
    <>
      <h1 className="admin-page-title">Online Judges</h1>
      <JudgesPanel initial={judges} />
    </>
  )
}
