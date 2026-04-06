import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  asChild?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-cyan text-dark-DEFAULT font-semibold hover:bg-cyan-dark',
  outline: 'border border-cyan text-cyan hover:bg-cyan/10',
  ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={twMerge(
        clsx('rounded-lg transition-all duration-200 font-medium inline-flex items-center gap-2', variants[variant], sizes[size], className)
      )}
      {...props}
    >
      {children}
    </button>
  )
}
