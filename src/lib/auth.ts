import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export function isAdminEmail(email: string | undefined | null): boolean {
  return email === process.env.ADMIN_EMAIL
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      return isAdminEmail(user?.email) || isAdminEmail(profile?.email)
    },
    async session({ session }) {
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
})
