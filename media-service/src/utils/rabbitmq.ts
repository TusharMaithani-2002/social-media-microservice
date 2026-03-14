import amqp from 'amqplib'
import { logger } from './logger'

let connection = null
let channel: amqp.Channel | null = null

const EXCHANGE_NAME = 'social-media-events'

async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL!)
    channel = await connection.createChannel()

    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false })
    logger.info('connected to rabbitmq')
    return channel
  } catch (error) {
    logger.error('Error connecting to rabbitmq', error)
  }
}

async function publishEvent<T>(routingKey: string, message: T) {
  if (!channel) {
    await connectToRabbitMQ()
  }

  channel?.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message)),
  )

  logger.info(`Event published: ${routingKey}`)
}

async function consumeEvent(
  routingKey: string,
  callback: (content: any) => {},
) {
  if (!channel) {
    await connectToRabbitMQ()
  }

  const q = await channel?.assertQueue('', { exclusive: true })
  if (!q) {
    return null
  }
  await channel?.bindQueue(q.queue, EXCHANGE_NAME, routingKey)

  channel?.consume(q.queue, (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString())
      callback(content)
      channel?.ack(msg)
    }
  })

  logger.info(`Subscribed to event: ${routingKey}`)
}

export { connectToRabbitMQ, publishEvent, consumeEvent }
