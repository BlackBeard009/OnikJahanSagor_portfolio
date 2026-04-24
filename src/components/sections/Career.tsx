import Chip from '@/components/ui/Chip'
import type { CareerEntry } from '@/types'

export default function Career({ entries }: { entries: CareerEntry[] }) {
  return (
    <section className="section container" id="career">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 03 — The Path</div>
          <h2>Career timeline</h2>
        </div>
        <div className="idx">{entries.length} roles</div>
      </div>

      <div className="timeline">
        {entries.map((r) => (
          <div key={r.id} className={`t-item${r.is_current ? ' current' : ''}`}>
            <div className="t-card">
              <div className="t-head">
                <div>
                  <div className="role">{r.role}</div>
                  <div className="co">
                    {r.company_url
                      ? <a href={r.company_url} target="_blank" rel="noreferrer">{r.company}</a>
                      : <span>{r.company}</span>}
                    {r.location && (
                      <>
                        <span style={{ color: 'var(--ink-4)', margin: '0 8px' }}>·</span>
                        <span>{r.location}</span>
                      </>
                    )}
                    {r.is_current && (
                      <span style={{ marginLeft: 8, color: 'var(--good)' }}>● now</span>
                    )}
                  </div>
                </div>
                <div className="t-date">{r.date_label}</div>
              </div>

              {r.bullets?.length > 0 && (
                <ul className="t-bullets">
                  {r.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}

              {r.stack?.length > 0 && (
                <div className="t-stack">
                  {r.stack.map((s) => <Chip key={s} dot>{s}</Chip>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
