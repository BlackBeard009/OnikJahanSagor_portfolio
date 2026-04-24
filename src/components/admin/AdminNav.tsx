'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User, Gauge, Trophy, Star, Briefcase, FolderOpen,
  PenLine, Award, LayoutDashboard, LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/profile', label: 'Profile', icon: User },
  { href: '/admin/judges', label: 'Judges', icon: Gauge },
  { href: '/admin/contests', label: 'Contests', icon: Trophy },
  { href: '/admin/skills', label: 'Skills', icon: Star },
  { href: '/admin/career', label: 'Career', icon: Briefcase },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/posts', label: 'Posts', icon: PenLine },
  { href: '/admin/certifications', label: 'Certifications', icon: Award },
]

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="mark">◉ ADMIN</span>
        <span style={{ color: 'var(--ink-4)' }}>portfolio cms</span>
      </div>

      <nav className="admin-nav-links">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`admin-nav-link${active ? ' active' : ''}`}
            >
              <Icon size={14} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="email">{email}</div>
        <button
          className="admin-signout-btn"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
        >
          <LogOut size={11} style={{ display: 'inline', marginRight: 6 }} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
