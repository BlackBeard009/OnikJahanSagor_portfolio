interface FormFieldProps {
  label: string
  name: string
  value: string
  onChange: (val: string) => void
  type?: 'text' | 'url' | 'email' | 'number' | 'color'
  multiline?: boolean
  placeholder?: string
}

export default function FormField({ label, name, value, onChange, type = 'text', multiline, placeholder }: FormFieldProps) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor={name}>{label}</label>
      {multiline ? (
        <textarea
          id={name}
          className="field-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={name}
          type={type}
          className="field-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}
