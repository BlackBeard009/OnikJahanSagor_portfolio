'use client'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export default function CopyButton({ text, label = 'copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <button type="button" className="btn small ghost" onClick={copy}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      <span>{copied ? 'copied' : label}</span>
    </button>
  )
}
