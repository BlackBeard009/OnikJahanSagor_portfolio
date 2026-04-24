import Nav from '@/components/sections/Nav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="grid-bg" />
      <div className="page">
        <Nav />
        {children}
      </div>
    </>
  )
}
