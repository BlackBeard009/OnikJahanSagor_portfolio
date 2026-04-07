import { Skill } from '@/types'

interface SkillsProps {
  skills: Skill[]
}

const SKILL_COLORS: Record<string, string> = {
  // Languages
  'C++':        'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Python':     'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'JavaScript': 'bg-yellow-300/10 text-yellow-200 border-yellow-300/20',
  'TypeScript': 'bg-blue-400/10 text-blue-300 border-blue-400/20',
  'Java':       'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Go':         'bg-purple-500/10 text-purple-400 border-purple-500/20',
  // Frameworks
  'React':      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Next.js':    'bg-white/5 text-gray-200 border-gray-600',
  'Node.js':    'bg-green-500/10 text-green-400 border-green-500/20',
  'Express':    'bg-red-500/10 text-red-400 border-red-500/20',
  'Tailwind CSS': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'GraphQL':    'bg-pink-500/10 text-pink-400 border-pink-500/20',
  // Tools
  'Docker':     'bg-blue-600/10 text-blue-400 border-blue-600/20',
  'Kubernetes': 'bg-blue-300/10 text-blue-200 border-blue-300/20',
  'AWS':        'bg-orange-600/10 text-orange-400 border-orange-600/20',
  'Git':        'bg-white/5 text-gray-200 border-gray-600',
  'PostgreSQL': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'MongoDB':    'bg-green-600/10 text-green-400 border-green-600/20',
}

const DEFAULT_SKILL_COLOR = 'bg-primary/10 text-primary border-primary/20'

export function Skills({ skills }: SkillsProps) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || 'Other'
    acc[cat] = [...(acc[cat] ?? []), skill]
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-8">
      <h3 className="text-2xl font-bold text-white mb-0 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">build</span>
        Technical Expertise
      </h3>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="bg-[#16282c]/50 border border-[#224249] rounded-xl p-6">
          <h4 className="text-sm uppercase tracking-wider text-gray-400 font-bold mb-4">{category}</h4>
          <div className="flex flex-wrap gap-2">
            {items.map((skill) => {
              const colorClass = SKILL_COLORS[skill.name] ?? DEFAULT_SKILL_COLOR
              return (
                <span
                  key={skill.name}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border ${colorClass}`}
                >
                  {skill.name}
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
