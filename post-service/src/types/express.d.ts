import 'express'
import type Redis from 'ioredis'

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string
    }
    redisClient: Redis
  }
}
