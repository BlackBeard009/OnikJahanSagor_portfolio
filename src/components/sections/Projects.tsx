import { ExternalLink } from 'lucide-react'

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}
import Chip from '@/components/ui/Chip'
import ProjectCarousel from './ProjectCarousel'
import type { Project } from '@/types'

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="project card bracket">
      <span className="br-bl" /><span className="br-br" />
      <div className="p-body">
        <div className="p-head">
          <div>
            <div className="p-num">PROJECT · {p.num}</div>
            <div className="p-title" style={{ marginTop: 6 }}>{p.title}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {p.github_url && (
              <a className="icon-btn" href={p.github_url} target="_blank" rel="noreferrer" title="GitHub">
                <GithubIcon size={14} />
              </a>
            )}
            {p.live_url && (
              <a className="icon-btn" href={p.live_url} target="_blank" rel="noreferrer" title="Live">
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {p.tagline && (
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.35 }}>
            {p.tagline}
          </div>
        )}

        <div className="p-desc">{p.description}</div>

        {p.bullets?.length > 0 && (
          <ul className="p-bullets">
            {p.bullets.map((b, i) => (
              <li key={i}><b>{b.b}:</b> {b.t}</li>
            ))}
          </ul>
        )}

        {p.stack?.length > 0 && (
          <div className="p-stack">
            {p.stack.map((s) => <Chip key={s}>{s}</Chip>)}
          </div>
        )}

        <div className="p-actions">
          {p.github_url && (
            <a className="btn primary" href={p.github_url} target="_blank" rel="noreferrer">
              <GithubIcon size={12} />
              <span>Source</span>
              <span style={{ color: 'var(--accent)', marginLeft: 6 }}>→</span>
            </a>
          )}
          {p.live_url && (
            <a className="btn" href={p.live_url} target="_blank" rel="noreferrer">
              <span>Live</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <ProjectCarousel images={p.images ?? []} title={p.title} />
    </article>
  )
}

export default function Projects({ projects }: { projects: Project[] }) {
  return (
    <section className="section container" id="projects">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 04 — Things I&apos;ve made</div>
          <h2>Personal projects</h2>
        </div>
        <div className="idx">{projects.length} projects</div>
      </div>

      <div className="projects">
        {projects.map((p) => <ProjectCard key={p.id} p={p} />)}
      </div>
    </section>
  )
}
