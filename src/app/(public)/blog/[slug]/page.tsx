import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPostBySlug, getPublishedPosts } from '@/lib/db/posts'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts()
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <main>
      <article className="post-reader">
        <div className="post-meta">
          <span style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>{post.tag}</span>
          <span>{post.date_label}</span>
          <span>{post.read_time}</span>
        </div>

        <h1>{post.title}</h1>

        <div className="body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.body}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  )
}
