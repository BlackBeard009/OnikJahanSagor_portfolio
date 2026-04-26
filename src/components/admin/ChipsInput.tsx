'use client'
import { useState } from 'react'

interface ChipsInputProps {
  label: string
  value: string[]
  onChange: (val: string[]) => void
  placeholder?: string
}

export default function ChipsInput({ label, value, onChange, placeholder = 'Add and press Enter' }: ChipsInputProps) {
  const [draft, setDraft] = useState('')

  const add = () => {
    const v = draft.trim()
    if (!v) return
    onChange([...value, v])
    setDraft('')
  }

  const remove = (i: number) => onChange(value.filter((_, j) => j !== i))

  return (
    <div className="form-row">
      <label>{label}</label>
      <div className="chips-input">
        {value.map((chip, i) => (
          <span key={i} className="chip">
            {chip}
            <button type="button" onClick={() => remove(i)} aria-label={`Remove ${chip}`}>×</button>
          </span>
        ))}
        <input
          value={draft}
          placeholder={placeholder}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); add() }
            if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1))
          }}
          onBlur={add}
        />
      </div>
    </div>
  )
}
