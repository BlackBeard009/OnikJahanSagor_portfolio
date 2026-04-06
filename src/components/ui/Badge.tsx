import { twMerge } from 'tailwind-merge'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'cyan' | 'gray' | 'green' | 'red'
  className?: string
}

const variants = {
  cyan: 'bg-cyan/10 text-cyan border-cyan/20',
  gray: 'bg-white/5 text-gray-300 border-white/10',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
