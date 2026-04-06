import { Achievement } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'

interface AchievementsProps {
  achievements: Achievement[]
}

export function Achievements({ achievements }: AchievementsProps) {
  if (!achievements.length) return null
  return (
    <section id="achievements" className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="section-heading">Competitive Programming</h2>
      <p className="section-subheading">Rankings and achievements</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((a) => (
          <GlassCard key={a.id} hover className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-lg">{a.platform}</span>
              {a.badge && <Badge variant="cyan">{a.badge}</Badge>}
            </div>
            {a.rating && (
              <div>
                <span className="text-3xl font-bold text-gradient">{a.rating}</span>
                <span className="text-gray-400 text-sm ml-2">rating</span>
              </div>
            )}
            {a.rank && <p className="text-gray-300 text-sm">{a.rank}</p>}
            {a.problems_solved && (
              <p className="text-gray-400 text-sm">{a.problems_solved.toLocaleString()} problems solved</p>
            )}
            {a.profile_url && (
              <a href={a.profile_url} target="_blank" rel="noopener noreferrer"
                className="text-cyan text-sm hover:underline mt-auto">
                View Profile →
              </a>
            )}
          </GlassCard>
        ))}
      </div>
    </section>
  )
}
