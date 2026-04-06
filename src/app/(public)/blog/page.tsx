import Link from 'next/link'
import { getBlogPosts } from '@/lib/db/blog'
import { GlassCard } from '@/components/ui/GlassCard'

export const revalidate = 60

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-white mb-2">Writing</h1>
      <p className="text-gray-400 mb-12">Thoughts on software, algorithms, and life.</p>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <GlassCard hover className="flex flex-col gap-3">
                {post.cover_image && (
                  <img src={post.cover_image} alt={post.title} className="w-full h-48 object-cover rounded-lg" />
                )}
                <h2 className="text-xl font-bold text-white">{post.title}</h2>
                {post.excerpt && <p className="text-gray-400">{post.excerpt}</p>}
                {post.published_at && (
                  <p className="text-gray-500 text-sm">
                    {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
