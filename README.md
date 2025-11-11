# Record Meet - README

<div align="center">

# 📹 Record Meet

A **production-ready Google Meet clone** built with **Next.js + Go**, featuring real-time video conferencing, screen sharing, chat, and local recording.

![Status](https://img.shields.io/badge/Status-Phase%201%20Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## ✨ Features

### MVP (Phase 1-6)
- ✅ 1-on-1 video calls
- ✅ Multi-user group meetings (up to 6 people)
- ✅ Audio/video streaming
- ✅ Screen sharing
- ✅ Text chat
- ✅ Local meeting recording (as .webm)

### Future (Phase 7+)
- 🚀 Production deployment
- 🚀 TURN/STUN server integration
- 🚀 Cloud recording storage
- 🚀 Virtual backgrounds
- 🚀 Mobile app (React Native)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│    Frontend (Next.js 14+)           │
│  WebRTC | WebSocket | Tailwind     │
│  Running on :3000                   │
└─────────────┬───────────────────────┘
              │ HTTP + WebSocket
              ▼
┌─────────────────────────────────────┐
│    Backend (Go Fiber)               │
│  Signaling | Room Management        │
│  Running on :3001                   │
└──────────────────────────────────────┘
              ▼
     STUN/TURN Servers
     (Global connectivity)
```

### Why This Stack?
- **Next.js**: Modern React framework with built-in routing
- **Go Fiber**: Lightweight, fast WebSocket handling for 1000s of connections
- **WebRTC**: P2P media (no server relay = ultra-low latency)
- **Docker**: Consistent local dev & production deployment

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Go 1.21+
- Docker & Docker Compose (optional)

### 1. Clone & Setup
```bash
git clone <your-repo>
cd record-meet

# Install dependencies for both services
npm run setup
```

### 2. Start Development
```bash
# Option 1: Both services
npm run dev

# Option 2: Individually
make dev-frontend    # Terminal 1
make dev-backend     # Terminal 2
```

### 3. Access Services
- 📱 **Frontend**: http://localhost:3000
- 🔧 **Backend**: http://localhost:3001
- ❤️ **Health**: http://localhost:3001/health

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** | 7-phase development roadmap |
| **[MONOREPO_STRUCTURE.md](./MONOREPO_STRUCTURE.md)** | Project layout & architecture |
| **[BACKEND_FRAMEWORK_GUIDE.md](./BACKEND_FRAMEWORK_GUIDE.md)** | Go Fiber setup & signaling |
| **[docs/SETUP.md](./docs/SETUP.md)** | Detailed setup instructions |

---

## 🛠️ Available Commands

### Development
```bash
make dev              # Start both services (hot reload)
make dev-frontend     # Start frontend only
make dev-backend      # Start backend only
make build            # Build both services
make test             # Run tests
make clean            # Clean artifacts
```

### Docker
```bash
make docker-build     # Build Docker images
make docker-run       # Run with Docker Compose
docker-compose logs -f # View logs
docker-compose down    # Stop services
```

### Deployment
```bash
make deploy           # Deploy to production
```

See `Makefile` for more commands.

---

## 📁 Project Structure

```
record-meet/
├── frontend/                 # Next.js 14+ application
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities & helpers
│   └── package.json
│
├── backend/                 # Go Fiber API server
│   ├── cmd/server/          # Entry point
│   ├── handlers/            # HTTP & WebSocket handlers
│   ├── models/              # Data models
│   ├── services/            # Business logic
│   ├── middleware/          # Fiber middleware
│   ├── utils/               # Utilities
│   └── go.mod
│
├── scripts/                 # Build & deployment scripts
├── docs/                    # Documentation
├── docker-compose.yml       # Local dev environment
├── Dockerfile.frontend      # Next.js Docker image
├── Dockerfile.backend       # Go Docker image
├── Makefile                # Convenient commands
└── README.md               # This file
```

---

## 🔄 Development Workflow

### Phase 1: Foundation (Weeks 1-2)
✅ WebSocket signaling between peers
✅ 1-on-1 connection establishment
✅ SDP offer/answer & ICE candidates

**Start here:**
```bash
npm run dev
# Create your first video connection!
```

### Phase 2: Media Streaming (Weeks 3-4)
✅ getUserMedia() integration
✅ Audio/video rendering
✅ Mute/unmute controls

### Phase 3: Multi-User (Weeks 5-6)
✅ Grid layout for multiple participants
✅ Peer join/leave notifications
✅ Room state management

### Phase 4: Chat (Week 7)
✅ WebSocket chat broadcasting
✅ Message UI & storage

### Phase 5: Screen Share (Weeks 8-9)
✅ getDisplayMedia() integration
✅ Screen-to-peer broadcasting

### Phase 6: Recording (Weeks 10-11)
✅ MediaRecorder API integration
✅ Local .webm download

### Phase 7: Production (Week 12+)
✅ TURN/STUN servers
✅ Docker deployment
✅ Security & auth

See `[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)` for detailed phases.

---

## 🌐 Environment Variables

### Backend (`backend/.env.local`)
```env
FIBER_PORT=3001
NEXT_JS_URL=http://localhost:3000
LOG_LEVEL=debug
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
TURN_SERVER=your-turn-server.com
STUN_SERVERS=stun:stun.l.google.com:19302
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## 🐳 Docker Deployment

### Local Development
```bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Production Build
```bash
docker-compose build
docker-compose -f docker-compose.yml up -d
```

---

## 📡 API Endpoints

### Health Check
```bash
curl http://localhost:3001/health
# Response: {"status":"ok","time":"2025-01-15T10:30:00Z"}
```

### WebSocket (Signaling)
```bash
# After Phase 1
wscat -c "ws://localhost:3001/ws/room-abc/peer-1"
```

See `[BACKEND_FRAMEWORK_GUIDE.md](./BACKEND_FRAMEWORK_GUIDE.md)` for full API docs.

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
go test ./...
```

### Integration Tests (Planned)
```bash
make test
```

---

## 🚨 Troubleshooting

### Frontend can't connect to backend
```bash
# Check backend is running
curl http://localhost:3001/health

# Check CORS is enabled
# See backend/middleware/cors.go
```

### Port conflicts
```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3001
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Docker issues
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Follow** the phase plan in `IMPLEMENTATION_PLAN.md`
4. **Test** locally: `npm run dev`
5. **Submit** a PR with description

### Code Style
- **Frontend**: Prettier + ESLint (coming soon)
- **Backend**: `gofmt` + `golint`

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙋 Support

- **Issue Tracker**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: See `docs/` folder

---

## 🎯 Roadmap

- [ ] **Phase 1**: Signaling (2 weeks)
- [ ] **Phase 2**: Media streaming (2 weeks)
- [ ] **Phase 3**: Multi-user rooms (2 weeks)
- [ ] **Phase 4**: Chat (1 week)
- [ ] **Phase 5**: Screen sharing (2 weeks)
- [ ] **Phase 6**: Recording (2 weeks)
- [ ] **Phase 7**: Production deployment (2+ weeks)

**Target**: Full MVP by end of Q1 2026

---

## 💡 Tech Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend Framework | Next.js | 14+ |
| React | React | 18+ |
| Styling | Tailwind CSS | 3.3+ |
| Backend Framework | Go Fiber | 2.50+ |
| Go | Go | 1.21+ |
| Real-time Transport | WebRTC | Latest |
| Signaling | WebSocket | -  |
| Container | Docker | Latest |
| Orchestration | Docker Compose | 3.9+ |

---

<div align="center">

**Built with ❤️ for real-time communication**

[⬆ Back to top](#-record-meet)

</div>
