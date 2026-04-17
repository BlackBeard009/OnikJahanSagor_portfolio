import React from 'react'
import { Experience as ExperienceType } from '@/types'

interface ExperienceProps {
  experience: ExperienceType[]
}

function formatDate(date: string | null): string {
  if (!date) return 'Present'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

const TIMELINE_ICONS = ['work', 'code', 'school', 'build', 'rocket_launch']

export function Experience({ experience }: ExperienceProps) {
  return (
    <div className="flex flex-col">
      <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">history_edu</span>
        Career Timeline
      </h3>

      <div className="grid grid-cols-[40px_1fr] gap-x-4">
        {experience.map((exp, index) => {
          const isFirst = index === 0
          const isLast = index === experience.length - 1
          const iconName = TIMELINE_ICONS[index % TIMELINE_ICONS.length]

          return (
            <React.Fragment key={exp.id}>
              {/* Timeline spine */}
              <div className="flex flex-col items-center">
                <div
                  className={`size-10 rounded-full bg-[#16282c] flex items-center justify-center z-10 ${
                    isFirst
                      ? 'border border-primary text-primary shadow-glow'
                      : 'border border-[#315f68] text-gray-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{iconName}</span>
                </div>
                {!isLast && (
                  <div
                    className={`w-[2px] grow ${
                      isFirst
                        ? 'bg-gradient-to-b from-primary to-[#224249] timeline-line'
                        : 'bg-[#224249]'
                    }`}
                  ></div>
                )}
              </div>

              {/* Content */}
              <div className={isLast ? 'pt-2' : 'pb-10 pt-2'}>
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                  <h4 className="text-xl font-bold text-white">{exp.role}</h4>
                  {isFirst ? (
                    <span className="text-primary text-sm font-mono bg-primary/10 px-2 py-1 rounded">
                      {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm font-mono">
                      {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                    </span>
                  )}
                </div>
                <p className="text-gray-300 font-medium mb-2">{exp.company}</p>
                {exp.description && (
                  <p className="text-gray-400 text-sm leading-relaxed">{exp.description}</p>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {exp.achievements.map((ach, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="material-symbols-outlined text-primary text-base leading-none shrink-0 -mt-[1px]">arrow_right</span>
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
