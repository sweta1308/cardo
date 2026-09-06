import { useAuthStore } from '../store/authStore'

const UserBadge = () => {
  const user = useAuthStore((state) => state.user)
  const firstName = user?.name.split(' ')[0] ?? 'there'
  const initial = firstName.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white">
        {initial}
      </span>
      <span className="text-sm font-medium text-gray-700">{firstName}</span>
    </div>
  )
}

export default UserBadge
