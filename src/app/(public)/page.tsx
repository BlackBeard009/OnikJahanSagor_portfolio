import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Achievements } from '@/components/sections/Achievements'
import { Experience } from '@/components/sections/Experience'
import { Skills } from '@/components/sections/Skills'
import { Projects } from '@/components/sections/Projects'
import { BlogPreview } from '@/components/sections/BlogPreview'
import { Contact } from '@/components/sections/Contact'
import { getAbout } from '@/lib/db/about'
import { getAchievements } from '@/lib/db/achievements'
import { getExperience } from '@/lib/db/experience'
import { getFeaturedProjects } from '@/lib/db/projects'
import { getBlogPosts } from '@/lib/db/blog'

export const revalidate = 60

export default async function HomePage() {
  const [about, achievements, experience, projects, posts] = await Promise.all([
    getAbout().catch(() => null),
    getAchievements().catch(() => []),
    getExperience().catch(() => []),
    getFeaturedProjects().catch(() => []),
    getBlogPosts().catch(() => []),
  ])

  const skills = about?.skills ?? []

  return (
    <>
      <Hero about={about} />
      <About about={about} />
      <Achievements achievements={achievements} />
      <Experience experience={experience} />
      <Skills skills={skills} />
      <Projects projects={projects} />
      <BlogPreview posts={posts} />
      <Contact />
    </>
  )
}
