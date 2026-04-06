import { Skill } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'

interface SkillsProps {
  skills: Skill[]
}

export function Skills({ skills }: SkillsProps) {
  if (!skills.length) return null

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || 'Other'
    acc[cat] = [...(acc[cat] ?? []), skill]
    return acc
  }, {})

  return (
    <section id="skills" className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="section-heading">Tech Stack</h2>
      <p className="section-subheading">Technologies I work with</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(grouped).map(([category, items]) => (
          <GlassCard key={category}>
            <h3 className="text-white font-semibold mb-4">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((skill) => (
                <Badge key={skill.name} variant="cyan">{skill.name}</Badge>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}
