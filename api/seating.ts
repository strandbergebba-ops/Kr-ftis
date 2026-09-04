import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'node:crypto'
import { getRedis } from './_store.js'

const KEY = 'kraftskiva:seating'

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

function createDefaultState() {
  return {
    people: defaultGuestNames.map((name) => ({ id: randomUUID(), name, photoUrl: null })),
    table: { id: 'table-1', name: 'Långbordet', seatCount: 14 },
    assignments: {},
    eventDetails: {
      date: 'Lördag 16 augusti',
      time: '18:00',
      location: 'Trädgården',
      dressCode: 'Kräftmössa & slyngel',
      menu: 'Kräftor, västerbottenpaj, aioli, ost & bröd, ostkaka',
      notes: 'Snapsvisor tillkommer!',
    },
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let redis
  try {
    redis = getRedis()
  } catch (err) {
    res.status(503).json({ error: (err as Error).message })
    return
  }

  if (req.method === 'GET') {
    const existing = await redis.get(KEY)
    if (existing) {
      res.status(200).json(existing)
      return
    }
    const fresh = createDefaultState()
    await redis.set(KEY, fresh)
    res.status(200).json(fresh)
    return
  }

  if (req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    await redis.set(KEY, body)
    res.status(200).json(body)
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
