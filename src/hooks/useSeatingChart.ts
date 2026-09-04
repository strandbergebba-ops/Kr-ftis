import { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { EventDetails, Person, SeatingChartState } from '../types'
import { seatKey } from '../types'

const STORAGE_KEY = 'kraftskiva-seating-chart-v2'
const API_URL = '/api/seating'
const POLL_INTERVAL_MS = 4000

const defaultEventDetails: EventDetails = {
  date: 'Lördag 16 augusti',
  time: '18:00',
  location: 'Trädgården',
  dressCode: 'Kräftmössa & slyngel',
  menu: 'Kräftor, västerbottenpaj, aioli, ost & bröd, ostkaka',
  notes: 'Snapsvisor tillkommer!',
}

const defaultGuestNames = [
  'Ebba S',
  'Lopi',
  'Ebba A',
  'Axel',
  'Anna',
  'Filippa',
  'Henke',
  'Grulle',
  'Hugo',
  'Carl Johan',
  'Sophie',
  'Theo',
  'Alva',
]

function createDefaultGuests(): Person[] {
  return defaultGuestNames.map((name) => ({ id: uuidv4(), name, photoUrl: null }))
}

const defaultState: SeatingChartState = {
  people: createDefaultGuests(),
  table: { id: 'table-1', name: 'Långbordet', seatCount: 14 },
  assignments: {},
  eventDetails: defaultEventDetails,
}

function loadCachedState(): SeatingChartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as SeatingChartState
      return {
        ...parsed,
        people: parsed.people.length > 0 ? parsed.people : createDefaultGuests(),
      }
    }
  } catch {
    /* ignore */
  }
  return defaultState
}

function cacheState(state: SeatingChartState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function useSeatingChart() {
  const [state, setState] = useState<SeatingChartState>(loadCachedState)

  const persist = useCallback((next: SeatingChartState) => {
    cacheState(next)
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
        const data = (await res.json()) as SeatingChartState
        if (!cancelled) {
          setState(data)
          cacheState(data)
        }
      } catch {
        /* offline or store not connected yet — keep showing cached state */
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
    (updater: (s: SeatingChartState) => SeatingChartState) => {
      setState((s) => {
        const next = updater(s)
        persist(next)
        return next
      })
    },
    [persist],
  )

  const addPerson = useCallback(
    (name: string, photoUrl: string | null) => {
      const person: Person = { id: uuidv4(), name, photoUrl }
      mutate((s) => ({ ...s, people: [...s.people, person] }))
      return person
    },
    [mutate],
  )

  const updatePerson = useCallback(
    (id: string, updates: Partial<Pick<Person, 'name' | 'photoUrl'>>) => {
      mutate((s) => ({
        ...s,
        people: s.people.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }))
    },
    [mutate],
  )

  const removePerson = useCallback(
    (id: string) => {
      mutate((s) => ({
        ...s,
        people: s.people.filter((p) => p.id !== id),
        assignments: Object.fromEntries(
          Object.entries(s.assignments).map(([k, v]) => [k, v === id ? null : v]),
        ),
      }))
    },
    [mutate],
  )

  const updateEventDetails = useCallback(
    (updates: Partial<EventDetails>) => {
      mutate((s) => ({
        ...s,
        eventDetails: { ...s.eventDetails, ...updates },
      }))
    },
    [mutate],
  )

  const updateSeatCount = useCallback(
    (seatCount: number) => {
      mutate((s) => ({
        ...s,
        table: { ...s.table, seatCount },
        assignments: Object.fromEntries(
          Object.entries(s.assignments).filter(([k]) => Number(k) < seatCount),
        ),
      }))
    },
    [mutate],
  )

  const assignSeat = useCallback(
    (seatIndex: number, personId: string | null) => {
      const key = seatKey(seatIndex)
      mutate((s) => {
        const assignments = { ...s.assignments }

        if (personId) {
          for (const [k, v] of Object.entries(assignments)) {
            if (v === personId) assignments[k] = null
          }
        }

        assignments[key] = personId
        return { ...s, assignments }
      })
    },
    [mutate],
  )

  const getPersonAtSeat = useCallback(
    (seatIndex: number): Person | null => {
      const personId = state.assignments[seatKey(seatIndex)]
      if (!personId) return null
      return state.people.find((p) => p.id === personId) ?? null
    },
    [state.assignments, state.people],
  )

  const getUnassignedPeople = useCallback((): Person[] => {
    const assigned = new Set(Object.values(state.assignments).filter(Boolean))
    return state.people.filter((p) => !assigned.has(p.id))
  }, [state.assignments, state.people])

  return {
    state,
    addPerson,
    updatePerson,
    removePerson,
    updateEventDetails,
    updateSeatCount,
    assignSeat,
    getPersonAtSeat,
    getUnassignedPeople,
  }
}
