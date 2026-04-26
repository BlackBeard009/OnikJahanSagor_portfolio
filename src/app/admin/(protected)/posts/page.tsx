import { getAllPosts } from '@/lib/db/posts'
import PostsPanel from '@/components/admin/PostsPanel'

export default async function AdminPostsPage() {
  const posts = await getAllPosts()
  return <PostsPanel initial={posts} />
}
