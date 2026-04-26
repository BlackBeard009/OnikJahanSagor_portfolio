import { getCareer } from '@/lib/db/career'
import CareerPanel from '@/components/admin/CareerPanel'

export default async function AdminCareerPage() {
  const entries = await getCareer()
  return <CareerPanel initial={entries} />
}
