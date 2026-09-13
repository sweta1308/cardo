interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  title?: string
}

const SIZES = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
}

const TINTS = [
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
]

const tintFor = (name: string) => {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0)
  return TINTS[sum % TINTS.length]
}

const Avatar = ({ name, size = 'md', title }: AvatarProps) => (
  <span
    title={title ?? name}
    className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${SIZES[size]} ${tintFor(name)}`}
  >
    {name.charAt(0).toUpperCase()}
  </span>
)

export const AvatarGroup = ({ names, max = 4, size = 'md' }: { names: string[]; max?: number; size?: AvatarProps['size'] }) => (
  <div className="flex -space-x-2">
    {names.slice(0, max).map((name, index) => (
      <span key={`${name}-${index}`} className="rounded-full ring-2 ring-white">
        <Avatar name={name} size={size} />
      </span>
    ))}
    {names.length > max && (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600 ring-2 ring-white ${SIZES[size ?? 'md']}`}
      >
        +{names.length - max}
      </span>
    )}
  </div>
)

export default Avatar
