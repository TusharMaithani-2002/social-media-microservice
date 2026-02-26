import { configDotenv } from 'dotenv'
import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { logger } from './utils/logger'
import { redisClient } from './utils/redis'
import proxy from 'express-http-proxy'
import { errorHandler } from './middlewares/errorHanlder'
import { validateToken } from './middlewares/authMiddleware'

configDotenv()

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(cors())
app.use(express.json())

const ratelimit = rateLimit({
  windowMs: 15 * 60 * 100,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      success: false,
      message: 'Too many requests',
    })
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
})

app.use(ratelimit)
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`)
  logger.info(`Received body, ${req.body}`)
  next()
})

const proxyOptions = {
  proxyReqPathResolver: (req: Request) => {
    return req.originalUrl.replace(/^\/v1/, '/api')
  },
  proxyErrorHandler: (error: Error, res: Response, next: NextFunction) => {
    logger.error(`Proxy error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: `Internal sever error`,
      error: error.message,
    })
  },
}

// setting up proxy for our indentity service

app.use(
  '/v1/auth',
  proxy(process.env.IDENTITY_SERVICE_URL!, {
    ...proxyOptions,
     proxyReqBodyDecorator: (body) => {
      return body
    },
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
      proxyReqOpts.headers['Content-Type'] = 'application/json'
      return proxyReqOpts
    },
    userResDecorator(proxyRes, proxyResData, userReq, userRes) {
      logger.info(
        `Response received from indentity service : ${proxyRes.statusCode}`,
      )
      return proxyResData
    },
  }),
)

// setting up procy for our post service
app.use(
  '/v1/posts',
  validateToken,
  proxy(process.env.POST_SERVICE_URL!, {
    ...proxyOptions,
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
      proxyReqOpts.headers['Content-Type'] = 'application/json'
      proxyReqOpts.headers['x-user-id'] = srcReq.user?.userId

      return proxyReqOpts
    },
    userResDecorator(proxyRes, proxyResData, userReq, userRes) {
      logger.info(
        `Response received from post service : ${proxyRes.statusCode}`,
      )
      return proxyResData
    },
  }),
)

app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Api Gateway is running on port: ${PORT}`)
  logger.info(
    `Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`,
  )
  logger.info(`Post service is running on port ${process.env.POST_SERVICE_URL}`)
  logger.info(`Redis Url ${process.env.UPSTASH_REDIS_REST_URL}`)
})
