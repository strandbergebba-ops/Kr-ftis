import { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { EventDetails, Person, SeatingChartState } from '../types'
import { seatKey } from '../types'

const STORAGE_KEY = 'kraftskiva-seating-chart-v2'

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

function loadState(): SeatingChartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as SeatingChartState
      return {
        ...parsed,
        people: parsed.people.length > 0 ? parsed.people : createDefaultGuests(),
        table: { ...parsed.table, seatCount: 14, name: 'Långbordet' },
        assignments: Object.fromEntries(
          Object.entries(parsed.assignments).filter(([k]) => Number(k) < 14),
        ),
      }
    }
  } catch {
    /* ignore */
  }
  return defaultState
}

export function useSeatingChart() {
  const [state, setState] = useState<SeatingChartState>(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const addPerson = useCallback((name: string, photoUrl: string | null) => {
    const person: Person = { id: uuidv4(), name, photoUrl }
    setState((s) => ({ ...s, people: [...s.people, person] }))
    return person
  }, [])

  const updatePerson = useCallback(
    (id: string, updates: Partial<Pick<Person, 'name' | 'photoUrl'>>) => {
      setState((s) => ({
        ...s,
        people: s.people.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }))
    },
    [],
  )

  const removePerson = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      people: s.people.filter((p) => p.id !== id),
      assignments: Object.fromEntries(
        Object.entries(s.assignments).map(([k, v]) => [k, v === id ? null : v]),
      ),
    }))
  }, [])

  const updateEventDetails = useCallback((updates: Partial<EventDetails>) => {
    setState((s) => ({
      ...s,
      eventDetails: { ...s.eventDetails, ...updates },
    }))
  }, [])

  const updateSeatCount = useCallback((seatCount: number) => {
    setState((s) => ({
      ...s,
      table: { ...s.table, seatCount },
      assignments: Object.fromEntries(
        Object.entries(s.assignments).filter(([k]) => Number(k) < seatCount),
      ),
    }))
  }, [])

  const assignSeat = useCallback((seatIndex: number, personId: string | null) => {
    const key = seatKey(seatIndex)
    setState((s) => {
      const assignments = { ...s.assignments }

      if (personId) {
        for (const [k, v] of Object.entries(assignments)) {
          if (v === personId) assignments[k] = null
        }
      }

      assignments[key] = personId
      return { ...s, assignments }
    })
  }, [])

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
