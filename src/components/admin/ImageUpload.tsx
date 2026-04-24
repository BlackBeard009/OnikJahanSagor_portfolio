'use client'
import { useRef, useState } from 'react'

interface ImageUploadProps {
  label: string
  currentUrl: string
  bucket: 'avatars' | 'resumes' | 'project-images'
  onUploaded: (url: string) => void
  accept?: string
}

export default function ImageUpload({ label, currentUrl, bucket, onUploaded, accept = 'image/*' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(`/api/admin/upload?bucket=${bucket}`, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      onUploaded(json.url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="field-group">
      <div className="field-label">{label}</div>
      {currentUrl && (
        <img src={currentUrl} alt="Current" className="upload-preview" style={{ marginBottom: 8 }} />
      )}
      <div
        className="upload-zone"
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Uploading…' : 'Click to upload'}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>
      {error && <div className="admin-error">{error}</div>}
    </div>
  )
}
