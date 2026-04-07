'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Skill } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  name:     z.string().min(1),
  category: z.string().min(1),
  level:    z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface SkillFormProps {
  initial?: Partial<Skill>
  onSubmit: (data: Skill) => Promise<void>
  onCancel: () => void
}

export function SkillForm({ initial, onSubmit, onCancel }: SkillFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:     initial?.name ?? '',
      category: initial?.category ?? '',
      level:    initial?.level ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <Input label="Name" placeholder="React" error={errors.name?.message} {...register('name')} />
        <Input label="Category" placeholder="Frameworks" error={errors.category?.message} {...register('category')} />
        <Input label="Level (optional)" placeholder="Expert" {...register('level')} />
      </div>
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
