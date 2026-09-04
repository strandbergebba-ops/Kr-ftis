import { useState } from 'react'
import { useSeatingChart } from './hooks/useSeatingChart'
import { useSongbook } from './hooks/useSongbook'
import { AddPersonModal } from './components/AddPersonModal'
import { KraftskivaDetaljer } from './components/KraftskivaDetaljer'
import { PersonList } from './components/PersonList'
import { SeatingTable } from './components/SeatingTable'
import { Songbook } from './components/Songbook'
import type { Person } from './types'

export default function App() {
  const {
    state,
    addPerson,
    updatePerson,
    removePerson,
    updateEventDetails,
    assignSeat,
    getPersonAtSeat,
    getUnassignedPeople,
  } = useSeatingChart()

  const { songs, addSong, updateSong, removeSong } = useSongbook()

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [editPerson, setEditPerson] = useState<Person | null>(null)
  const [showGuests, setShowGuests] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showSongbook, setShowSongbook] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <header className="px-6 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="text-xl leading-none">🦞</span>
            <div>
              <h1 className="text-base font-semibold text-white uppercase tracking-wide leading-none">
                Kräftskiva
              </h1>
              <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mt-1">
                Placeringskarta
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="px-3 py-2 rounded-md border border-border text-sm font-normal uppercase tracking-wide text-neutral-300 hover:border-neutral-600 hover:text-white transition-colors"
            >
              Detaljer
            </button>
            <button
              type="button"
              onClick={() => setShowGuests(true)}
              className="px-3 py-2 rounded-md border border-border text-sm font-normal uppercase tracking-wide text-neutral-300 hover:border-neutral-600 hover:text-white transition-colors"
            >
              Gäster
              <span className="ml-1.5 font-mono text-xs normal-case text-neutral-500">{state.people.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSongbook(true)}
              className="px-3 py-2 rounded-md bg-crayfish text-white text-sm font-normal uppercase tracking-wide hover:bg-crayfish-dark transition-colors"
            >
              Snapshäfte
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col">
        <SeatingTable
          table={state.table}
          getPersonAtSeat={getPersonAtSeat}
          onAssignSeat={assignSeat}
          selectedPersonId={selectedPersonId}
          onSelectPerson={setSelectedPersonId}
        />
      </main>

      {showDetails && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div className="w-full max-w-md h-[75vh]" onClick={(e) => e.stopPropagation()}>
            <KraftskivaDetaljer details={state.eventDetails} onUpdate={updateEventDetails} />
          </div>
        </div>
      )}

      {showGuests && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowGuests(false)}
        >
          <div className="w-full max-w-md h-[75vh]" onClick={(e) => e.stopPropagation()}>
            <PersonList
              people={state.people}
              unassigned={getUnassignedPeople()}
              selectedPersonId={selectedPersonId}
              onSelectPerson={(id) => {
                setSelectedPersonId(id)
                if (id) setShowGuests(false)
              }}
              onAddPerson={() => {
                setEditPerson(null)
                setShowAddPerson(true)
              }}
              onEditPerson={(person) => {
                setEditPerson(person)
                setShowAddPerson(true)
              }}
              onRemovePerson={removePerson}
            />
          </div>
        </div>
      )}

      <Songbook
        open={showSongbook}
        onClose={() => setShowSongbook(false)}
        songs={songs}
        onAddSong={addSong}
        onUpdateSong={updateSong}
        onRemoveSong={removeSong}
      />

      <AddPersonModal
        open={showAddPerson}
        onClose={() => {
          setShowAddPerson(false)
          setEditPerson(null)
        }}
        onAdd={addPerson}
        editPerson={editPerson}
        onUpdate={(id, name, photoUrl) => updatePerson(id, { name, photoUrl })}
      />
    </div>
  )
}
