# 🚀 Bun Microservices Architecture (TypeScript)
A scalable microservices-based backend built with Bun + TypeScript, designed for modularity, performance, and independent service scaling.

## 🏗 Architecture Overview
```
api-gateway
│
├── identity-service   → Authentication & Authorization
├── post-service       → Post management
├── media-service      → Media upload & processing
└── search-service     → Search indexing & querying
```
Each service is independently deployable and communicates via message queue.

## Services

### 🔐 identity-service
Handles:
- User authentication
- JWT issuance
- Token validation
- User management

Tech:
- Bun
- TypeScript
- MongoDB

### 📝 post-service
Handles:

- Create / update / delete posts
- Fetch user posts
- Business logic for content

### 🖼 media-service

Handles:

- File uploads
- Image processing
- Storage integration (Cloudinary)

### 🔎 search-service

Handles:

- Indexing posts
- Search queries
- Optimized retrieval

### 🌐 api-gateway

Acts as:

- Single entry point
- Request routing
- Authentication middleware
- Rate limiting

## 🧰 Tech Stack

Runtime: Bun
Language: TypeScript
Architecture: Microservices
API Style: REST
Auth: JWT (via identity-service)
Database: MongoDB

## 🗂 Project Structure
```
root/
│
├── api-gateway/
├── identity-service/
├── post-service/
├── media-service/
├── search-service/
│
└── README.md
```

Each service contains:

```
service-name/
├── src/
├── package.json
├── tsconfig.json
├── bun.lockb
└── .env
```

## ⚙️ Installation

Make sure you have Bun installed.
```
curl -fsSL https://bun.sh/install | bash
```

## ▶ Running Services

Navigate into each service:

```
cd identity-service
bun install
bun run dev
```

Repeat for all services.

## 🌍 Environment Variables

Each service should define its own .env file.

Example:
```
PORT=4001
DATABASE_URL=...
JWT_SECRET=...
REDIS_URL=...
```

Then add the urls for the services in the environment file of api-gateway.

## 🧠 Design Principles

- Service isolation
- Independent scaling
- Clear domain separation
- Lightweight runtime (Bun)
- Type-safe contracts (TypeScript)
