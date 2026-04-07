'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Project } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  tech_stack: z.string(),
  highlights: z.string(),
  github_url: z.string().optional(),
  live_url: z.string().optional(),
  featured: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface ProjectFormProps {
  initial?: Partial<Project>
  onSubmit: (data: Partial<Project>) => Promise<void>
  onCancel: () => void
}

export function ProjectForm({ initial, onSubmit, onCancel }: ProjectFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
      tech_stack: initial?.tech_stack?.join(', ') ?? '',
      highlights: initial?.highlights?.join('\n') ?? '',
      github_url: initial?.github_url ?? '',
      live_url: initial?.live_url ?? '',
      featured: initial?.featured ?? false,
    },
  })

  async function submit(data: FormData) {
    await onSubmit({
      ...data,
      tech_stack: data.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
      highlights: data.highlights.split('\n').map((s) => s.trim()).filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <Input label="Slug" error={errors.slug?.message} {...register('slug')} />
      </div>
      <Input label="Description" {...register('description')} />
      <Input label="Tech Stack (comma-separated)" placeholder="React, TypeScript, Node.js" {...register('tech_stack')} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-300 font-medium">Highlights (one per line)</label>
        <textarea
          {...register('highlights')}
          rows={4}
          placeholder="Built with React and TypeScript&#10;Deployed on Vercel with CI/CD"
          className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/50 text-sm resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="GitHub URL" {...register('github_url')} />
        <Input label="Live URL" {...register('live_url')} />
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="featured" {...register('featured')} className="accent-cyan" />
        <label htmlFor="featured" className="text-sm text-gray-300">Featured on homepage</label>
      </div>
      <div className="flex gap-3 justify-end mt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
