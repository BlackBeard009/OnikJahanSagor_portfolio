import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isAdminRoute = nextUrl.pathname.startsWith('/admin') && nextUrl.pathname !== '/admin/login'
  const isAdminApiRoute = nextUrl.pathname.startsWith('/api/admin')

  if ((isAdminRoute || isAdminApiRoute) && !session) {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
