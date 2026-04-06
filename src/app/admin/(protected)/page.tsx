import { getProjects } from '@/lib/db/projects'
import { getMessages } from '@/lib/db/messages'
import { getBlogPosts } from '@/lib/db/blog'
import { getExperience } from '@/lib/db/experience'
import { GlassCard } from '@/components/ui/GlassCard'

export default async function AdminDashboard() {
  const [projects, messages, posts, experience] = await Promise.all([
    getProjects(),
    getMessages(),
    getBlogPosts(false),
    getExperience(),
  ])

  const unread = messages.filter((m) => !m.read).length

  const stats = [
    { label: 'Projects', value: projects.length },
    { label: 'Blog Posts', value: posts.length, sub: `${posts.filter((p) => p.published).length} published` },
    { label: 'Messages', value: messages.length, sub: unread > 0 ? `${unread} unread` : 'All read', highlight: unread > 0 },
    { label: 'Experience Entries', value: experience.length },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <GlassCard key={stat.label}>
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className={`text-4xl font-bold mt-1 ${stat.highlight ? 'text-cyan' : 'text-white'}`}>{stat.value}</p>
            {stat.sub && <p className="text-gray-500 text-xs mt-1">{stat.sub}</p>}
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
