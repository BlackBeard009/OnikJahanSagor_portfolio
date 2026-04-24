import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div className="admin-shell" data-theme="dark">
      <AdminNav email={session.user?.email ?? ''} />
      <main className="admin-content">{children}</main>
    </div>
  )
}
