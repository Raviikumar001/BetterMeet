# Monorepo Structure: Next.js + Go Backend

## 🏗️ Production-Grade Monorepo Layout

This is the **recommended production structure** for having frontend and backend in the same repo.

```
record-meet/                           # Root monorepo
│
├── frontend/                          # Next.js app
│   ├── app/                          # App router (Next.js 14+)
│   │   ├── (auth)/
│   │   ├── room/
│   │   │   └── [id]/
│   │   ├── api/                      # Optional API routes
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── styles/
│   ├── .env.local                    # Local dev config
│   ├── .env.production               # Prod config
│   ├── .gitignore
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                           # Go Fiber app
│   ├── cmd/
│   │   └── server/
│   │       └── main.go               # Entry point
│   ├── handlers/
│   │   ├── websocket.go
│   │   ├── rooms.go
│   │   ├── health.go
│   │   └── middleware.go
│   ├── models/
│   │   ├── room.go
│   │   ├── peer.go
│   │   └── message.go
│   ├── services/
│   │   ├── room_service.go
│   │   └── signaling_service.go
│   ├── utils/
│   │   ├── constants.go
│   │   ├── logger.go
│   │   └── errors.go
│   ├── config/
│   │   └── config.go
│   ├── middleware/
│   │   ├── cors.go
│   │   ├── logger.go
│   │   └── auth.go
│   ├── .env.example
│   ├── .env.local                    # Local dev config
│   ├── .env.production               # Prod config
│   ├── .gitignore
│   ├── Dockerfile
│   ├── docker-compose.yml            # Local dev
│   ├── go.mod
│   ├── go.sum
│   └── Makefile                      # Build commands
│
├── docker-compose.yml                 # Root docker-compose (both services)
├── Dockerfile.frontend               # Multi-stage build
├── Dockerfile.backend                # Go build
├── .gitignore
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml           # CI for frontend
│       └── backend-ci.yml            # CI for backend
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SETUP.md
│   └── DEPLOYMENT.md
├── scripts/
│   ├── setup.sh                      # Initial setup
│   ├── dev.sh                        # Start both services
│   ├── build.sh                      # Build both
│   └── deploy.sh                     # Deploy to production
├── package.json                       # Root package.json (optional)
├── Makefile                           # Root Makefile
├── README.md                          # Main project docs
└── IMPLEMENTATION_PLAN.md             # Already exists
```

---

## 📝 Root Level Configuration Files

### 1. Root `package.json` (Optional but Recommended)
```json
{
  "name": "record-meet",
  "version": "1.0.0",
  "description": "Google Meet Clone - Video Conferencing Platform",
  "private": true,
  "scripts": {
    "dev": "bash scripts/dev.sh",
    "build": "bash scripts/build.sh",
    "start": "docker-compose up",
    "start:prod": "docker-compose -f docker-compose.yml up -d",
    "stop": "docker-compose down",
    "logs": "docker-compose logs -f",
    "setup": "bash scripts/setup.sh"
  },
  "workspaces": [
    "frontend",
    "backend"
  ]
}
```

### 2. Root `Makefile` (For convenient commands)
```makefile
.PHONY: help setup dev build test clean deploy

help:
	@echo "Available commands:"
	@echo "  make setup        - Initial setup for both frontend and backend"
	@echo "  make dev          - Start development servers"
	@echo "  make build        - Build both frontend and backend"
	@echo "  make test         - Run tests"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make deploy       - Deploy to production"

setup:
	bash scripts/setup.sh

dev:
	bash scripts/dev.sh

build:
	bash scripts/build.sh

test:
	cd frontend && npm run test
	cd backend && go test ./...

clean:
	cd frontend && npm run build && rm -rf .next
	cd backend && rm -f main
	docker-compose down

deploy:
	bash scripts/deploy.sh
```

### 3. Root `docker-compose.yml` (Local development)
```yaml
version: '3.9'

services:
  # Backend (Go)
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - FIBER_PORT=3001
      - NEXT_JS_URL=http://localhost:3000
      - LOG_LEVEL=debug
    volumes:
      - ./backend:/app/backend  # Hot reload in dev
    networks:
      - record-meet-net
    depends_on:
      - redis

  # Frontend (Next.js)
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      target: development  # Multi-stage for dev
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    volumes:
      - ./frontend:/app/frontend  # Hot reload in dev
    networks:
      - record-meet-net
    depends_on:
      - backend

  # Optional: Redis for storing room state
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - record-meet-net

networks:
  record-meet-net:
    driver: bridge
```

---

## 🐳 Docker Configuration

