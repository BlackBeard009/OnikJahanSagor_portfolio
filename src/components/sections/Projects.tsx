import { Github, ExternalLink } from 'lucide-react'
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
                <Github size={14} />
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
              <Github size={12} />
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
