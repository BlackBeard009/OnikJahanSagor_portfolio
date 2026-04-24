import { getAllPosts } from '@/lib/db/posts'
import PostsPanel from '@/components/admin/PostsPanel'

export default async function AdminPostsPage() {
  const posts = await getAllPosts()
  return (
    <>
      <h1 className="admin-page-title">Blog Posts</h1>
      <PostsPanel initial={posts} />
    </>
  )
}
