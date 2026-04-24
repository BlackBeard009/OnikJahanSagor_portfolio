// src/components/sections/Hero.tsx
import { ArrowDown, Mail } from 'lucide-react'

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}
import type { Profile } from '@/types'

export default function Hero({ profile }: { profile: Profile }) {
  return (
    <section className="hero container" id="top">
      <div className="hero-grid">

        {/* Left: text */}
        <div className="hero-head">
          <div className="eyebrow">
            <span className="status-dot" />
            <span>AVAILABLE · {profile.status || 'Open to collaborations'}</span>
            {profile.timezone && (
              <span style={{ color: 'var(--ink-4)', marginLeft: 6 }}>
                · {profile.timezone}
              </span>
            )}
          </div>

          <h1>
            {profile.name || 'Your Name'}.
            <span className="role">
              {profile.title || 'Software Engineer'}{' '}
              <span style={{ color: 'var(--ink-4)' }}>×</span>{' '}
              {profile.title_alt || 'Competitive Programmer'}
            </span>
          </h1>

          <p className="bio">{profile.bio}</p>

          <div className="hero-cta">
            <a className="btn primary" href="#projects">
              <span>View projects</span>
              <ArrowDown size={14} />
            </a>
            {profile.github && (
              <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
                <GithubIcon />
                <span>github</span>
              </a>
            )}
            {profile.email && (
              <a className="btn ghost" href={`mailto:${profile.email}`}>
                <Mail size={14} />
                <span>{profile.email}</span>
              </a>
            )}
          </div>

          <div className="hero-meta">
            <div className="cell">
              <div className="k">Location</div>
              <div className="v">{profile.location || '—'}</div>
            </div>
            <div className="cell">
              <div className="k">Experience</div>
              <div className="v">{profile.years ? `${profile.years}+ years` : '—'}</div>
            </div>
            <div className="cell">
              <div className="k">Handle</div>
              <div className="v mono">@{profile.handle || '—'}</div>
            </div>
          </div>
        </div>

        {/* Right: avatar card */}
        <div className="avatar-card card bracket">
          <span className="br-bl" /><span className="br-br" />
          <span className="crosshair tl" />
          <span className="crosshair tr" />
          <span className="crosshair bl" />
          <span className="crosshair br" />

          <div className="avatar-wrap">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <AvatarPlaceholder />
            )}
          </div>

          <div className="avatar-meta">
            <div className="row">
              <span>◦ identifier</span>
              <span className="v">{profile.handle || 'portfolio'}</span>
            </div>
            <div className="row">
              <span>◦ status</span>
              <span className="v" style={{ color: 'var(--good)' }}>online</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

function AvatarPlaceholder() {
  return (
    <svg viewBox="0 0 320 320" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="var(--line-strong)" />
        </pattern>
        <linearGradient id="face" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.08" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" fill="url(#dots)" />
      <path d="M40 320 Q40 220 160 220 Q280 220 280 320 Z" fill="var(--ink)" />
      <path d="M40 320 Q40 230 160 230 Q280 230 280 320 Z" fill="var(--accent)" opacity="0.08" />
      <rect x="140" y="190" width="40" height="40" fill="var(--ink)" />
      <circle cx="160" cy="140" r="72" fill="url(#face)" stroke="var(--ink)" strokeWidth="1.5" />
      <path d="M96 132 Q100 78 160 70 Q222 78 224 132 Q210 105 160 100 Q112 105 96 132Z" fill="var(--ink)" />
      <circle cx="138" cy="140" r="14" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="182" cy="140" r="14" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="152" y1="140" x2="168" y2="140" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="138" cy="140" r="2" fill="var(--ink)" />
      <circle cx="182" cy="140" r="2" fill="var(--ink)" />
      <path d="M158 152 Q160 160 162 166" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
      <path d="M148 178 Q160 184 172 178" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
      <g stroke="var(--ink)" strokeWidth="1.2" fill="none">
        <path d="M16 16 h10 M16 16 v10" />
        <path d="M304 16 h-10 M304 16 v10" />
        <path d="M16 304 h10 M16 304 v-10" />
        <path d="M304 304 h-10 M304 304 v-10" />
      </g>
      <text x="16" y="312" fontFamily="JetBrains Mono" fontSize="9" fill="var(--ink-3)">PORTRAIT</text>
      <text x="304" y="312" fontFamily="JetBrains Mono" fontSize="9" fill="var(--ink-3)" textAnchor="end">320 × 320</text>
    </svg>
  )
}
