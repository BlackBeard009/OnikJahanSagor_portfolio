import { getSkills } from '@/lib/db/skills'
import SkillsPanel from '@/components/admin/SkillsPanel'

export default async function AdminSkillsPage() {
  const skills = await getSkills()
  return <SkillsPanel initial={skills} />
}
