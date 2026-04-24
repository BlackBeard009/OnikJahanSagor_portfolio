import Link from 'next/link'
import type { Post } from '@/types'

export default function Writing({ posts }: { posts: Post[] }) {
  return (
    <section className="section container" id="writing">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 05 — Notes</div>
          <h2>Writing</h2>
        </div>
        <div className="idx">selected posts · read all →</div>
      </div>

      <div className="writing">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="post-card card bracket"
          >
            <span className="br-bl" /><span className="br-br" />
            <div>
              <div className="date">
                {p.date_label} · <span style={{ color: 'var(--accent-ink)' }}>{p.tag}</span>
              </div>
              <div className="title" style={{ marginTop: 10 }}>{p.title}</div>
              <div className="excerpt" style={{ marginTop: 8 }}>{p.excerpt}</div>
            </div>
            <div className="read">
              <span>{p.read_time}</span>
              <span>read →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
