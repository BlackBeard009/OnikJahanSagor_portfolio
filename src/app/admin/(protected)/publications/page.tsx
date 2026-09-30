import { getPublications } from '@/lib/db/publications'
import PublicationsPanel from '@/components/admin/PublicationsPanel'

export default async function AdminPublicationsPage() {
  const pubs = await getPublications()
  return <PublicationsPanel initial={pubs} />
}
