'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Achievement } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  platform: z.string().min(1),
  rating: z.number().nullable().optional(),
  rank: z.string().optional(),
  problems_solved: z.number().nullable().optional(),
  badge: z.string().optional(),
  profile_url: z.string().optional(),
  category: z.string().optional(),
  order: z.number().optional(),
})

type FormData = z.infer<typeof schema>

interface AchievementFormProps {
  initial?: Partial<Achievement>
  onSubmit: (data: Partial<Achievement>) => Promise<void>
  onCancel: () => void
}

export function AchievementForm({ initial, onSubmit, onCancel }: AchievementFormProps) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      platform: initial?.platform ?? '',
      rating: initial?.rating ?? undefined,
      rank: initial?.rank ?? '',
      problems_solved: initial?.problems_solved ?? undefined,
      badge: initial?.badge ?? '',
      profile_url: initial?.profile_url ?? '',
      category: initial?.category ?? '',
      order: initial?.order ?? 0,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Platform" placeholder="Codeforces" {...register('platform')} />
        <Input label="Category" placeholder="Competitive Programming" {...register('category')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Rating" type="number" {...register('rating', { valueAsNumber: true })} />
        <Input label="Rank" placeholder="Candidate Master" {...register('rank')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Problems Solved" type="number" {...register('problems_solved', { valueAsNumber: true })} />
        <Input label="Badge" placeholder="Master" {...register('badge')} />
      </div>
      <Input label="Profile URL" {...register('profile_url')} />
      <div className="flex gap-3 justify-end mt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
