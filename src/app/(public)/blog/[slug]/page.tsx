import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getBlogPostBySlug, getBlogPosts } from '@/lib/db/blog'
import { GlassCard } from '@/components/ui/GlassCard'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const revalidate = 60

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug)
  if (!post || !post.published) notFound()

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link href="/blog">
        <Button variant="ghost" size="sm" className="mb-8">← Back to Blog</Button>
      </Link>

      <GlassCard>
        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="w-full h-56 object-cover rounded-lg mb-6" />
        )}
        <h1 className="text-3xl font-bold text-white mb-2">{post.title}</h1>
        {post.published_at && (
          <p className="text-gray-500 text-sm mb-8">
            {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        <div className="prose prose-invert prose-cyan max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content ?? ''}</ReactMarkdown>
        </div>
      </GlassCard>
    </div>
  )
}
