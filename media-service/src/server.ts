import { configDotenv } from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { router as mediaRoutes } from './routes/media-routes'
import { logger } from './utils/logger'
import { errorHandler } from './middlewares/errorHandler'
import mongoose from 'mongoose'
import { connectToRabbitMQ, consumeEvent } from './utils/rabbitmq'
import { handlePostDeleted } from './eventHandlers/mediaEventHandler'

configDotenv()

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    logger.info('Connected to mongodb')
  })
  .catch((error) => {
    logger.info('Mongo connection error', error)
  })

const app = express()
const PORT = process.env.PORT || 3004

app.use(cors())
app.use(helmet())
app.use(express.json())

// restrict user from uploading (rate-limitting)

app.use('/api/media', mediaRoutes)
app.use(errorHandler)

async function startServer() {
  try {
    await connectToRabbitMQ()

    // consume all the event

    await consumeEvent('post.deleted', handlePostDeleted)

    app.listen(PORT, () => {
      logger.info(`Media service running on PORT: ${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to connect to the server', error)
    process.exit(1)
  }
}

startServer()

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at', promise, 'reason: ', reason)
})
