'use client'
import { useState } from 'react'
import type { Skill } from '@/types'

function groupByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})
}

function SkillPill({ skill }: { skill: Skill }) {
  return (
    <div className="skill-pill">
      <span>{skill.name}</span>
      <span className="lvl">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} className={i < skill.level ? 'on' : ''} />
        ))}
      </span>
    </div>
  )
}

interface SkillsProps {
  skills: Skill[]
  skillsTop: string[]
}

export default function Skills({ skills, skillsTop }: SkillsProps) {
  const grouped = groupByCategory(skills)
  const cats = Object.keys(grouped)
  const [activeCat, setActiveCat] = useState(cats[0] ?? '')

  const marqueeItems = skillsTop.length ? skillsTop : cats.flatMap((c) => grouped[c].map((s) => s.name))
  const doubled = [...marqueeItems, ...marqueeItems]

  return (
    <section className="section container" id="skills">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 02 — Toolbox</div>
          <h2>Key skills</h2>
        </div>
        <div className="idx">
          {skills.length} entries / {cats.length} domains
        </div>
      </div>

      <div className="skills-wrap">
        <div className="skills-cats">
          {cats.map((c) => (
            <button
              key={c}
              className={`skills-cat ${c === activeCat ? 'active' : ''}`}
              onClick={() => setActiveCat(c)}
            >
              {c}
              <span className="n">{String(grouped[c].length).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
        <div className="skills-cloud">
          {(grouped[activeCat] ?? []).map((s) => (
            <SkillPill key={s.id} skill={s} />
          ))}
        </div>
      </div>

      {doubled.length > 0 && (
        <div className="marquee">
          <div className="marquee-track">
            {doubled.map((s, i) => (
              <div className="marquee-item" key={i}>
                <span className="star">✦</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
