import type { PublicationStatus } from '@/types'

export const STATUS_LABELS: Record<PublicationStatus, string> = {
  published: 'Published',
  accepted: 'Accepted',
  under_review: 'Under review',
  preprint: 'Preprint',
  in_preparation: 'In preparation',
  thesis: 'Thesis',
}
