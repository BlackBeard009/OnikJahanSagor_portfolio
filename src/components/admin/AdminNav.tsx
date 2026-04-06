'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { clsx } from 'clsx'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/experience', label: 'Experience' },
  { href: '/admin/achievements', label: 'Achievements' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/about', label: 'About' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen glass border-r border-dark-border flex flex-col p-4 gap-1">
      <div className="text-cyan font-bold text-lg px-3 py-4 mb-2">Admin Panel</div>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={clsx(
            'px-3 py-2 rounded-lg text-sm transition-colors',
            pathname === link.href
              ? 'bg-cyan/10 text-cyan'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          {link.label}
        </Link>
      ))}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="mt-auto px-3 py-2 text-sm text-gray-500 hover:text-red-400 text-left transition-colors"
      >
        Sign Out
      </button>
    </aside>
  )
}
