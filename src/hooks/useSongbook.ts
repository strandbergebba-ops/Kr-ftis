import { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Song } from '../types'

const STORAGE_KEY = 'kraftskiva-songbook-v1'

const defaultSongSeeds: { title: string; melody: string | null }[] = [
  { title: 'Jag ska festa', melody: 'Bamse' },
  { title: 'Helan går', melody: null },
  { title: 'Liten undulat', melody: null },
  { title: 'Humlorna', melody: 'Karl-Alfred Boy' },
  { title: 'Jag tror på akvavit', melody: 'Jag tror på sommaren' },
  { title: 'Trolldrycken', melody: 'Trollmor' },
  { title: 'Jag hade en gång en snaps', melody: 'Jag hade en gång en båt' },
  { title: 'Hundliv', melody: 'Mors lilla Olle' },
  { title: 'Fyllebjörnarna', melody: 'Bumbibjörnarna' },
  { title: 'Midnattsmagi', melody: 'Midnatt råder' },
]

function createDefaultSongs(): Song[] {
  return defaultSongSeeds.map(({ title, melody }) => ({
    id: uuidv4(),
    title,
    lyrics: melody ? `Melodi: ${melody}\n\n` : '',
  }))
}

function loadSongs(): Song[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Song[]
      return parsed.length > 0 ? parsed : createDefaultSongs()
    }
  } catch {
    /* ignore */
  }
  return createDefaultSongs()
}

export function useSongbook() {
  const [songs, setSongs] = useState<Song[]>(loadSongs)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs))
  }, [songs])

  const addSong = useCallback((title: string, lyrics: string) => {
    const song: Song = { id: uuidv4(), title, lyrics }
    setSongs((s) => [...s, song])
    return song
  }, [])

  const updateSong = useCallback(
    (id: string, updates: Partial<Pick<Song, 'title' | 'lyrics'>>) => {
      setSongs((s) => s.map((song) => (song.id === id ? { ...song, ...updates } : song)))
    },
    [],
  )

  const removeSong = useCallback((id: string) => {
    setSongs((s) => s.filter((song) => song.id !== id))
  }, [])

  return { songs, addSong, updateSong, removeSong }
}
