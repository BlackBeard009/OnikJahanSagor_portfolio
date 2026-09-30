import { ExternalLink, FileText, Code2, GraduationCap } from 'lucide-react'
import CopyButton from '@/components/ui/CopyButton'
import { STATUS_LABELS } from '@/lib/publications'
import type { Profile, Publication } from '@/types'

function Authors({ authors, self }: { authors: string[]; self: string }) {
  const me = self.trim().toLowerCase()
  return (
    <div className="pub-authors">
      {authors.map((a, i) => (
        <span key={i}>
          {a.trim().toLowerCase() === me ? <strong className="me">{a}</strong> : a}
          {i < authors.length - 1 ? ', ' : ''}
        </span>
      ))}
    </div>
  )
}

function PubLinks({ p }: { p: Publication }) {
  const links = [
    { href: p.pdf_url, label: 'PDF', icon: <FileText size={12} /> },
    { href: p.arxiv_url, label: 'arXiv', icon: <ExternalLink size={12} /> },
    { href: p.doi_url, label: 'DOI', icon: <ExternalLink size={12} /> },
    { href: p.code_url, label: 'Code', icon: <Code2 size={12} /> },
  ].filter((l) => l.href)

  return (
    <div className="pub-links">
      {links.map((l) => (
        <a key={l.label} className="btn small" href={l.href} target="_blank" rel="noreferrer">
          {l.icon}<span>{l.label}</span>
        </a>
      ))}
      {p.bibtex && <CopyButton text={p.bibtex} label="BibTeX" />}
    </div>
  )
}

export default function Research({ profile, pubs }: { profile: Profile; pubs: Publication[] }) {
  const interests = profile.research_interests ?? []
  if (!pubs.length && !profile.research_summary && !interests.length) return null

  const sorted = [...pubs].sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order)

  return (
    <section className="section container" id="research">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 01 — Inquiry</div>
          <h2>Research &amp; Publications</h2>
        </div>
        <div className="idx">{pubs.length} {pubs.length === 1 ? 'paper' : 'papers'}</div>
      </div>

      {(profile.research_summary || interests.length > 0) && (
        <div className="research-intro">
          {profile.research_summary && <p className="research-summary">{profile.research_summary}</p>}
          <div className="research-side">
            {interests.length > 0 && (
              <>
                <div className="label-row">Interests</div>
                <div className="research-interests">
                  {interests.map((t) => <span key={t} className="chip"><span className="dot" />{t}</span>)}
                </div>
              </>
            )}
            {(profile.scholar_url || profile.orcid_url) && (
              <div className="pub-links">
                {profile.scholar_url && (
                  <a className="btn small" href={profile.scholar_url} target="_blank" rel="noreferrer">
                    <GraduationCap size={12} /><span>Google Scholar</span>
                  </a>
                )}
                {profile.orcid_url && (
                  <a className="btn small" href={profile.orcid_url} target="_blank" rel="noreferrer">
                    <ExternalLink size={12} /><span>ORCID</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pub-list">
        {sorted.map((p) => (
          <article key={p.id} className={`pub card bracket${p.featured ? ' featured' : ''}`}>
            <span className="br-bl" /><span className="br-br" />
            <div className="pub-meta">
              <span className={`pub-status s-${p.status}`}>{STATUS_LABELS[p.status] ?? p.status}</span>
              {p.venue && p.venue.toLowerCase() !== (STATUS_LABELS[p.status] ?? '').toLowerCase() && <span>{p.venue}</span>}
              {p.year && <span className="dim">{p.year}</span>}
            </div>
            <h3 className="pub-title">{p.title}</h3>
            {p.authors?.length > 0 && <Authors authors={p.authors} self={profile.name} />}

            {p.featured && p.highlights?.length > 0 && (
              <ul className="pub-highlights">
                {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}

            {p.abstract && (
              <details className="pub-abstract" open={p.featured && !p.highlights?.length}>
                <summary>Abstract</summary>
                <p>{p.abstract}</p>
              </details>
            )}

            {p.tags?.length > 0 && (
              <div className="pub-tags">
                {p.tags.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            )}

            <PubLinks p={p} />
          </article>
        ))}
      </div>
    </section>
  )
}
