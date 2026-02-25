import type { RequestHandler } from 'express'
import { logger } from '../utils/logger'
import jwt from 'jsonwebtoken'

const validateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader?.split(' ')[1]

  if (!token) {
    logger.warn('Acess attempt without valid token')
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    })
  }

  jwt.verify(token, process.env.JWT_Secret!, (err, user) => {
    if (err) {
      logger.warn('Invalid token!')
      return res.status(429).json({
        success: false,
        message: 'Invalid token!',
      })
    }

    req.user = user
    next()
  })
}

export { validateToken }
