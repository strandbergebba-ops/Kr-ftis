import { useState } from 'react'
import type { Song } from '../types'

interface SongbookProps {
  open: boolean
  onClose: () => void
  songs: Song[]
  onAddSong: (title: string, lyrics: string) => Song
  onUpdateSong: (id: string, updates: Partial<Pick<Song, 'title' | 'lyrics'>>) => void
  onRemoveSong: (id: string) => void
}

export function Songbook({
  open,
  onClose,
  songs,
  onAddSong,
  onUpdateSong,
  onRemoveSong,
}: SongbookProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (!open) return null

  const selected = songs.find((s) => s.id === selectedId) ?? null

  const handleAdd = () => {
    const song = onAddSong('Ny visa', '')
    setSelectedId(song.id)
  }

  const handleRemove = (id: string) => {
    onRemoveSong(id)
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg border border-border w-full max-w-3xl h-[85vh] sm:h-[80vh] flex flex-col sm:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Table of contents */}
        <div
          className={`${selected ? 'hidden sm:flex' : 'flex'} flex-1 sm:flex-none min-h-0 w-full sm:w-56 sm:shrink-0 border-b sm:border-b-0 sm:border-r border-border flex-col bg-surface-light/30`}
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-white uppercase tracking-wide flex items-center gap-1.5">
              <span>🥃</span> Snapshäfte
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden p-1.5 -m-1.5 rounded-md text-neutral-500 hover:text-white hover:bg-surface-light transition-colors"
              title="Stäng"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {songs.length === 0 ? (
              <p className="text-xs text-neutral-600 text-center py-6 px-2">
                Inga visor ännu. Lägg till den första!
              </p>
            ) : (
              songs.map((song, i) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => setSelectedId(song.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm truncate transition-colors ${
                    selectedId === song.id
                      ? 'bg-crayfish/15 text-crayfish'
                      : 'text-neutral-300 hover:bg-surface-light'
                  }`}
                >
                  <span className="font-mono text-xs text-neutral-600 mr-1.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {song.title || 'Namnlös visa'}
                </button>
              ))
            )}
          </div>
          <div className="p-3 border-t border-border">
            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-2.5 rounded-md bg-crayfish text-white text-sm font-medium uppercase tracking-wide hover:bg-crayfish-dark transition-colors"
            >
              + Ny visa
            </button>
          </div>
        </div>

        {/* Page */}
        <div
          className={`${selected ? 'flex' : 'hidden sm:flex'} flex-1 flex-col min-w-0 min-h-0`}
        >
          <div className="flex items-center justify-between p-3 border-b border-border">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="sm:hidden flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors -m-1.5 p-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Visor
            </button>
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:block ml-auto p-1.5 -m-1.5 rounded-md text-neutral-500 hover:text-white hover:bg-surface-light transition-colors"
              title="Stäng"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {selected ? (
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-[#f5f0e6] text-[#2a2015] flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#2a2015]/40">
                  Visa
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(selected.id)}
                  className="text-[10px] font-mono uppercase tracking-wider text-red-800/60 hover:text-red-800 font-medium shrink-0"
                >
                  Ta bort
                </button>
              </div>
              <input
                value={selected.title}
                onChange={(e) => onUpdateSong(selected.id, { title: e.target.value })}
                placeholder="Visans namn"
                className="text-2xl font-semibold bg-transparent border-b border-[#2a2015]/15 focus:outline-none focus:border-[#2a2015]/50 mb-4 pb-2 w-full"
              />
              <textarea
                value={selected.lyrics}
                onChange={(e) => onUpdateSong(selected.id, { lyrics: e.target.value })}
                placeholder="Skriv texten till visan här..."
                className="flex-1 w-full bg-transparent resize-none focus:outline-none font-serif text-lg leading-relaxed"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm">
              Välj en visa i listan, eller lägg till en ny
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
