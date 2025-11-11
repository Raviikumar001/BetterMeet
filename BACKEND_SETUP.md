# Backend Setup Instructions - Phase 1

## ✅ What's Ready

Your Go Fiber backend is now ready with:
- ✅ WebSocket signaling server
- ✅ Room management
- ✅ Peer connection handling
- ✅ Message relay system (offer/answer/ice)
- ✅ All Phase 1 code implemented

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd backend
go mod download
go mod tidy
```

This will install:
- `github.com/gofiber/fiber/v2` - Web framework
- `github.com/gofiber/websocket/v2` - WebSocket support
- `github.com/joho/godotenv` - Environment loader

### Step 2: Create Environment File

```bash
cp .env.example .env.local
```

Or manually create `backend/.env.local`:
```env
FIBER_PORT=3001
NEXT_JS_URL=http://localhost:3000
LOG_LEVEL=debug
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
TURN_SERVER=your-turn-server.com
STUN_SERVERS=stun:stun.l.google.com:19302
ENVIRONMENT=development
```

### Step 3: Run the Server

```bash
go run cmd/server/main.go
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║          🚀 Record Meet Backend Started                ║
║                                                        ║
║  Port:   :3001                                         ║
║  Health: http://localhost:3001/health                 ║
║  WS:     ws://localhost:3001/ws/:room/:peerId         ║
║                                                        ║
║  Status: Ready for connections                        ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

### Step 4: Verify It Works

```bash
# Test health endpoint
curl http://localhost:3001/health

# Should return:
# {"status":"ok","time":"2025-01-15T10:30:00Z"}
```

## 🔌 Testing WebSocket

### Option 1: Using wscat (easiest)

```bash
# Install wscat
npm install -g wscat

# Terminal 1: Connect as peer-1
wscat -c "ws://localhost:3001/ws/room-1/peer-1"

# Terminal 2: Connect as peer-2
wscat -c "ws://localhost:3001/ws/room-1/peer-2"

# In Terminal 1, send an offer
> {"type":"offer","from":"peer-1","to":"peer-2","data":{"sdp":"test-offer"}}

# Should appear in Terminal 2
< {"type":"offer","from":"peer-1","to":"peer-2","data":{"sdp":"test-offer"}}
```

### Option 2: Testing Manually

Using your frontend (after connecting Next.js):
```javascript
// Connect from browser console
const ws = new WebSocket('ws://localhost:3001/ws/room-1/peer-1');
ws.onmessage = (event) => console.log(event.data);
ws.send(JSON.stringify({
  type: 'offer',
  from: 'peer-1',
  to: 'peer-2',
  data: { sdp: '...' }
}));
```

## 📂 Files Created

### Main Files
- `cmd/server/main.go` - Entry point with Fiber setup
- `handlers/websocket.go` - WebSocket connection handler
- `models/room.go` - Room & Peer data models
- `services/room_service.go` - Room management logic
- `config/config.go` - Configuration loading
- `utils/constants.go` - Message types & constants

### Configuration
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules

### Documentation
- `README.md` - Detailed backend docs

## 🔄 How It Works (Architecture)

```
┌─────────────────────────────────────┐
│      Frontend (Next.js:3000)        │
│  WebRTC Peer Connection             │
└────────────────┬────────────────────┘
                 │
                 │ WebSocket
                 ▼
         ┌───────────────┐
         │ GET /ws/...   │
         │ Upgrade       │
         └───────┬───────┘
                 │
                 ▼
    ┌────────────────────────┐
    │ handleWebSocket()      │
    │                        │
    │ • Accept connection    │
    │ • Add to room          │
    │ • Listen for messages  │
    │ • Relay/Broadcast      │
    └────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
   ┌─────────┐      ┌─────────┐
   │ Room    │      │ Room    │
   │ Peer-1  │      │ Peer-2  │
   └─────────┘      └─────────┘
        │                 │
        └────────┬────────┘
                 │
          WebSocket Message:
          {type, from, to, data}
```

### Message Flow
1. Peer A connects → server creates room, adds peer
2. Peer B connects → server notifies peer A (new-peer message)
3. Peer A sends offer → server relays to peer B
4. Peer B sends answer → server relays to peer A
5. Both exchange ICE candidates → server relays both ways
6. **P2P connection established** ✅

## 📊 Key Components

### Room Manager (services/room_service.go)
```go
GetOrCreateRoom(roomID)  // Get or create room
GetRoom(roomID)          // Retrieve room
DeleteRoom(roomID)       // Delete empty room
GetAllRooms()           // Get all active rooms
GetRoomCount()          // Count active rooms
GetTotalPeers()         // Count all peers
```

### Room Model (models/room.go)
```go
room.AddPeer(peer)                    // Add peer
room.RemovePeer(peerID)               // Remove peer
room.BroadcastToAll(msg)              // Send to all
room.BroadcastToOthers(fromID, msg)  // Send to others
room.PeerCount()                      // Count peers
```

### Message Types (utils/constants.go)
```
MsgTypeOffer, MsgTypeAnswer, MsgTypeICE  // Signaling
MsgTypeNewPeer, MsgTypePeerLeft          // Connection
MsgTypeChat                               // Chat
```

## 🧪 Testing Checklist

- [ ] Run `go mod download && go mod tidy`
- [ ] Create `.env.local` file
- [ ] Run `go run cmd/server/main.go`
- [ ] Check health: `curl http://localhost:3001/health`
- [ ] Test WebSocket with wscat (2 terminals)
- [ ] See messages relay between terminals
- [ ] Verify peer-left on disconnect

## 🎯 What's Next

### Phase 1 Complete ✅
- WebSocket server
- Room management
- Signaling relay

### Phase 2 (Frontend Integration)
1. Build React video call UI
2. Connect to WebSocket
3. Implement WebRTC peer connection
4. Handle offer/answer flow
5. Test 1-on-1 call

## 🐛 Common Issues

### "Port 3001 already in use"
```bash
lsof -i :3001
kill -9 <PID>
```

### "Cannot find module"
```bash
go mod download
go mod tidy
```

### "Connection refused"
```bash
# Make sure server is running
curl http://localhost:3001/health
```

### "WebSocket connection failed"
```bash
# Check CORS is configured
# Check WebSocket upgrade is working
# Try from frontend directly
```

## 📝 Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| FIBER_PORT | 3001 | Server port |
| NEXT_JS_URL | http://localhost:3000 | Frontend URL |
| LOG_LEVEL | debug | Logging level |
| REDIS_URL | redis://localhost:6379 | Redis connection |
| JWT_SECRET | key | JWT signing key |
| TURN_SERVER | empty | TURN server URL |
| STUN_SERVERS | stun.l.google.com | STUN servers |
| ENVIRONMENT | development | dev/production |

## ✨ Features

✅ **WebSocket Server** - Async connection handling  
✅ **Room Management** - Create/manage/destroy rooms  
✅ **Peer Tracking** - Track connected peers  
✅ **Message Relay** - Relay signaling messages  
✅ **Broadcast** - Send messages to multiple peers  
✅ **Thread-Safe** - RWMutex for concurrent access  
✅ **Goroutines** - Efficient concurrency  
✅ **CORS** - Cross-origin requests enabled  
✅ **Logging** - Detailed operation logging  

## 🎉 Ready!

Your backend is now ready for:
1. ✅ WebSocket connections
2. ✅ Room management
3. ✅ Peer signaling
4. ⏳ Frontend integration (next step)

---

**Next**: Build the Next.js frontend to connect to this backend!

See: `/frontend` directory
