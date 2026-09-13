import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
}

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md') =>
  `${BASE} ${VARIANTS[variant]} ${SIZES[size]} cursor-pointer`

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) => (
  <button className={`${buttonClass(variant, size)} ${className}`} {...props}>
    {children}
  </button>
)

export const ButtonLink = ({
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: {
  to: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}) => (
  <Link to={to} className={`${buttonClass(variant, size)} ${className}`}>
    {children}
  </Link>
)

export default Button
