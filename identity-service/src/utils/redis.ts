import Redis from 'ioredis'

const redisClient = new Redis(process.env.UPSTASH_REDIS_TCP_URL!, { tls: {} })

redisClient.on('connect', () => {
  console.log('Redis connected')
})

redisClient.on('error', (err) => {
  console.error('Redis error:', err)
})

export { redisClient }
