import { getCertifications } from '@/lib/db/certifications'
import CertificationsPanel from '@/components/admin/CertificationsPanel'

export default async function AdminCertificationsPage() {
  const certs = await getCertifications()
  return <CertificationsPanel initial={certs} />
}
