import { Github, Linkedin, Twitter, Mail, Download, ArrowRight, Trophy } from 'lucide-react'
import type { Profile } from '@/types'

export default function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="container" id="contact">
      <div className="footer-grid">

        {/* Big CTA */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 20 }}>§ 07 — Ping</div>
          <div className="footer-big">
            Have something{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--ink-3)' }}>
              interesting
            </span>{' '}
            to build?
            {profile.email && (
              <div style={{ marginTop: 10 }}>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </div>
            )}
          </div>
        </div>

        {/* Elsewhere */}
        <div className="footer-links">
          <div className="h">Elsewhere</div>
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noreferrer">
              <Github size={14} />
              <span>GitHub</span>
              <span className="arr">/ @{profile.handle}</span>
            </a>
          )}
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              <Linkedin size={14} />
              <span>LinkedIn</span>
              <span className="arr">/ in/{profile.handle}</span>
            </a>
          )}
          {profile.twitter && (
            <a href={profile.twitter} target="_blank" rel="noreferrer">
              <Twitter size={14} />
              <span>Twitter</span>
              <span className="arr">/ @{profile.handle}</span>
            </a>
          )}
          {profile.email && (
            <a href={`mailto:${profile.email}`}>
              <Mail size={14} />
              <span>Email</span>
              <span className="arr">/ direct</span>
            </a>
          )}
        </div>

        {/* Artifacts */}
        <div className="footer-links">
          <div className="h">Artifacts</div>
          {profile.resume_url && (
            <a href={profile.resume_url} target="_blank" rel="noreferrer">
              <Download size={14} />
              <span>Résumé</span>
              <span className="arr">/ PDF</span>
            </a>
          )}
          <a href="#writing">
            <ArrowRight size={14} />
            <span>Blog archive</span>
          </a>
          {profile.github && (
            <a href={`${profile.github}?tab=repositories`} target="_blank" rel="noreferrer">
              <ArrowRight size={14} />
              <span>All repos</span>
            </a>
          )}
          <a href="#competitive">
            <Trophy size={14} />
            <span>Contest log</span>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} {profile.name} · built with Next.js</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>uptime · 99.9%</span>
        </div>
      </div>
    </footer>
  )
}
