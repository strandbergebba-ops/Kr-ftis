import type { EventDetails } from '../types'

interface KraftskivaDetaljerProps {
  details: EventDetails
  onUpdate: (updates: Partial<EventDetails>) => void
}

const fields: { key: keyof EventDetails; label: string; icon: string }[] = [
  { key: 'date', label: 'Datum', icon: '📅' },
  { key: 'time', label: 'Tid', icon: '🕕' },
  { key: 'location', label: 'Plats', icon: '📍' },
  { key: 'dressCode', label: 'Klädkod', icon: '🎩' },
  { key: 'menu', label: 'Meny', icon: '🦞' },
  { key: 'notes', label: 'Övrigt', icon: '✨' },
]

export function KraftskivaDetaljer({ details, onUpdate }: KraftskivaDetaljerProps) {
  return (
    <div className="bg-surface rounded-lg border border-border p-5 h-full flex flex-col">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-white uppercase tracking-wide">Kräftskiva detaljer</h2>
        <p className="text-xs font-mono uppercase tracking-wider text-neutral-500 mt-1">
          Klicka för att redigera
        </p>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {fields.map(({ key, label, icon }) => (
          <div key={key}>
            <label className="flex items-center gap-1.5 text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
              <span>{icon}</span>
              {label}
            </label>
            <textarea
              value={details[key]}
              onChange={(e) => onUpdate({ [key]: e.target.value })}
              rows={key === 'menu' || key === 'notes' ? 2 : 1}
              className="w-full bg-surface-light border border-border rounded-md px-3 py-2 text-sm text-neutral-200
                placeholder:text-neutral-600 resize-none focus:outline-none focus:ring-1 focus:ring-crayfish/50 focus:border-crayfish/50
                transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
