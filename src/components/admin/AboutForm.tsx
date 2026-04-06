'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { About } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
  resume_url: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  skills: z.string(),
  education: z.string(),
})

type FormData = z.infer<typeof schema>

interface AboutFormProps {
  initial: About | null
  onSubmit: (data: Partial<About>) => Promise<void>
}

export function AboutForm({ initial, onSubmit }: AboutFormProps) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: initial?.bio ?? '',
      avatar_url: initial?.avatar_url ?? '',
      resume_url: initial?.resume_url ?? '',
      github: initial?.social_links?.github ?? '',
      linkedin: initial?.social_links?.linkedin ?? '',
      twitter: initial?.social_links?.twitter ?? '',
      skills: JSON.stringify(initial?.skills ?? [], null, 2),
      education: JSON.stringify(initial?.education ?? [], null, 2),
    },
  })

  async function submit(data: FormData) {
    let skills = initial?.skills ?? []
    let education = initial?.education ?? []
    try { skills = JSON.parse(data.skills) } catch { /* keep existing */ }
    try { education = JSON.parse(data.education) } catch { /* keep existing */ }

    await onSubmit({
      bio: data.bio,
      avatar_url: data.avatar_url,
      resume_url: data.resume_url,
      social_links: { github: data.github, linkedin: data.linkedin, twitter: data.twitter },
      skills,
      education,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <section>
        <h3 className="text-white font-semibold mb-4">Profile</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-300 font-medium">Bio</label>
            <textarea {...register('bio')} rows={4} className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/50 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Avatar URL" {...register('avatar_url')} />
            <Input label="Resume URL" {...register('resume_url')} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-4">Social Links</h3>
        <div className="grid grid-cols-3 gap-4">
          <Input label="GitHub URL" {...register('github')} />
          <Input label="LinkedIn URL" {...register('linkedin')} />
          <Input label="Twitter URL" {...register('twitter')} />
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">Skills (JSON)</h3>
        <p className="text-gray-500 text-xs mb-2">Format: [{'{'}name: "React", category: "Frameworks", level: "Expert"{'}'}]</p>
        <textarea {...register('skills')} rows={8} className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan/50 resize-y" />
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">Education (JSON)</h3>
        <p className="text-gray-500 text-xs mb-2">Format: [{'{'}degree: "BS CS", institution: "MIT", start_year: 2016, end_year: 2020{'}'}]</p>
        <textarea {...register('education')} rows={6} className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan/50 resize-y" />
      </section>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
