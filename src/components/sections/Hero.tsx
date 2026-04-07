'use client'
import { ReactNode } from 'react'
import { About } from '@/types'

interface HeroProps {
  about: About | null
}

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const CodeforcesIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5V19.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V4.5C9 3.672 9.672 3 10.5 3h3zm9 7.5c.828 0 1.5.672 1.5 1.5v9c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-9c0-.828.672-1.5 1.5-1.5h3z" />
  </svg>
)

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

function SocialIconButton({ href, label, icon, svgIcon }: { href: string; label: string; icon?: string; svgIcon?: ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300"
    >
      {svgIcon ?? <span className="material-symbols-outlined text-xl">{icon}</span>}
    </a>
  )
}

export function Hero({ about }: HeroProps) {
  const socialLinks = about?.social_links ?? {}

  return (
    <section
      id="about"
      className="flex flex-col-reverse md:flex-row items-center gap-10 py-10 md:py-16 relative"
    >
      {/* Desktop social icons — top right */}
      <div className="absolute top-0 right-0 hidden md:flex gap-4">
        {socialLinks.linkedin && (
          <SocialIconButton href={socialLinks.linkedin} label="LinkedIn" svgIcon={<LinkedInIcon />} />
        )}
        {socialLinks.github && (
          <SocialIconButton href={socialLinks.github} label="GitHub" svgIcon={<GitHubIcon />} />
        )}
        {socialLinks.codeforces && (
          <SocialIconButton href={socialLinks.codeforces} label="Codeforces" svgIcon={<CodeforcesIcon />} />
        )}
      </div>

      {/* Left: text content */}
      <div className="flex-1 flex flex-col gap-6 text-center md:text-left pt-12 md:pt-0">
        <div className="flex flex-col gap-3">
          {/* Name badge */}
          <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
            <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <span className="material-symbols-outlined text-2xl">code</span>
            </div>
            <h2 className="text-white text-2xl font-bold tracking-tight">Onik Jahan Sagor</h2>
          </div>

          {/* Open to Work pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 self-center md:self-start w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-primary text-xs font-bold uppercase tracking-wide">Open to Work</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
            Software Engineer &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-200">
              Competitive Programmer
            </span>
          </h1>

          {/* Bio */}
          <p className="text-gray-400 text-base md:text-lg max-w-[600px] mx-auto md:mx-0 leading-relaxed">
            {about?.bio ?? 'Passionate about algorithms, distributed systems, and building scalable web applications.'}
          </p>
        </div>

        {/* Mobile social icons */}
        <div className="flex md:hidden gap-4 justify-center mb-2">
          {socialLinks.linkedin && (
            <SocialIconButton href={socialLinks.linkedin} label="LinkedIn" svgIcon={<LinkedInIcon />} />
          )}
          {socialLinks.github && (
            <SocialIconButton href={socialLinks.github} label="GitHub" svgIcon={<GitHubIcon />} />
          )}
          {socialLinks.codeforces && (
            <SocialIconButton href={socialLinks.codeforces} label="Codeforces" svgIcon={<CodeforcesIcon />} />
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="h-12 px-6 bg-primary hover:bg-primary-dark text-[#102023] rounded-lg font-bold text-base transition-all shadow-glow hover:-translate-y-[2px]"
          >
            View Work
          </button>
          {about?.resume_url ? (
            <a
              href={about.resume_url}
              download
              className="h-12 px-6 bg-transparent border border-gray-600 hover:border-primary text-gray-300 hover:text-white rounded-lg font-bold text-base transition-all hover:bg-primary/5 flex items-center"
            >
              Download CV
            </a>
          ) : (
            <button className="h-12 px-6 bg-transparent border border-gray-600 hover:border-primary text-gray-300 hover:text-white rounded-lg font-bold text-base transition-all hover:bg-primary/5">
              Download CV
            </button>
          )}
        </div>
      </div>

      {/* Right: avatar */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl"></div>
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/30 shadow-2xl">
          {about?.avatar_url ? (
            <img
              src={about.avatar_url}
              alt="Onik Jahan Sagor"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-surface-dark flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-primary/40">person</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
