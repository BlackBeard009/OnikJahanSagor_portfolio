import { Download } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { getProfile } from '@/lib/db/profile'

export default async function Nav() {
  const profile = await getProfile()
  const initials = profile.name
    ? profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AR'

  return (
    <div className="nav">
      <div className="nav-inner">
        <div className="brand">
          <div className="brand-mark">{initials}</div>
          <div className="brand-name">
            {profile.handle || 'portfolio'}<span className="dim">.dev</span>
          </div>
        </div>

        <nav className="nav-links">
          <a href="/#competitive"><span className="n">01</span>competitive</a>
          <a href="/#skills"><span className="n">02</span>skills</a>
          <a href="/#career"><span className="n">03</span>career</a>
          <a href="/#projects"><span className="n">04</span>projects</a>
          <a href="/#writing"><span className="n">05</span>writing</a>
          <a href="/#certifications"><span className="n">06</span>certifications</a>
          <a href="/#contact"><span className="n">07</span>contact</a>
        </nav>

        <div className="nav-right">
          <ThemeToggle />
          {profile.resume_url && (
            <a
              className="btn"
              href={profile.resume_url}
              target="_blank"
              rel="noreferrer"
            >
              <Download size={12} />
              <span>résumé</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
