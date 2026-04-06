'use client'
import dynamic from 'next/dynamic'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { BlogPost } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((mod) => mod.default), { ssr: false })

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  cover_image: z.string().optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface BlogEditorProps {
  initial?: Partial<BlogPost>
  onSubmit: (data: Partial<BlogPost>) => Promise<void>
  onCancel: () => void
}

export function BlogEditor({ initial, onSubmit, onCancel }: BlogEditorProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      slug: initial?.slug ?? '',
      excerpt: initial?.excerpt ?? '',
      cover_image: initial?.cover_image ?? '',
      content: initial?.content ?? '',
      published: initial?.published ?? false,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" data-color-mode="dark">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <Input label="Slug" error={errors.slug?.message} {...register('slug')} />
      </div>
      <Input label="Excerpt" {...register('excerpt')} />
      <Input label="Cover Image URL" {...register('cover_image')} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-300 font-medium">Content (Markdown)</label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <MDEditor value={field.value} onChange={field.onChange} height={400} />
          )}
        />
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="published" {...register('published')} className="accent-cyan" />
        <label htmlFor="published" className="text-sm text-gray-300">Published</label>
      </div>

      <div className="flex gap-3 justify-end mt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
