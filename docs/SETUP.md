# Record Meet - Monorepo Documentation

## Quick Links

- **[IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)** - Phased development plan
- **[MONOREPO_STRUCTURE.md](../MONOREPO_STRUCTURE.md)** - Monorepo architecture & setup
- **[BACKEND_FRAMEWORK_GUIDE.md](../BACKEND_FRAMEWORK_GUIDE.md)** - Go Fiber backend guide

## Project Overview

Record Meet is a Google Meet clone with:
- Real-time video conferencing (1-on-1 & group)
- Screen sharing
- Text chat
- Local meeting recording
- Production-ready architecture

## Quick Start

### 1. Setup
```bash
npm run setup
# or
make setup
```

### 2. Development
```bash
npm run dev
# or
make dev
```

### 3. Access Services
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health Check: http://localhost:3001/health

## Project Structure

```
record-meet/
├── frontend/          # Next.js 14+ app
├── backend/           # Go Fiber backend
├── scripts/           # Development & deployment scripts
├── docs/              # Documentation
├── docker-compose.yml # Local dev environment
└── Makefile          # Convenient commands
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (React 18) |
| Backend | Go 1.21 + Fiber |
| Real-time | WebRTC + WebSocket |
| Recording | MediaRecorder API |
| Styling | Tailwind CSS |
| Deployment | Docker + Docker Compose |

## Development Phases

1. **Phase 1** (Weeks 1-2): 1-on-1 video signaling
2. **Phase 2** (Weeks 3-4): Audio/video streaming
3. **Phase 3** (Weeks 5-6): Multi-user rooms
4. **Phase 4** (Week 7): Text chat
5. **Phase 5** (Weeks 8-9): Screen sharing
6. **Phase 6** (Weeks 10-11): Local recording
7. **Phase 7** (Week 12+): Production deployment

## Useful Commands

```bash
# Development
make dev              # Start both services
make dev-frontend     # Start frontend only
make dev-backend      # Start backend only

# Building
make build            # Build both services
make docker-build     # Build Docker images

# Docker
make docker-run       # Run with Docker
docker-compose logs -f # View logs

# Testing
make test             # Run tests
make clean            # Clean artifacts

# Deployment
make deploy           # Deploy to production
```

## Environment Variables

### Backend (.env.local or .env.production)
```
FIBER_PORT=3001
NEXT_JS_URL=http://localhost:3000
LOG_LEVEL=debug
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
TURN_SERVER=your-turn-server.com
STUN_SERVERS=stun:stun.l.google.com:19302
```

### Frontend (.env.local or .env.production)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Services Overview

### Frontend (Next.js)
- **Port**: 3000
- **Hot Reload**: Yes (dev mode)
- **Build**: `npm run build`
- **Start**: `npm run dev` or `npm start`

### Backend (Go)
- **Port**: 3001
- **Framework**: Fiber
- **Build**: `go build -o main cmd/server/main.go`
- **Start**: `go run cmd/server/main.go`

### Redis (Optional)
- **Port**: 6379
- **Purpose**: Room state, chat history
- **Only in docker-compose**: Yes

## API Endpoints

### Health Check
```
GET http://localhost:3001/health
Response: { "status": "ok", "time": "..." }
```

### WebSocket (Phase 1+)
```
WS ws://localhost:3001/ws/:room/:peerId
```

See `[../BACKEND_FRAMEWORK_GUIDE.md](../BACKEND_FRAMEWORK_GUIDE.md)` for detailed signaling flow.

## Deployment

### Docker Compose (Production)
```bash
docker-compose build
docker-compose -f docker-compose.yml up -d
docker-compose logs -f
```

### Kubernetes (Enterprise)
See `k8s/` folder (if available) for K8s manifests.

## Troubleshooting

### Frontend not connecting to backend
1. Check backend is running: `curl http://localhost:3001/health`
2. Check CORS is enabled in backend
3. Check environment variables in frontend (.env.local)

### Port already in use
```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3001
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Docker build fails
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Follow the phase plan in `IMPLEMENTATION_PLAN.md`
3. Test locally before pushing
4. Submit PR with description

## License

MIT

## Support

- **Frontend Issues**: Check `frontend/` directory
- **Backend Issues**: Check `backend/` directory
- **Architecture Questions**: See `MONOREPO_STRUCTURE.md`
- **API Documentation**: See `BACKEND_FRAMEWORK_GUIDE.md`

---

**Last Updated**: November 2025
