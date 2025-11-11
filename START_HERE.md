# 🎯 START HERE - Visual Guide

## What You Have Now

Your complete monorepo is ready with **both frontend and backend in the same repo**:

```
record-meet/  (your project root)
│
├── 📁 frontend/          ← Next.js app (port 3000)
├── 📁 backend/           ← Go API server (port 3001)
├── 📁 scripts/           ← Helper scripts
├── 📁 docs/              ← Documentation
│
└── ⚙️ Config Files
    ├── Makefile          ← Easy commands
    ├── docker-compose.yml
    ├── Dockerfile.frontend
    └── Dockerfile.backend
```

---

## 🚀 Get Started in 3 Steps

### Step 1: Setup (First time only - 2 minutes)
```bash
npm run setup
```

This installs all dependencies for both frontend and backend.

### Step 2: Start Both Services (2 minutes)
```bash
npm run dev
```

Watch for these messages:
```
✅ Frontend running on http://localhost:3000
✅ Backend running on http://localhost:3001
```

### Step 3: Verify It Works (1 minute)
Open browser → `http://localhost:3001/health`

Should see: `{"status":"ok","time":"2025-01-15..."}`

---

## 🎓 How They Work Together

### Frontend (Next.js on :3000)
```
User Interface
    ↓
Web Browser
    ↓
React Components
    ↓
WebSocket Client
    ↓
    ├→ Connect to ws://localhost:3001/ws/room-id/peer-id
    └→ Send/receive signaling messages
```

### Backend (Go on :3001)
```
WebSocket Server
    ↓
    ├→ Receive connection from peer 1
    ├→ Receive connection from peer 2
    ├→ Relay peer 1's offer to peer 2
    ├→ Relay peer 2's answer back to peer 1
    └→ Relay ICE candidates between them
```

### P2P Direct Connection
```
Frontend 1                                  Frontend 2
  ↓                                           ↓
WebRTC Peer Connection ←→ Media Flows ←→ WebRTC Peer Connection
  ↓                       (P2P Direct)      ↓
Camera/Mic                                Camera/Mic
```

**Key Point:** After initial handshake via backend, media flows **directly** between peers (no server!)

---

## 📋 Command Cheat Sheet

### Basic Development
| Command | What It Does |
|---------|-------------|
| `npm run setup` | Install all dependencies (first time) |
| `npm run dev` | Start both frontend + backend |
| `make dev` | Same as above (alternative) |
| `make dev-frontend` | Start only frontend |
| `make dev-backend` | Start only backend |

### Building & Docker
| Command | What It Does |
|---------|-------------|
| `make build` | Build both services |
| `docker-compose up` | Run in Docker containers |
| `docker-compose down` | Stop Docker containers |

### Utilities
| Command | What It Does |
|---------|-------------|
| `make clean` | Remove all builds & containers |
| `make help` | Show all available commands |

---

## 📂 Where to Put Code

### Frontend Code
**Location:** `frontend/`
```
frontend/
├── app/              ← Pages & routing
│   ├── room/
│   │   └── [id]/     ← Room page (http://localhost:3000/room/abc123)
│   └── page.jsx      ← Home page (http://localhost:3000)
├── components/       ← React components
├── hooks/            ← Custom hooks
└── lib/              ← Utilities
```

### Backend Code  
**Location:** `backend/`
```
backend/
├── cmd/server/       ← Entry point (main.go)
├── handlers/         ← API endpoints
│   └── websocket.go  ← Phase 1: WebSocket signaling
├── models/           ← Data structures
├── services/         ← Business logic
└── middleware/       ← CORS, logging, etc
```

---

## 🔌 Phase 1: What To Build First

### Backend (Do This First)
**File:** `backend/handlers/websocket.go`

Needs to:
1. Accept WebSocket connection → `/ws/room-id/peer-id`
2. Track peers in room
3. Relay **offer** from peer A to peer B
4. Relay **answer** from peer B to peer A
5. Relay **ICE candidates** both ways

See `BACKEND_FRAMEWORK_GUIDE.md` for complete code.

### Frontend (Then This)
**File:** `frontend/app/room/[id]/page.jsx`

Needs to:
1. Connect to WebSocket → `ws://localhost:3001/ws/room-id/peer-id`
2. Create RTCPeerConnection
3. Send offer when connecting
4. Handle answer from other peer
5. Exchange ICE candidates

---

## 📚 Documentation Map

| Need | Document |
|------|----------|
| **How to get started?** | `GETTING_STARTED.md` (this file's companion) |
| **7-phase development plan?** | `IMPLEMENTATION_PLAN.md` |
| **Project structure details?** | `MONOREPO_STRUCTURE.md` |
| **Go backend setup?** | `BACKEND_FRAMEWORK_GUIDE.md` |
| **Full project overview?** | `README.md` |
| **Setup instructions?** | `docs/SETUP.md` |

---

## ✅ Phase 1 Checklist

Once you start development:

- [ ] Run `npm run setup`
- [ ] Run `npm run dev`
- [ ] See both services running on :3000 & :3001
- [ ] Implement WebSocket handler in backend
- [ ] Test with `wscat` (see `BACKEND_FRAMEWORK_GUIDE.md`)
- [ ] Build React components in frontend
- [ ] Connect frontend to backend WebSocket
- [ ] Test with 2 browser tabs
- [ ] Celebrate Phase 1 completion! 🎉

---

## 🐛 Quick Troubleshooting

### "Port 3000/3001 already in use"
```bash
make clean
npm run dev
```

### "Can't find module/Command not found"
```bash
npm run setup    # Install dependencies
```

### "WebSocket connection refused"
```bash
# Check backend is running
curl http://localhost:3001/health

# If not, try:
make dev-backend
```

### "Build fails"
```bash
make clean
npm run setup
npm run dev
```

---

## 🎯 Next Actions

### Immediately (Now)
1. ✅ Read `GETTING_STARTED.md`
2. ✅ Run `npm run setup`
3. ✅ Run `npm run dev`
4. ✅ Visit `http://localhost:3001/health`

### Next 30 Minutes
1. Read `BACKEND_FRAMEWORK_GUIDE.md`
2. Understand the signaling flow
3. Add WebSocket handler code

### Next 2 Hours
1. Read `IMPLEMENTATION_PLAN.md` - Phase 1
2. Start building React components
3. Connect frontend to backend

### Rest of Week
1. Complete Phase 1
2. Test 1-on-1 signaling
3. Review and refine

---

## 🏆 You're Ready!

Everything is set up for **production**:
- ✅ Proper folder structure
- ✅ Docker for deployment
- ✅ Development scripts
- ✅ Full documentation
- ✅ Both services ready

### One Command to Start:
```bash
npm run dev
```

### Then:
1. Open http://localhost:3000
2. Follow `IMPLEMENTATION_PLAN.md` - Phase 1
3. Build your video conferencing app! 🎥

---

**Questions?** Check these files:
- `GETTING_STARTED.md` - Detailed getting started
- `BACKEND_FRAMEWORK_GUIDE.md` - How to build backend
- `README.md` - Full overview
- `docs/SETUP.md` - Troubleshooting

**Happy coding!** 🚀
