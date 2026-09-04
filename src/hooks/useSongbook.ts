import { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Song } from '../types'

const STORAGE_KEY = 'kraftskiva-songbook-v1'

function loadSongs(): Song[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Song[]
  } catch {
    /* ignore */
  }
  return []
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
