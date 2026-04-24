'use client'
import { useState } from 'react'

interface ChipsInputProps {
  label: string
  value: string[]
  onChange: (val: string[]) => void
  placeholder?: string
}

export default function ChipsInput({ label, value, onChange, placeholder = 'Add...' }: ChipsInputProps) {
  const [draft, setDraft] = useState('')

  function add() {
    const v = draft.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setDraft('')
  }

  return (
    <div className="field-group">
      <div className="field-label">{label}</div>
      <div className="chips-wrap">
        {value.map((chip) => (
          <span key={chip} className="chip-tag">
            {chip}
            <button onClick={() => onChange(value.filter((c) => c !== chip))} aria-label={`Remove ${chip}`}>×</button>
          </span>
        ))}
        <input
          className="field-input"
          style={{ width: 140, flex: 'none' }}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        />
      </div>
    </div>
  )
}
