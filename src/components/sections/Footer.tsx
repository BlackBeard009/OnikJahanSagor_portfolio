import { Mail, Download, ArrowRight, Trophy } from 'lucide-react'

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
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
              <GithubIcon />
              <span>GitHub</span>
              <span className="arr">/ @{profile.handle}</span>
            </a>
          )}
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              <LinkedinIcon />
              <span>LinkedIn</span>
              <span className="arr">/ in/{profile.handle}</span>
            </a>
          )}
          {profile.twitter && (
            <a href={profile.twitter} target="_blank" rel="noreferrer">
              <TwitterIcon />
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
