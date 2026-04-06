import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-white text-lg hover:text-cyan transition-colors">
            AlexDev
          </Link>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>
      <main className="pt-16">{children}</main>
      <footer className="border-t border-dark-border py-8 text-center text-gray-500 text-sm">
        <p>Built with Next.js · Designed with love</p>
      </footer>
    </div>
  )
}
