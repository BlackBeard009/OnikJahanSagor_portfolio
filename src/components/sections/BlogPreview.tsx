import Link from 'next/link'
import { BlogPost } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'

interface BlogPreviewProps {
  posts: BlogPost[]
}

export function BlogPreview({ posts }: BlogPreviewProps) {
  if (!posts.length) return null
  return (
    <section id="blog" className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="section-heading">Writing</h2>
      <p className="section-subheading">Thoughts and learnings</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {posts.slice(0, 3).map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <GlassCard hover className="h-full flex flex-col gap-3">
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="w-full h-32 object-cover rounded-lg" />
              )}
              <h3 className="text-white font-semibold">{post.title}</h3>
              {post.excerpt && <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>}
              {post.published_at && (
                <p className="text-gray-500 text-xs mt-auto">
                  {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </GlassCard>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link href="/blog">
          <Button variant="outline">View All Posts</Button>
        </Link>
      </div>
    </section>
  )
}
