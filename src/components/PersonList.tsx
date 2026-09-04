import type { Person } from '../types'
import { PersonAvatar } from './PersonAvatar'

interface PersonListProps {
  people: Person[]
  unassigned: Person[]
  selectedPersonId: string | null
  onSelectPerson: (id: string | null) => void
  onAddPerson: () => void
  onEditPerson: (person: Person) => void
  onRemovePerson: (id: string) => void
}

export function PersonList({
  people,
  unassigned,
  selectedPersonId,
  onSelectPerson,
  onAddPerson,
  onEditPerson,
  onRemovePerson,
}: PersonListProps) {
  return (
    <div className="bg-surface rounded-lg border border-border p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white uppercase tracking-wide">
          Gäster <span className="font-mono normal-case text-neutral-500">({people.length})</span>
        </h3>
        <button
          type="button"
          onClick={onAddPerson}
          className="px-3 py-1.5 rounded-md bg-crayfish text-white text-sm font-medium uppercase tracking-wide hover:bg-crayfish-dark transition-colors"
        >
          + Lägg till
        </button>
      </div>

      {unassigned.length > 0 && (
        <p className="text-xs font-mono uppercase tracking-wide text-crayfish font-medium mb-2">
          {unassigned.length} utan plats — välj gäst, klicka sedan på bordet
        </p>
      )}

      <div className="flex-1 overflow-y-auto space-y-1.5">
        {people.length === 0 ? (
          <p className="text-sm text-neutral-600 text-center py-8">
            Inga gäster ännu. Lägg till med bild!
          </p>
        ) : (
          people.map((person) => {
            const isUnassigned = unassigned.some((p) => p.id === person.id)
            const isSelected = selectedPersonId === person.id

            return (
              <div
                key={person.id}
                className={`
                  flex items-center gap-3 p-2 rounded-md transition-colors
                  ${isSelected ? 'bg-crayfish/10 ring-1 ring-crayfish' : 'hover:bg-surface-light'}
                  ${isUnassigned ? 'border-l-2 border-crayfish' : ''}
                `}
              >
                <PersonAvatar
                  name={person.name}
                  photoUrl={person.photoUrl}
                  size="sm"
                  selected={isSelected}
                  onClick={() => onSelectPerson(isSelected ? null : person.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-200 truncate">{person.name}</p>
                  <p className="text-xs text-neutral-600">
                    {isUnassigned ? 'Ingen plats' : 'Placerad'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onEditPerson(person)}
                    className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-300 hover:bg-surface-light"
                    title="Redigera"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemovePerson(person.id)}
                    className="p-1.5 rounded-md text-neutral-600 hover:text-red-400 hover:bg-red-950/30"
                    title="Ta bort"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
