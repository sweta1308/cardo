import type { ReactNode } from 'react'

type Tone = 'neutral' | 'brand' | 'amber' | 'sky' | 'rose'

const TONES: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-600',
  brand: 'bg-brand/10 text-brand-dark',
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
  rose: 'bg-rose-100 text-rose-700',
}

const Badge = ({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
    {children}
  </span>
)

export default Badge
