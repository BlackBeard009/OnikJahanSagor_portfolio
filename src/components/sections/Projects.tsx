import { Project, About } from '@/types'

interface ProjectsProps {
  projects: Project[]
  about: About | null
}

export function Projects({ projects, about }: ProjectsProps) {
  const githubUrl = about?.social_links?.github ?? '#'

  return (
    <section id="projects" className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl">rocket_launch</span>
          Featured Projects
        </h3>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-white transition-colors text-sm font-bold flex items-center gap-1"
        >
          View GitHub <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group relative bg-[#16282c] rounded-xl border border-[#224249] p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
          >
            {/* Hover-reveal action icons */}
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 inline-flex items-center justify-center bg-background-dark rounded-full hover:text-primary transition-colors"
                  title="View Code"
                >
                  <span className="material-symbols-outlined text-lg leading-none">code</span>
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 inline-flex items-center justify-center bg-background-dark rounded-full hover:text-primary transition-colors"
                  title="Live Demo"
                >
                  <span className="material-symbols-outlined text-lg leading-none">open_in_new</span>
                </a>
              )}
            </div>

            {/* Title */}
            <div className="mb-4">
              <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                {project.title}
              </h4>
              {project.tech_stack.length > 0 && (
                <p className="text-xs text-gray-500 font-mono mt-1">{project.tech_stack[0]}</p>
              )}
            </div>

            {/* Description */}
            {project.description && (
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">{project.description}</p>
            )}

            {/* Highlights */}
            {project.highlights && project.highlights.length > 0 && (
              <ul className="space-y-2 mb-6">
                {project.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="material-symbols-outlined text-primary text-base shrink-0 mt-[2px]">check_circle</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Tech stack badges */}
            <div className="flex flex-wrap gap-2 mt-auto">
              {project.tech_stack.map((tech) => (
                <span key={tech} className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
