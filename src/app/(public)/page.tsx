import { getProfile } from '@/lib/db/profile'
import { getJudges } from '@/lib/db/judges'
import { getContests } from '@/lib/db/contests'
import { getSkills } from '@/lib/db/skills'
import { getCareer } from '@/lib/db/career'
import { getProjects } from '@/lib/db/projects'
import { getPublishedPosts } from '@/lib/db/posts'
import { getCertifications } from '@/lib/db/certifications'

import Hero from '@/components/sections/Hero'
import Competitive from '@/components/sections/Competitive'
import Skills from '@/components/sections/Skills'
import Career from '@/components/sections/Career'
import Projects from '@/components/sections/Projects'
import Writing from '@/components/sections/Writing'
import Certifications from '@/components/sections/Certifications'
import Footer from '@/components/sections/Footer'

export const revalidate = 60

export default async function HomePage() {
  const [profile, judges, contests, skills, career, projects, posts, certs] =
    await Promise.all([
      getProfile(),
      getJudges(),
      getContests(),
      getSkills(),
      getCareer(),
      getProjects(),
      getPublishedPosts(),
      getCertifications(),
    ])

  const teamContests = contests.filter((c) => c.type === 'team')
  const individualContests = contests.filter((c) => c.type === 'individual')

  return (
    <main>
      <Hero profile={profile} />
      <Competitive
        judges={judges}
        teamContests={teamContests}
        individualContests={individualContests}
      />
      <Skills skills={skills} skillsTop={profile.skills_top ?? []} />
      <Career entries={career} />
      <Projects projects={projects} />
      <Writing posts={posts} />
      <Certifications certs={certs} />
      <Footer profile={profile} />
    </main>
  )
}
