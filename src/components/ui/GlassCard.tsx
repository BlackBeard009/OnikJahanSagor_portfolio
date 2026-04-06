import { twMerge } from 'tailwind-merge'

interface GlassCardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
}

export function GlassCard({ className, children, hover = false }: GlassCardProps) {
  return (
    <div
      className={twMerge(
        'glass rounded-xl p-6',
        hover && 'glass-hover cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
