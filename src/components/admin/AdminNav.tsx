'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const sections = [
  { href: '/admin', label: 'Dashboard', n: '00' },
  { href: '/admin/profile', label: 'Profile', n: '01' },
  { href: '/admin/judges', label: 'Judge ratings', n: '02' },
  { href: '/admin/contests', label: 'Contests', n: '03' },
  { href: '/admin/skills', label: 'Skills', n: '04' },
  { href: '/admin/career', label: 'Career timeline', n: '05' },
  { href: '/admin/projects', label: 'Projects', n: '06' },
  { href: '/admin/posts', label: 'Writing', n: '07' },
  { href: '/admin/certifications', label: 'Certifications', n: '08' },
]

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <aside className="side">
      <div className="side-brand">
        <div className="mk">OJ</div>
        <div className="brand-title">portfolio<span className="dim">.admin</span></div>
      </div>

      <div className="side-eyebrow">Sections</div>
      {sections.map(({ href, label, n }) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
        return (
          <Link key={href} href={href} className={`nav-item${active ? ' active' : ''}`}>
            <span>{label}</span>
            <span className="n">{n}</span>
          </Link>
        )
      })}

      <div className="side-footer">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </div>
        <button
          className="btn ghost"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
        >
          sign out
        </button>
        <Link className="btn ghost" href="/" style={{ textAlign: 'center', justifyContent: 'center' }}>
          ← view portfolio
        </Link>
      </div>
    </aside>
  )
}
