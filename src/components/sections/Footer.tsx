import { About } from '@/types'
import { LinkedInIcon, GitHubIcon, CodeforcesIcon } from '@/components/icons/SocialIcons'

interface FooterProps {
  about: About | null
}

export function Footer({ about }: FooterProps) {
  const socialLinks = about?.social_links ?? {}
  const email = socialLinks.email ?? ''

  return (
    <footer className="bg-surface-darker border-t border-[#224249]" id="contact">
      <div className="max-w-[1100px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Left */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">Let&apos;s Connect</h3>
            <p className="text-gray-400 max-w-md">
              Open to new opportunities and interesting projects. Feel free to reach out if you&apos;d like to collaborate.
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center md:items-end gap-4">
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-white hover:text-primary transition-colors text-lg font-medium"
              >
                <span className="material-symbols-outlined">mail</span>
                {email}
              </a>
            )}
            <div className="flex gap-4">
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300"
                >
                  <LinkedInIcon />
                </a>
              )}
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300"
                >
                  <GitHubIcon />
                </a>
              )}
              {socialLinks.codeforces && (
                <a
                  href={socialLinks.codeforces}
                  aria-label="Codeforces"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300"
                >
                  <CodeforcesIcon />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#224249] flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2026 Onik Jahan Sagor. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">location_on</span>
              Bangladesh
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">schedule</span>
              UTC+6
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
