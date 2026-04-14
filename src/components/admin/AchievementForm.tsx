'use client'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Achievement } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const RATING_PLATFORMS = ['Codeforces', 'LeetCode', 'CodeChef', 'AtCoder'] as const
const BADGE_OPTIONS    = ['globe', 'flag', 'leaderboard', 'trophy'] as const
const COLOR_OPTIONS    = ['blue', 'indigo', 'primary', 'purple', 'green', 'yellow', 'orange'] as const

const schema = z.object({
  category:        z.enum(['rating', 'team', 'individual']),
  platform:        z.string().min(1),
  rank:            z.string().optional(),
  // Empty number inputs produce NaN via valueAsNumber when unmounted (e.g.
  // rating/problems_solved fields hidden for team/individual categories).
  // .catch(null) coerces any parse failure (NaN) to null so submission isn't
  // silently blocked without any visible error.
  rating:          z.number().nullable().optional().catch(null),
  problems_solved: z.number().nullable().optional().catch(null),
  badge:           z.string().optional(),
  value:           z.string().optional(),
  color:           z.string().optional(),
  profile_url:     z.string().optional(),
  order:           z.number().optional(),
})

type FormData = z.infer<typeof schema>

interface AchievementFormProps {
  initial?: Partial<Achievement>
  onSubmit: (data: Partial<Achievement>) => Promise<void>
  onCancel: () => void
}

const selectClass =
  'bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan/50 text-sm w-full'

export function AchievementForm({ initial, onSubmit, onCancel }: AchievementFormProps) {
  const { register, handleSubmit, control, formState: { isSubmitting, errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category:        (initial?.category as 'rating' | 'team' | 'individual') ?? 'rating',
      platform:        initial?.platform ?? '',
      rank:            initial?.rank ?? '',
      rating:          initial?.rating ?? undefined,
      problems_solved: initial?.problems_solved ?? undefined,
      badge:           initial?.badge ?? 'globe',
      value:           initial?.value ?? '',
      color:           initial?.color ?? 'primary',
      profile_url:     initial?.profile_url ?? '',
      order:           initial?.order ?? 0,
    },
  })

  const category = useWatch({ control, name: 'category' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-300 font-medium">Category</label>
        <select {...register('category')} className={selectClass}>
          <option value="rating">Rating (Online Judge)</option>
          <option value="team">Team Contest</option>
          <option value="individual">Individual Achievement</option>
        </select>
      </div>

      {/* Platform */}
      {category === 'rating' ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-300 font-medium">Platform</label>
          <select {...register('platform')} className={selectClass}>
            {RATING_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      ) : (
        <Input
          label="Platform"
          placeholder={category === 'team' ? 'ICPC Asia West Regional' : 'Codeforces'}
          error={errors.platform?.message}
          {...register('platform')}
        />
      )}

      {/* Rank / description */}
      <Input
        label="Rank / Description"
        placeholder={
          category === 'rating'     ? 'Expert' :
          category === 'team'       ? 'Top 10, Regionals 2024' :
                                      'Solved 500+ problems'
        }
        error={errors.rank?.message}
        {...register('rank')}
      />

      {/* Rating-only fields */}
      {category === 'rating' && (
        <div className="grid grid-cols-2 gap-4">
          <Input label="Rating" type="number" {...register('rating', { valueAsNumber: true })} />
          <Input label="Problems Solved" type="number" {...register('problems_solved', { valueAsNumber: true })} />
        </div>
      )}

      {/* Team-only fields */}
      {category === 'team' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-300 font-medium">Badge Icon</label>
          <select {...register('badge')} className={selectClass}>
            {BADGE_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      )}

      {/* Individual-only fields */}
      {category === 'individual' && (
        <>
          <Input label="Value (right-side text)" placeholder="Top 5% or 500+" {...register('value')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-300 font-medium">Color</label>
            <select {...register('color')} className={selectClass}>
              {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </>
      )}

      <Input label="Profile URL (optional)" {...register('profile_url')} />
      <Input label="Order" type="number" error={errors.order?.message} {...register('order', { valueAsNumber: true })} />

      <div className="flex gap-3 justify-end mt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
