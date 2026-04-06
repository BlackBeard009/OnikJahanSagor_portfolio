import { notFound } from 'next/navigation'
import { getProjectBySlug, getProjects } from '@/lib/db/projects'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export const revalidate = 60

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((p) => ({ slug: p.slug }))
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) notFound()

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link href="/#projects">
        <Button variant="ghost" size="sm" className="mb-8">← Back to Projects</Button>
      </Link>

      <GlassCard className="flex flex-col gap-6">
        {project.image_url && (
          <img src={project.image_url} alt={project.title} className="w-full h-64 object-cover rounded-lg" />
        )}
        <h1 className="text-3xl font-bold text-white">{project.title}</h1>

        {project.description && (
          <p className="text-gray-300 leading-relaxed">{project.description}</p>
        )}

        <div>
          <h3 className="text-white font-semibold mb-3">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {project.tech_stack.map((t) => (
              <Badge key={t} variant="cyan">{t}</Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">View on GitHub</Button>
            </a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer">
              <Button>Live Demo</Button>
            </a>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
