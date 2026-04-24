import { getSkills } from '@/lib/db/skills'
import SkillsPanel from '@/components/admin/SkillsPanel'

export default async function AdminSkillsPage() {
  const skills = await getSkills()
  return (
    <>
      <h1 className="admin-page-title">Skills</h1>
      <SkillsPanel initial={skills} />
    </>
  )
}
