import { getProjects } from '@/lib/db/projects'
import ProjectsPanel from '@/components/admin/ProjectsPanel'

export default async function AdminProjectsPage() {
  const projects = await getProjects()
  return (
    <>
      <h1 className="admin-page-title">Projects</h1>
      <ProjectsPanel initial={projects} />
    </>
  )
}
