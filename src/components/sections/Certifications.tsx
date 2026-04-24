import { ExternalLink } from 'lucide-react'
import type { Certification } from '@/types'

export default function Certifications({ certs }: { certs: Certification[] }) {
  if (!certs.length) return null

  return (
    <section className="section container" id="certifications">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 06 — Credentials</div>
          <h2>Certifications</h2>
        </div>
        <div className="idx">{certs.length} credentials</div>
      </div>

      <div className="certs-grid">
        {certs.map((c) => (
          <div key={c.id} className="cert-card card bracket">
            <span className="br-bl" /><span className="br-br" />
            <div className="issuer">{c.issuer}</div>
            <div className="cert-title">{c.title}</div>
            {c.date_label && <div className="cert-date">{c.date_label}</div>}
            {c.description && <div className="cert-desc">{c.description}</div>}
            {c.credential_url && (
              <a
                className="btn"
                href={c.credential_url}
                target="_blank"
                rel="noreferrer"
                style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
              >
                <ExternalLink size={12} />
                <span>View credential</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