### `Dockerfile.frontend` (Multi-stage build)
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Development (for local testing)
FROM node:18-alpine AS development
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Production
FROM node:18-alpine AS production
WORKDIR /app

# Copy only production dependencies
COPY frontend/package*.json ./
RUN npm ci --production

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

### `Dockerfile.backend`
```dockerfile
# Stage 1: Build
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY backend/go.mod go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo \
    -o main cmd/server/main.go

# Stage 2: Production
FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 3001
CMD ["./main"]
```

---

## 🚀 Scripts for Easy Development

### `scripts/setup.sh`
```bash
#!/bin/bash

echo "🔧 Setting up record-meet monorepo..."

# Backend setup
echo "📦 Setting up backend..."
cd backend
go mod download
go mod tidy
cd ..

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend
npm install
cd ..

# Copy env files
echo "🔑 Creating environment files..."
[ ! -f backend/.env.local ] && cp backend/.env.example backend/.env.local
[ ! -f frontend/.env.local ] && cp frontend/.env.example frontend/.env.local

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update backend/.env.local with your config"
echo "  2. Update frontend/.env.local with your config"
echo "  3. Run: npm run dev"
```

### `scripts/dev.sh`
```bash
#!/bin/bash

echo "🚀 Starting development servers..."

# Start backend in background
cd backend
echo "Starting Go backend on :3001..."
go run cmd/server/main.go &
BACKEND_PID=$!

# Start frontend
cd ../frontend
echo "Starting Next.js frontend on :3000..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Clean up on exit
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
```

### `scripts/build.sh`
```bash
#!/bin/bash

echo "🏗️ Building both services..."

# Build backend
echo "Building backend..."
cd backend
go build -o main cmd/server/main.go
cd ..

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Build complete!"
```

### `scripts/deploy.sh`
```bash
#!/bin/bash

echo "🚀 Deploying to production..."

# Build Docker images
echo "Building Docker images..."
docker-compose build

# Push to registry (if using)
# docker push your-registry/record-meet-frontend:latest
# docker push your-registry/record-meet-backend:latest

# Deploy
echo "Deploying services..."
docker-compose -f docker-compose.yml up -d

echo "✅ Deployment complete!"
```

---

## 🔐 Environment Files

### `backend/.env.example`
```
FIBER_PORT=3001
NEXT_JS_URL=http://localhost:3000
LOG_LEVEL=debug
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
TURN_SERVER=your-turn-server.com
STUN_SERVERS=stun:stun.l.google.com:19302
```

### `frontend/.env.example`
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## 📂 Frontend Structure (Next.js 14+ App Router)

```
frontend/
├── app/
│   ├── (auth)/                      # Auth group layout
│   │   ├── login/
│   │   │   └── page.jsx
│   │   ├── signup/
│   │   │   └── page.jsx
│   │   └── layout.jsx               # Auth layout (no navbar)
│   │
│   ├── (main)/                      # Main app group layout
│   │   ├── layout.jsx               # With navbar
│   │   ├── page.jsx                 # Home/dashboard
│   │   └── room/
│   │       └── [id]/
│   │           ├── page.jsx         # Room page
│   │           ├── layout.jsx
│   │           └── components/
│   │               ├── VideoCall.jsx
│   │               ├── ChatPanel.jsx
│   │               ├── Controls.jsx
│   │               └── ParticipantGrid.jsx
│   │
│   ├── api/                         # Optional API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   └── rooms/
│   │       └── route.js
│   │
│   ├── layout.jsx                   # Root layout (Tailwind, globals)
│   ├── page.jsx                     # Index page
│   ├── error.jsx
│   ├── loading.jsx
│   └── not-found.jsx
│
├── components/
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── Loading.jsx
│   ├── room/
│   │   ├── VideoGrid.jsx
│   │   ├── RemoteVideo.jsx
│   │   └── LocalVideo.jsx
│   └── chat/
│       ├── ChatMessage.jsx
│       └── ChatInput.jsx
│
├── hooks/
│   ├── useWebRTC.js
│   ├── useWebSocket.js
│   ├── useMediaStream.js
│   ├── useScreenShare.js
│   ├── useRecorder.js
│   └── useChat.js
│
├── lib/
│   ├── rtc-config.js                # WebRTC configuration
│   ├── socket-events.js             # Event constants
│   ├── api-client.js                # Fetch wrapper
│   ├── utils.js
│   └── constants.js
│
├── context/
│   ├── RoomContext.jsx              # Room state
│   └── AuthContext.jsx              # Auth state
│
├── styles/
│   ├── globals.css
│   └── variables.css
│
├── public/
│   ├── favicon.ico
│   ├── icons/
│   └── assets/
│
├── .env.local
├── .env.production
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🖥️ Backend Structure (Go)

```
backend/
├── cmd/
│   └── server/
│       └── main.go                  # Entry point (calls app setup)
│
├── handlers/
│   ├── websocket.go                 # Main WebSocket handler
│   ├── rooms.go                     # Room endpoints
│   ├── health.go                    # Health check
│   └── middleware.go                # CORS, logging, etc.
│
├── models/
│   ├── room.go                      # Room struct
│   ├── peer.go                      # Peer struct
│   ├── message.go                   # Message types
│   └── user.go                      # User struct (for auth)
│
├── services/
│   ├── room_service.go              # Room business logic
│   ├── signaling_service.go         # Signaling relay
│   └── peer_service.go              # Peer management
│
├── middleware/
│   ├── cors.go
│   ├── logger.go
│   ├── auth.go
│   └── error_handler.go
│
├── utils/
│   ├── constants.go                 # Event types, error codes
│   ├── logger.go                    # Logging setup
│   ├── errors.go                    # Custom errors
│   └── helpers.go
│
├── config/
│   └── config.go                    # Config from env
│
├── .env.local
├── .env.production
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── Makefile
├── go.mod
├── go.sum
└── README.md
```

---

## ⚡ Quick Start Commands

### Initial Setup
```bash
# Clone repo
git clone <your-repo>
cd record-meet

