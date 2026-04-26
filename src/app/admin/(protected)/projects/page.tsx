import { getProjects } from '@/lib/db/projects'
import ProjectsPanel from '@/components/admin/ProjectsPanel'

export default async function AdminProjectsPage() {
  const projects = await getProjects()
  return <ProjectsPanel initial={projects} />
}
