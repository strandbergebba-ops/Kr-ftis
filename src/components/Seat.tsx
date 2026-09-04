import type { Person } from '../types'
import { PersonAvatar } from './PersonAvatar'

interface SeatProps {
  person: Person | null
  seatIndex: number
  x: number
  y: number
  zoom: number
  selectedPersonId: string | null
  onSeatClick: (seatIndex: number) => void
}

export function Seat({
  person,
  seatIndex,
  x,
  y,
  zoom,
  selectedPersonId,
  onSeatClick,
}: SeatProps) {
  const size = zoom >= 1.5 ? 'xl' : zoom >= 1 ? 'lg' : 'md'

  return (
    <div
      className="absolute flex flex-col items-center gap-1.5"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {person ? (
        <PersonAvatar
          name={person.name}
          photoUrl={person.photoUrl}
          size={size}
          onClick={() => onSeatClick(seatIndex)}
        />
      ) : (
        <button
          type="button"
          onClick={() => onSeatClick(seatIndex)}
          className={`
            rounded-full border border-dashed flex items-center justify-center
            transition-colors hover:border-crayfish hover:bg-crayfish/5
            ${selectedPersonId ? 'border-crayfish bg-crayfish/10' : 'border-neutral-700 bg-surface'}
            ${size === 'xl' ? 'w-28 h-28' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14'}
          `}
        >
          <span className="text-neutral-600 text-lg">+</span>
        </button>
      )}
      {person && (
        <span
          className={`font-medium text-neutral-300 whitespace-nowrap ${zoom >= 1 ? 'text-sm' : 'text-xs'}`}
        >
          {person.name}
        </span>
      )}
    </div>
  )
}
