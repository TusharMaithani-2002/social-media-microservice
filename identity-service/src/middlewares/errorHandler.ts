import type { ErrorRequestHandler } from 'express'
import { logger } from '../utils/logger'

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(err.stack)

  res.status(err.status || 500).json({
    message: err.message || 'Intervnal server error',
  })
}

export { errorHandler }
