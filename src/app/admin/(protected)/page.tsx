import { getProfile } from '@/lib/db/profile'
import { getJudges } from '@/lib/db/judges'
import { getContests } from '@/lib/db/contests'
import { getSkills } from '@/lib/db/skills'
import { getCareer } from '@/lib/db/career'
import { getProjects } from '@/lib/db/projects'
import { getAllPosts } from '@/lib/db/posts'
import { getCertifications } from '@/lib/db/certifications'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [profile, judges, contests, skills, career, projects, posts, certs] = await Promise.all([
    getProfile(),
    getJudges(),
    getContests(),
    getSkills(),
    getCareer(),
    getProjects(),
    getAllPosts(),
    getCertifications(),
  ])

  const sections = [
    { label: 'Judge ratings', value: judges.length, n: '02', href: '/admin/judges' },
    { label: 'Contests', value: contests.length, n: '03', href: '/admin/contests' },
    { label: 'Skills', value: skills.length, n: '04', href: '/admin/skills' },
    { label: 'Career', value: career.length, n: '05', href: '/admin/career' },
    { label: 'Projects', value: projects.length, n: '06', href: '/admin/projects' },
    { label: 'Posts', value: posts.length, sub: `${posts.filter(p => p.published).length} published`, n: '07', href: '/admin/posts' },
    { label: 'Certifications', value: certs.length, n: '08', href: '/admin/certifications' },
  ]

  return (
    <>
      <div className="main-head">
        <div>
          <div className="eyebrow">§ overview</div>
          <h1>Dashboard</h1>
          {profile && <p>Editing as <strong>{profile.name || 'Unknown'}</strong> — {profile.title || 'No title'}</p>}
        </div>
        <Link className="btn primary" href="/admin/profile">edit profile</Link>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: `repeat(${Math.min(sections.length, 4)}, 1fr)` }}>
        {sections.slice(0, 4).map(s => (
          <Link key={s.href} href={s.href} className="stat" style={{ textDecoration: 'none', cursor: 'pointer', transition: 'background .15s' }}>
            <div className="k">{s.label}</div>
            <div className="v">{s.value}</div>
          </Link>
        ))}
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: `repeat(${sections.slice(4).length}, 1fr)` }}>
        {sections.slice(4).map(s => (
          <Link key={s.href} href={s.href} className="stat" style={{ textDecoration: 'none', cursor: 'pointer', transition: 'background .15s' }}>
            <div className="k">{s.label}</div>
            <div className="v">{s.value}{s.sub && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', marginLeft: 6, fontWeight: 400 }}>{s.sub}</span>}</div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {sections.map(s => (
          <Link key={s.href} href={s.href} className="nav-item" style={{ border: '1px solid var(--line)', borderLeft: '2px solid var(--line)', background: 'var(--bg-elev)', borderRadius: 2, padding: '14px 16px' }}>
            <span>{s.label}</span>
            <span className="n">{s.n}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
