export interface Person {
  id: string
  name: string
  photoUrl: string | null
}

export interface Table {
  id: string
  name: string
  seatCount: number
}

export interface Song {
  id: string
  title: string
  lyrics: string
}

export interface EventDetails {
  date: string
  time: string
  location: string
  dressCode: string
  menu: string
  notes: string
}

export interface SeatingChartState {
  people: Person[]
  table: Table
  assignments: Record<string, string | null>
  eventDetails: EventDetails
}

export function seatKey(seatIndex: number): string {
  return String(seatIndex)
}
