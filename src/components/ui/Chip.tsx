interface ChipProps {
  children: React.ReactNode
  dot?: boolean
}

export default function Chip({ children, dot }: ChipProps) {
  return (
    <span className="chip">
      {dot && <span className="dot" />}
      {children}
    </span>
  )
}