# Setup both services
npm run setup
# OR
make setup
```

### Development
```bash
# Start both services
npm run dev
# OR
make dev

# Or individually:
cd frontend && npm run dev      # Frontend on :3000
cd backend && go run cmd/server/main.go  # Backend on :3001
```

### Production Build
```bash
# Build everything
npm run build
# OR
make build

# Start with Docker
npm start
# OR
docker-compose up -d
```

### Testing
```bash
npm test          # Run all tests
make test
```

---

## 🔄 Development Workflow

### Terminal Setup (Using 2 terminals)

**Terminal 1 - Backend:**
```bash
cd backend
go run cmd/server/main.go
# or with auto-reload using air
air
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Or Single Terminal with Docker
```bash
docker-compose up
# Both services start automatically
# Hot reload enabled via volumes
```

---

## 🚀 Production Deployment

### Option 1: Docker Compose (VPS)
```bash
# Build images
docker-compose build

# Start
docker-compose -f docker-compose.yml up -d

# Monitor
docker-compose logs -f
```

### Option 2: Kubernetes (Scalable)
Create `k8s/` folder with:
- `frontend-deployment.yaml`
- `backend-deployment.yaml`
- `service.yaml`
- `ingress.yaml`

### Option 3: CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: docker-compose build
      - name: Push to registry
        run: docker push my-registry/record-meet
      - name: Deploy
        run: kubectl apply -f k8s/
```

---

## 📊 Communication Between Services

### Frontend → Backend
```javascript
// frontend/lib/api-client.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = {
  get: (endpoint) => fetch(`${API_BASE}${endpoint}`),
  post: (endpoint, data) => fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
};

// Usage in components
const response = await apiClient.get('/health');
```

### Backend → Frontend (WebSocket)
```go
// backend/handlers/websocket.go
// Backend sends signaling messages to frontend
toPeer.Conn.WriteJSON(Message{
  Type: "offer",
  Data: sdpOffer,
})
```

---

## ✅ Monorepo Best Practices

1. ✅ **Separate node_modules** - Each service has own `package.json`
2. ✅ **Shared docs** - Root `docs/` folder
3. ✅ **Single git repo** - Easy to clone once
4. ✅ **Docker for consistency** - Same env locally & production
5. ✅ **Root Makefile** - Convenient commands
6. ✅ **Environment files** - `.env.local` for dev, `.env.production` for prod
7. ✅ **Scripts folder** - Automation scripts
8. ✅ **Clear separation** - `frontend/` and `backend/` are isolated
9. ✅ **CI/CD** - GitHub Actions for auto-deploy
10. ✅ **Documentation** - Root README + service-specific READMEs

---

## 📋 Next Steps

1. Create this folder structure
2. Initialize projects:
   ```bash
   npx create-next-app@latest frontend --typescript --tailwind
   cd .. && mkdir backend && cd backend && go mod init record-meet
   ```
3. Copy Docker files and scripts
4. Run `npm run dev` to start both services
5. Test communication at `http://localhost:3000`

This is a **production-ready structure** that scales with your app! 🚀
