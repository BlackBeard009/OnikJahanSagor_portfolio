'use client'
import { useState } from 'react'
import Sparkline from '@/components/ui/Sparkline'
import type { Judge, Contest } from '@/types'

function JudgeCard({ j }: { j: Judge }) {
  const delta = j.rating - j.max_rating
  return (
    <div className="judge card bracket">
      <span className="br-bl" /><span className="br-br" />
      <div className="judge-head">
        <div>
          <div className="judge-name">{j.name}</div>
          <div className="judge-handle">@{j.handle}</div>
        </div>
        <div className="judge-title" style={{ color: j.title_color }}>{j.title}</div>
      </div>

      <div className="rating-block">
        <div className="rating-peak">
          <div className="peak-eyebrow" style={{ color: j.title_color }}>
            <span className="peak-dot" style={{ background: j.title_color }} />
            peak rating
          </div>
          <div className="judge-rating" style={{ color: j.title_color }}>{j.max_rating}</div>
        </div>
        <div className="rating-current">
          <div className="rc-label">current</div>
          <div className="rc-row">
            <span className="rc-val">{j.rating}</span>
            {delta !== 0 && (
              <span className="rc-delta" style={{ color: delta < 0 ? 'var(--ink-3)' : 'var(--good)' }}>
                {delta > 0 ? '+' : ''}{delta} from peak
              </span>
            )}
            {delta === 0 && (
              <span className="rc-delta" style={{ color: 'var(--good)' }}>at peak</span>
            )}
          </div>
        </div>
      </div>

      <Sparkline data={(j.trend ?? []).map((p) => p.rating)} stroke={j.title_color} />

      <div className="judge-stats">
        <div className="s">Contests<strong>{j.contests_count}</strong></div>
        <div className="s">Solved<strong>{j.problems_count.toLocaleString()}</strong></div>
      </div>
    </div>
  )
}

function ContestRow({ c }: { c: Contest }) {
  const suffix = c.rank === 1 ? 'st' : c.rank === 2 ? 'nd' : c.rank === 3 ? 'rd' : 'th'
  return (
    <div className="contest">
      <div className="rank">
        #{c.rank}<sup>{suffix}</sup>
      </div>
      <div className="detail">
        <div className="title">
          {c.title}
          {c.position && <span className="position">{c.position}</span>}
        </div>
        <div className="sub">{c.sub}</div>
      </div>
      <div className="year">{c.year}</div>
    </div>
  )
}

interface CompetitiveProps {
  judges: Judge[]
  teamContests: Contest[]
  individualContests: Contest[]
}

export default function Competitive({ judges, teamContests, individualContests }: CompetitiveProps) {
  const [tab, setTab] = useState<'team' | 'individual'>('team')
  const contests = tab === 'team' ? teamContests : individualContests

  return (
    <section className="section container" id="competitive">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ 01 — The Sport</div>
          <h2>Competitive programming</h2>
        </div>
        <div className="idx">
          {judges.length} judges · {teamContests.length + individualContests.length} contests
        </div>
      </div>

      <div className="cp-grid">
        <div>
          <div className="label-row" style={{ marginBottom: 16 }}>Online judge ratings</div>
          <div className="judges">
            {judges.map((j) => <JudgeCard key={j.id} j={j} />)}
          </div>
        </div>

        <div>
          <div className="label-row" style={{ marginBottom: 16 }}>Contest achievements</div>
          <div className="cp-tabs">
            <button
              className={`cp-tab ${tab === 'team' ? 'active' : ''}`}
              onClick={() => setTab('team')}
            >
              Team<span className="n">{teamContests.length}</span>
            </button>
            <button
              className={`cp-tab ${tab === 'individual' ? 'active' : ''}`}
              onClick={() => setTab('individual')}
            >
              Individual<span className="n">{individualContests.length}</span>
            </button>
          </div>
          <div className="contests">
            {contests.map((c) => <ContestRow key={c.id} c={c} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
