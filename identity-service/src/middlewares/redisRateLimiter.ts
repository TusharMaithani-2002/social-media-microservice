import { RateLimiterRedis } from 'rate-limiter-flexible'
import { redisClient } from '../utils/redis'
import type { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 10,
  duration: 1, // 10 requests in 1 second
})

const rateLimitMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.ip) return next()

      await rateLimiter.consume(req.ip)
      return next()
    } catch (error: any) {
      if (error?.msBeforeNext) {
        const retryAfter = Math.ceil(error.msBeforeNext / 1000)
        res.set('Retry-After', retryAfter.toString())
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`)

        return res.status(429).json({
          success: false,
          message: 'Too many requests',
        })
      }

      logger.error('Rate limiter infrastructure error', error)

      // fail safe strategy
      return next()
    }
  }
}

export { rateLimitMiddleware }
