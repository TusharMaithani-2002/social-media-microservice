import { configDotenv } from 'dotenv'
import mongoose from 'mongoose'
import { logger } from './utils/logger'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { router } from './routes/identity-service'
import { errorHandler } from './middlewares/errorHandler'
import { rateLimitMiddleware } from './middlewares/redisRateLimiter'
import { sensitiveMiddleware } from './middlewares/senstitveRateLimiter'

configDotenv()

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    logger.info('Connected to mongodb')
  })
  .catch((error) => {
    logger.info('Mongo connection error', error)
  })

// middlewares
const app = express()
const PORT = process.env.POST || 3001

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`)
  logger.info(`Received body, ${req.body}`)
  next()
})

app.use(rateLimitMiddleware())

app.use('/api/auth/register', sensitiveMiddleware)

// Routes

app.use('/api/auth', router)

app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Identity service running on PORT: ${PORT}`)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at', promise, 'reason: ', reason)
})
