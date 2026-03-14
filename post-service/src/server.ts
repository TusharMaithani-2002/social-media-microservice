import { configDotenv } from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import { router } from './routes/post-route'
import { errorHandler } from './middlewares/errorHandler'
import { logger } from './utils/logger'
import { redisClient } from './utils/redis'
import { rateLimitMiddleware } from './middlewares/redisRateLimiter'
import { sensitiveMiddleware } from './middlewares/senstitveRateLimiter'
import { connectToRabbitMQ } from './utils/rabbitmq'

configDotenv()

const app = express()
const PORT = process.env.PORT || 3002

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => logger.info('Conntected to mongodb'))
  .catch((e) => logger.error('Mongo connection error'))

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`)
  logger.info(`Received body, ${req.body}`)
  next()
})

app.use(rateLimitMiddleware())

app.use('/api/posts/create-post', sensitiveMiddleware)

app.use(
  '/api/posts/',
  (req, res, next) => {
    req.redisClient = redisClient
    next()
  },
  router,
)

app.use(errorHandler)

async function startServer() {
  try {
    await connectToRabbitMQ()
    app.listen(PORT, () => {
      logger.info(`Identity service running on port ${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start the server', error)
    process.exit(1)
  }
}

startServer()

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at', promise, 'reason:', reason)
})
