import { getCertifications } from '@/lib/db/certifications'
import CertificationsPanel from '@/components/admin/CertificationsPanel'

export default async function AdminCertificationsPage() {
  const certs = await getCertifications()
  return (
    <>
      <h1 className="admin-page-title">Certifications</h1>
      <CertificationsPanel initial={certs} />
    </>
  )
}
