import { Hero } from '@/components/sections/Hero'
import { Achievements } from '@/components/sections/Achievements'
import { Experience } from '@/components/sections/Experience'
import { Skills } from '@/components/sections/Skills'
import { Projects } from '@/components/sections/Projects'
import { Footer } from '@/components/sections/Footer'
import { getAbout } from '@/lib/db/about'
import { getAchievements } from '@/lib/db/achievements'
import { getExperience } from '@/lib/db/experience'
import { getFeaturedProjects } from '@/lib/db/projects'

export const revalidate = 60

export default async function HomePage() {
  const [about, achievements, experience, projects] = await Promise.all([
    getAbout().catch(() => null),
    getAchievements().catch(() => []),
    getExperience().catch(() => []),
    getFeaturedProjects().catch(() => []),
  ])

  const skills = about?.skills ?? []

  return (
    <>
      <main className="pt-8 pb-12 flex flex-col items-center w-full">
        <div className="max-w-[1100px] w-full px-6 flex flex-col gap-16">
          <Hero about={about} />
          <Achievements achievements={achievements} />
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16" id="experience">
            <div className="lg:col-span-7">
              <Experience experience={experience} />
            </div>
            <div className="lg:col-span-5">
              <Skills skills={skills} />
            </div>
          </section>
          <Projects projects={projects} about={about} />
        </div>
      </main>
      <Footer about={about} />
    </>
  )
}
