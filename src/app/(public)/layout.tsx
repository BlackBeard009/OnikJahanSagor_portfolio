export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-dark">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-darker/80 backdrop-blur-sm border-b border-[#224249]">
        <div className="max-w-[1100px] mx-auto px-6 py-3 flex items-center justify-end">
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>
      <main className="pt-14">{children}</main>
    </div>
  )
}
