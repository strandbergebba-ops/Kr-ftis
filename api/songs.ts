import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'node:crypto'
import { getRedis } from './_store.js'

const KEY = 'kraftskiva:songs'

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

function createDefaultSongs() {
  return defaultSongSeeds.map(({ title, melody }) => ({
    id: randomUUID(),
    title,
    lyrics: melody ? `Melodi: ${melody}\n\n` : '',
  }))
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
    const fresh = createDefaultSongs()
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
