interface PersonAvatarProps {
  name: string
  photoUrl: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  selected?: boolean
  onClick?: () => void
}

const sizeClasses = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-14 h-14 text-sm',
  lg: 'w-20 h-20 text-base',
  xl: 'w-28 h-28 text-lg',
}

export function PersonAvatar({
  name,
  photoUrl,
  size = 'md',
  selected,
  onClick,
}: PersonAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center
        font-semibold text-white border transition-colors
        ${selected ? 'border-crayfish ring-2 ring-crayfish/30' : 'border-neutral-700'}
        ${onClick ? 'cursor-pointer hover:border-crayfish/60' : 'cursor-default'}
      `}
      title={name}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-crayfish flex items-center justify-center">
          {initials}
        </div>
      )}
    </button>
  )
}
