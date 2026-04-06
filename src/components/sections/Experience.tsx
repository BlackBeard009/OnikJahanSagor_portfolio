import { Experience as ExperienceType } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'

interface ExperienceProps {
  experience: ExperienceType[]
}

function formatDate(date: string | null): string {
  if (!date) return 'Present'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

export function Experience({ experience }: ExperienceProps) {
  if (!experience.length) return null
  return (
    <section id="experience" className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="section-heading">Work Experience</h2>
      <p className="section-subheading">My professional journey</p>

      <div className="relative pl-8 border-l border-dark-border flex flex-col gap-10">
        {experience.map((exp) => (
          <div key={exp.id} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[2.35rem] top-1 w-3 h-3 rounded-full bg-cyan border-2 border-dark-DEFAULT" />
            <GlassCard>
              <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                <div>
                  <h3 className="text-white font-bold text-lg">{exp.role}</h3>
                  <p className="text-cyan text-sm">{exp.company}</p>
                </div>
                <span className="text-gray-500 text-sm">
                  {formatDate(exp.start_date)} – {formatDate(exp.end_date)}
                </span>
              </div>
              {exp.description && <p className="text-gray-300 text-sm leading-relaxed mb-3">{exp.description}</p>}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {exp.achievements.map((a, i) => (
                    <li key={i} className="text-gray-400 text-sm flex gap-2">
                      <span className="text-cyan mt-1">▸</span>
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          </div>
        ))}
      </div>
    </section>
  )
}
