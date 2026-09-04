import { Redis } from '@upstash/redis'

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

export function getRedis(): Redis {
  if (!url || !token) {
    throw new Error('No Redis/KV store connected to this Vercel project yet.')
  }
  return new Redis({ url, token })
}
