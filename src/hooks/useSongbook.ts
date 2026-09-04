import { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Song } from '../types'

const STORAGE_KEY = 'kraftskiva-songbook-v1'
const API_URL = '/api/songs'
const POLL_INTERVAL_MS = 4000

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

function loadCachedSongs(): Song[] {
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

function cacheSongs(songs: Song[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs))
  } catch {
    /* ignore */
  }
}

export function useSongbook() {
  const [songs, setSongs] = useState<Song[]>(loadCachedSongs)

  const persist = useCallback((next: Song[]) => {
    cacheSongs(next)
    fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    }).catch(() => {
      /* offline or store not connected yet — local cache still has it */
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch(API_URL)
        if (!res.ok) return
        const data = (await res.json()) as Song[]
        if (!cancelled) {
          setSongs(data)
          cacheSongs(data)
        }
      } catch {
        /* offline or store not connected yet — keep showing cached songs */
      }
    }

    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const mutate = useCallback(
    (updater: (s: Song[]) => Song[]) => {
      setSongs((s) => {
        const next = updater(s)
        persist(next)
        return next
      })
    },
    [persist],
  )

  const addSong = useCallback(
    (title: string, lyrics: string) => {
      const song: Song = { id: uuidv4(), title, lyrics }
      mutate((s) => [...s, song])
      return song
    },
    [mutate],
  )

  const updateSong = useCallback(
    (id: string, updates: Partial<Pick<Song, 'title' | 'lyrics'>>) => {
      mutate((s) => s.map((song) => (song.id === id ? { ...song, ...updates } : song)))
    },
    [mutate],
  )

  const removeSong = useCallback(
    (id: string) => {
      mutate((s) => s.filter((song) => song.id !== id))
    },
    [mutate],
  )

  return { songs, addSong, updateSong, removeSong }
}
