import type { RequestHandler } from 'express'
import { logger } from '../utils/logger'

const authenticateRequest: RequestHandler = (req, res, next) => {
  const userId = req.headers['x-user-id'] as string

  if (!userId) {
    logger.warn(`Access attempted without user ID`)
    return res.status(401).json({
      success: false,
      message: 'Authentication required! Please login to continue',
    })
  }

  req.user = { userId }
  next()
}

export { authenticateRequest }
