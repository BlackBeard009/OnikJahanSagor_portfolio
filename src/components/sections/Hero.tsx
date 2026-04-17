'use client'
import { ReactNode } from 'react'
import { About } from '@/types'
import { LinkedInIcon, GitHubIcon, CodeforcesIcon } from '@/components/icons/SocialIcons'

interface HeroProps {
  about: About | null
}

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
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 px-6 bg-transparent border border-gray-600 hover:border-primary text-gray-300 hover:text-white rounded-lg font-bold text-base transition-all hover:bg-primary/5 flex items-center"
            >
              View CV
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
