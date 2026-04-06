'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Experience } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  start_date: z.string().min(1),
  end_date: z.string().optional(),
  description: z.string().optional(),
  achievements: z.string(),
  logo_url: z.string().optional(),
  order: z.number().optional(),
})

type FormData = z.infer<typeof schema>

interface ExperienceFormProps {
  initial?: Partial<Experience>
  onSubmit: (data: Partial<Experience>) => Promise<void>
  onCancel: () => void
}

export function ExperienceForm({ initial, onSubmit, onCancel }: ExperienceFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: initial?.company ?? '',
      role: initial?.role ?? '',
      start_date: initial?.start_date ?? '',
      end_date: initial?.end_date ?? '',
      description: initial?.description ?? '',
      achievements: initial?.achievements?.join('\n') ?? '',
      logo_url: initial?.logo_url ?? '',
      order: initial?.order ?? 0,
    },
  })

  async function submit(data: FormData) {
    await onSubmit({
      ...data,
      end_date: data.end_date || null,
      achievements: data.achievements.split('\n').map((s) => s.trim()).filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Company" error={errors.company?.message} {...register('company')} />
        <Input label="Role" error={errors.role?.message} {...register('role')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Date" type="date" error={errors.start_date?.message} {...register('start_date')} />
        <Input label="End Date (leave blank for Present)" type="date" {...register('end_date')} />
      </div>
      <Input label="Description" {...register('description')} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-300 font-medium">Achievements (one per line)</label>
        <textarea {...register('achievements')} rows={4} className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/50 text-sm resize-none" />
      </div>
      <div className="flex gap-3 justify-end mt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
