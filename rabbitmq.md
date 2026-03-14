# 🐰 RabbitMQ Mastery Guide

A comprehensive summary of concepts, architecture, and production patterns for scalable messaging.

---

## 🏗️ 1. Core Architecture (The Post Office Analogy)

RabbitMQ doesn't just pass messages; it routes them based on logic.

- **Producer:** The app sending the message (e.g., your Express API).
- **Exchange:** The "Sorting Office." It decides where to send messages based on the **Routing Key**.
- **Queue:** The storage bin where messages wait for workers.
- **Consumer:** The service that picks up and processes the message (e.g., a Go background worker).

---

## 🚦 2. Exchange Types & Routing

| Type       | Routing Logic                                                           | Use Case                                      |
| :--------- | :---------------------------------------------------------------------- | :-------------------------------------------- |
| **Direct** | Exact match of Routing Key.                                             | Simple task distribution.                     |
| **Topic**  | Pattern match using wildcards (`*` for one word, `#` for zero or more). | Multi-service event systems (e.g., `user.*`). |
| **Fanout** | Ignores keys; broadcasts to ALL bound queues.                           | Real-time notifications, logs.                |

---

## ⚡ 3. Performance & Scaling

### Connections vs. Channels

- **Connection:** A physical TCP pipe. High overhead. (1 per application).
- **Channel:** A virtual "sub-pipe" inside a connection. Low overhead. (1 per worker).

### Fair Dispatch (The `prefetch` Rule)

By default, RabbitMQ uses **Round Robin**. To prevent "Heavy" tasks from clogging one worker while others sit idle:

- **Set `channel.prefetch(1)`:** This ensures a worker only receives **one** message at a time and won't get another until it sends an `ack`.

---

## 🛡️ 4. Reliability & Error Handling

### Message Acknowledgment (`ack`)

- **`ack`**: Successfully processed; message is deleted.
- **`nack(requeue: true)`**: Temporary failure; message goes back to the queue.
- **`nack(requeue: false)`**: Fatal failure; message is sent to the **DLQ**.

### Dead Letter Queues (DLQ)

The "Lost and Found" for failed messages.

1.  Configure a **Dead Letter Exchange (DLX)**.
2.  Bind a **DLQ** to that exchange.
3.  If a message fails or expires, RabbitMQ automatically routes it here for manual debugging.

---

## 💻 5. Production Code Snippets (Express)

### The Singleton Connection Pattern

```typescript
import amqp from "amqplib";

let connection, channel;

async function getChannel() {
  if (channel) return channel;

  connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();

  // Durable: survives RabbitMQ server restarts
  await channel.assertExchange("app_events", "topic", { durable: true });
  return channel;
}
```
