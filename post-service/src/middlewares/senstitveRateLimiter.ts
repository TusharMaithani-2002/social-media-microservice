import { RateLimiterRedis } from 'rate-limiter-flexible'
import { redisClient } from '../utils/redis'
import type { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'

const sensitiveLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'sensitive',
  points: 50,
  duration: 15 * 60,
})

const sensitiveMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await sensitiveLimiter.consume(req.ip!)
    next()
  } catch (err: any) {
    if (err?.msBeforeNext) {
      res.set('Retry-After', Math.ceil(err.msBeforeNext / 1000).toString())
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
      return res.status(429).json({
        success: false,
        message: 'Too many requests',
      })
    }

    logger.error('Rate limiter infrastructure error')
    return next() // fail open
  }
}

export { sensitiveMiddleware }
