import Link from 'next/link'
import { Project } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface ProjectsProps {
  projects: Project[]
}

export function Projects({ projects }: ProjectsProps) {
  if (!projects.length) return null
  return (
    <section id="projects" className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="section-heading">Featured Projects</h2>
      <p className="section-subheading">Things I&apos;ve built</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <GlassCard key={project.id} hover className="flex flex-col gap-4">
            {project.image_url && (
              <img src={project.image_url} alt={project.title} className="w-full h-40 object-cover rounded-lg" />
            )}
            <h3 className="text-white font-bold text-lg">{project.title}</h3>
            {project.description && (
              <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{project.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {project.tech_stack.map((tech) => (
                <Badge key={tech} variant="cyan">{tech}</Badge>
              ))}
            </div>
            <div className="flex gap-3 mt-auto">
              <Link href={`/projects/${project.slug}`}>
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">GitHub</Button>
                </a>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}
