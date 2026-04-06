'use client'
import { About } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface HeroProps {
  about: About | null
}

export function Hero({ about }: HeroProps) {
  return (
    <section id="hero" className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6">
        <Badge variant="cyan" className="text-sm px-4 py-1">
          <span className="w-2 h-2 rounded-full bg-green-400 mr-2 inline-block animate-pulse" />
          Open to Work
        </Badge>

        {about?.avatar_url && (
          <img
            src={about.avatar_url}
            alt="Avatar"
            className="w-28 h-28 rounded-full border-2 border-cyan/30 object-cover"
          />
        )}

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="text-white">Hi, I&apos;m </span>
          <span className="text-gradient">AlexDev</span>
        </h1>

        <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
          Competitive programmer & software engineer specializing in algorithms,
          distributed systems, and scalable web applications.
        </p>

        <div className="flex gap-4 flex-wrap justify-center mt-4">
          <Button size="lg" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
            View Projects
          </Button>
          {about?.resume_url && (
            <Button variant="outline" size="lg" asChild>
              <a href={about.resume_url} download>Download Resume</a>
            </Button>
          )}
        </div>

        {about?.social_links && (
          <div className="flex gap-6 mt-4">
            {about.social_links.github && (
              <a href={about.social_links.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan transition-colors">GitHub</a>
            )}
            {about.social_links.linkedin && (
              <a href={about.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan transition-colors">LinkedIn</a>
            )}
            {about.social_links.twitter && (
              <a href={about.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan transition-colors">Twitter</a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
