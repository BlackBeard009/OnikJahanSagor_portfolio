import { About as AboutType, EducationEntry } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'

interface AboutProps {
  about: AboutType | null
}

function EducationCard({ entry }: { entry: EducationEntry }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-2 h-2 rounded-full bg-cyan mt-2 shrink-0" />
      <div>
        <p className="font-semibold text-white">{entry.degree}</p>
        <p className="text-gray-400 text-sm">{entry.institution}</p>
        <p className="text-gray-500 text-xs">{entry.start_year} – {entry.end_year ?? 'Present'}</p>
      </div>
    </div>
  )
}

export function About({ about }: AboutProps) {
  if (!about) return null
  return (
    <section id="about" className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="section-heading">About Me</h2>
      <p className="section-subheading">Get to know me</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard>
          <p className="text-gray-300 leading-relaxed text-base">{about.bio}</p>
        </GlassCard>

        {about.education && about.education.length > 0 && (
          <GlassCard>
            <h3 className="text-white font-semibold mb-4">Education</h3>
            <div className="flex flex-col gap-4">
              {about.education.map((entry, i) => (
                <EducationCard key={i} entry={entry} />
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </section>
  )
}
