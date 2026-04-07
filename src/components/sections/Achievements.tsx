import { Achievement } from '@/types'

interface AchievementsProps {
  achievements: Achievement[]
}

const PLATFORM_STYLES: Record<string, { color: string; barColor: string; barWidth: string; icon?: string }> = {
  Codeforces: { color: 'text-purple-400', barColor: 'bg-purple-500', barWidth: 'w-[85%]', icon: 'bar_chart' },
  LeetCode:   { color: 'text-yellow-400', barColor: 'bg-yellow-500', barWidth: 'w-[95%]', icon: 'code_blocks' },
  CodeChef:   { color: 'text-orange-400', barColor: 'bg-orange-500', barWidth: 'w-[70%]', icon: 'restaurant_menu' },
  AtCoder:    { color: 'text-blue-300',   barColor: 'bg-blue-400',   barWidth: 'w-[60%]', icon: 'deployed_code' },
}

const BORDER_COLOR_MAP: Record<string, string> = {
  blue:    'border-l-blue-500',
  indigo:  'border-l-indigo-500',
  primary: 'border-l-primary',
  purple:  'border-l-purple-500',
  green:   'border-l-green-500',
  yellow:  'border-l-yellow-500',
  orange:  'border-l-orange-500',
}

const HOVER_COLOR_MAP: Record<string, string> = {
  blue:    'group-hover:text-blue-400',
  indigo:  'group-hover:text-indigo-400',
  primary: 'group-hover:text-primary',
  purple:  'group-hover:text-purple-400',
  green:   'group-hover:text-green-400',
  yellow:  'group-hover:text-yellow-400',
  orange:  'group-hover:text-orange-400',
}

const VALUE_HOVER_MAP: Record<string, string> = {
  blue:    'group-hover:text-blue-500/50',
  indigo:  'group-hover:text-indigo-500/50',
  primary: 'group-hover:text-primary/50',
  purple:  'group-hover:text-purple-500/50',
  green:   'group-hover:text-green-500/50',
  yellow:  'group-hover:text-yellow-500/50',
  orange:  'group-hover:text-orange-500/50',
}

const TEAM_ICON_COLOR: Record<string, string> = {
  globe:      'text-primary',
  flag:       'text-yellow-400',
  leaderboard:'text-blue-400',
  trophy:     'text-green-400',
}

export function Achievements({ achievements }: AchievementsProps) {
  const ratingAchievements = achievements.filter((a) => a.category === 'rating')
  const teamAchievements   = achievements.filter((a) => a.category === 'team')
  const individualAchievements = achievements.filter((a) => a.category === 'individual')

  const totalProblemsSolved = ratingAchievements.reduce(
    (sum, a) => sum + (a.problems_solved ?? 0), 0
  )

  return (
    <section id="achievements" className="w-full">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-primary text-4xl">emoji_events</span>
        <h2 className="text-3xl font-bold text-white">Competitive Programming</h2>
      </div>

      <div className="rounded-2xl border border-[#224249] bg-[#16282c]/30 backdrop-blur-sm overflow-hidden">

        {/* Online Judge Ratings */}
        <div className="p-6 md:p-8 border-b border-[#224249]">
          <h3 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">terminal</span>
            Online Judge Ratings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ratingAchievements.map((a) => {
              const style = PLATFORM_STYLES[a.platform] ?? { color: 'text-gray-400', barColor: 'bg-gray-500', barWidth: 'w-[50%]', icon: 'code' }
              return (
                <div
                  key={a.id}
                  className="glass-card p-4 rounded-xl flex flex-col gap-2 hover:border-primary/40 transition-all hover:bg-[#16282c]/80 group relative overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
                  <div className="flex items-center justify-between z-10">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{a.platform}</span>
                    <span className={`material-symbols-outlined ${style.color}`}>{style.icon}</span>
                  </div>
                  <div className="mt-2 z-10">
                    <p className="text-2xl font-bold text-white">{a.rating?.toLocaleString() ?? '—'}</p>
                    <p className={`text-sm font-medium ${style.color}`}>{a.rank ?? ''}</p>
                  </div>
                  <div className="w-full bg-gray-700 h-1 rounded-full mt-3 overflow-hidden">
                    <div className={`${style.barColor} h-full ${style.barWidth}`}></div>
                  </div>
                </div>
              )
            })}

            {/* Problems Solved summary card */}
            <div className="glass-card p-4 rounded-xl flex flex-col justify-center items-center gap-1 hover:border-primary/60 border-primary/20 transition-all hover:bg-primary/5 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
              <span className="material-symbols-outlined text-3xl text-primary mb-1">checklist</span>
              <p className="text-3xl font-black text-white tracking-tight">
                {totalProblemsSolved > 0 ? `${totalProblemsSolved.toLocaleString()}+` : '—'}
              </p>
              <p className="text-xs text-primary font-bold uppercase tracking-wider">Problems Solved</p>
              <p className="text-[10px] text-gray-500 mt-2">Across all platforms</p>
            </div>
          </div>
        </div>

        {/* Team Contests + Individual Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Team Contests */}
          <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-[#224249]">
            <h3 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">groups</span>
              Team Contests
            </h3>
            <div className="flex flex-col gap-4">
              {teamAchievements.map((a) => {
                const iconName = a.badge ?? 'public'
                const iconColor = TEAM_ICON_COLOR[iconName] ?? 'text-primary'
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-4 p-3 hover:bg-[#16282c] rounded-lg transition-colors border border-transparent hover:border-[#224249]"
                  >
                    <div className={`size-10 rounded-md bg-[#0b1719] border border-[#224249] flex items-center justify-center ${iconColor} shrink-0`}>
                      <span className="material-symbols-outlined">{iconName}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{a.platform}</h4>
                      <p className="text-sm text-gray-400">{a.rank ?? ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Individual Achievements */}
          <div className="p-6 md:p-8 cp-grid-bg relative">
            <h3 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-primary">military_tech</span>
              Individual Achievements
            </h3>
            <div className="space-y-4 relative z-10">
              {individualAchievements.map((a) => {
                const colorKey = a.color ?? 'primary'
                const borderClass = BORDER_COLOR_MAP[colorKey] ?? 'border-l-primary'
                const hoverTitle = HOVER_COLOR_MAP[colorKey] ?? 'group-hover:text-primary'
                const hoverValue = VALUE_HOVER_MAP[colorKey] ?? 'group-hover:text-primary/50'
                return (
                  <div
                    key={a.id}
                    className={`glass-card p-4 rounded-xl border-l-4 ${borderClass} flex justify-between items-center group`}
                  >
                    <div>
                      <h4 className={`font-bold text-white transition-colors ${hoverTitle}`}>{a.platform}</h4>
                      <p className="text-xs text-gray-400 mt-1">{a.rank ?? ''}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-black text-gray-600 transition-colors ${hoverValue}`}>
                        {a.value ?? ''}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
