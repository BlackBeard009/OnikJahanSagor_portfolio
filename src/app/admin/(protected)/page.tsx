import { getProfile } from '@/lib/db/profile'
import { getJudges } from '@/lib/db/judges'
import { getContests } from '@/lib/db/contests'
import { getSkills } from '@/lib/db/skills'
import { getCareer } from '@/lib/db/career'
import { getProjects } from '@/lib/db/projects'
import { getAllPosts } from '@/lib/db/posts'
import { getCertifications } from '@/lib/db/certifications'

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

  const stats = [
    { label: 'Judges', value: judges.length, href: '/admin/judges' },
    { label: 'Contests', value: contests.length, href: '/admin/contests' },
    { label: 'Skills', value: skills.length, href: '/admin/skills' },
    { label: 'Career', value: career.length, href: '/admin/career' },
    { label: 'Projects', value: projects.length, href: '/admin/projects' },
    { label: 'Posts', value: posts.length, sub: `${posts.filter(p => p.published).length} published`, href: '/admin/posts' },
    { label: 'Certifications', value: certs.length, href: '/admin/certifications' },
  ]

  return (
    <>
      <h1 className="admin-page-title">Dashboard</h1>
      {profile && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
          {profile.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.name ?? ''} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{profile.name || 'No name set'}</div>
            <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>{profile.title || 'No title set'}</div>
          </div>
          <a href="/admin/profile" className="btn ghost" style={{ marginLeft: 'auto' }}>Edit Profile</a>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {stats.map(s => (
          <a key={s.label} href={s.href} className="card" style={{ padding: '20px 16px', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            {s.sub && <div style={{ color: 'var(--ink-4)', fontSize: 12, marginTop: 2 }}>{s.sub}</div>}
          </a>
        ))}
      </div>
    </>
  )
}
