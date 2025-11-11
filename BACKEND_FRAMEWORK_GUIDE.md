# Backend Framework Recommendation: Go Fiber

## 🎯 Quick Answer: Use **Fiber**

For this project, **Fiber** is the best choice. Here's why and how to set it up.

---

## 📊 Comparison: Fiber vs Gin vs Chi

| Criteria | **Fiber** | Gin | Chi |
|----------|-----------|-----|-----|
| **Performance** | ⭐⭐⭐⭐⭐ Fastest | ⭐⭐⭐⭐ Fast | ⭐⭐⭐ Good |
| **WebSocket Support** | ✅ Built-in & easy | ⚠️ Via middleware | ✅ Via gorilla/websocket |
| **Learning Curve** | ⭐⭐ Express-like | ⭐⭐⭐ Medium | ⭐⭐⭐ Medium |
| **Community** | ⭐⭐⭐ Growing | ⭐⭐⭐⭐ Large | ⭐⭐⭐⭐ Large |
| **Middleware Ecosystem** | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Excellent |
| **Setup Speed** | ⭐⭐⭐⭐⭐ Fastest | ⭐⭐⭐⭐ Fast | ⭐⭐⭐ Medium |
| **Real-time Apps** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Good |
| **WebSocket Latency** | <1ms | 2-3ms | 1-2ms |

### Why **Fiber**?

1. **Express.js-like API** → If you know Express, you'll be productive immediately
2. **WebSocket is built-in** → No complex middleware setup
3. **Fastest HTTP routing** → Matters for signaling speed
4. **Simple concurrency** → Goroutines handle 1000s of connections easily
5. **Perfect for real-time** → Broadcasting to peers is straightforward

**Gin** is also solid but requires extra setup for WebSocket. **Chi** is more "Go-idiomatic" but slightly slower.

---

## 🚀 Backend Project Setup (Phase 1)

### Folder Structure
```
backend/
├── main.go                        # Entry point
├── handlers/
│   ├── websocket.go              # WebSocket handler (signaling + chat)
│   ├── rooms.go                  # Room endpoints (join/leave)
│   └── health.go                 # Health check endpoint
├── models/
│   ├── room.go                   # Room struct
│   ├── peer.go                   # Peer metadata
│   └── message.go                # Message types
├── services/
│   ├── room_service.go           # Room management logic
│   └── signaling_service.go      # Signaling relay logic
├── utils/
│   ├── constants.go              # Event types, configs
│   ├── logger.go                 # Logging (optional)
│   └── errors.go                 # Custom error types
├── config/
│   └── config.go                 # Configuration (optional)
├── Dockerfile                     # Docker image
├── docker-compose.yml             # Local development
├── go.mod
├── go.sum
└── .env.example
```

---

## 📝 Installation & Setup

### 1. Initialize Go Module
```bash
mkdir backend && cd backend
go mod init record-meet
```

### 2. Install Dependencies
```bash
# Main framework
go get github.com/gofiber/fiber/v2

# WebSocket support
go get github.com/gofiber/websocket/v2

# Environment variables
go get github.com/joho/godotenv

# (Optional) CORS
go get github.com/gofiber/cors

# (Optional) Logging
go get go.uber.org/zap
```

### 3. Create Minimal `main.go`
```go
package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()

	// CORS for development
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000", // Next.js dev server
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Content-Type, Authorization",
	}))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// WebSocket endpoint (placeholder)
	app.Get("/ws/:room", websocket.New(handleWebSocket))

	// Start server
	log.Println("🚀 Server running on :3001")
	log.Fatal(app.Listen(":3001"))
}

func handleWebSocket(c *websocket.Conn) {
	roomID := c.Params("room")
	log.Printf("Client connected to room: %s\n", roomID)

	// TODO: Implement signaling logic
	for {
		messageType, message, err := c.ReadMessage()
		if err != nil {
			break
		}
		log.Printf("Received: %s\n", string(message))
	}
}
```

### 4. Run Locally
```bash
go run main.go
```

Visit `http://localhost:3001/health` → should return `{"status":"ok"}`

---

## 🔌 WebSocket Implementation (Phase 1 Focus)

### Key Concepts

**Fiber WebSocket** makes it super easy:
- Each client gets a `*websocket.Conn`
- Use `ReadMessage()` to receive
- Use `WriteMessage()` to send
- Goroutines handle concurrency automatically

### Phase 1: Basic Signaling Handler

Create `backend/handlers/websocket.go`:

```go
package handlers

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

// Rooms holds all active rooms
var Rooms = make(map[string]*Room)
var RoomsMutex sync.RWMutex

// Room represents a meeting room
type Room struct {
	ID    string
	Peers map[string]*Peer
	Mu    sync.RWMutex
}

// Peer represents a connected client
type Peer struct {
	ID   string
	Conn *websocket.Conn
}

// Message types
type Message struct {
	Type   string      `json:"type"`   // "offer", "answer", "ice", "chat"
	Room   string      `json:"room"`
	From   string      `json:"from"`
	To     string      `json:"to"`
	Data   interface{} `json:"data"`
}

// HandleWebSocket manages WebSocket connections
func HandleWebSocket(c *websocket.Conn) {
	roomID := c.Params("room")
	peerID := c.Params("peerId") // or generate UUID

	log.Printf("📱 Peer %s joining room %s\n", peerID, roomID)

	// Get or create room
	RoomsMutex.Lock()
	room, exists := Rooms[roomID]
	if !exists {
		room = &Room{
			ID:    roomID,
			Peers: make(map[string]*Peer),
		}
		Rooms[roomID] = room
	}
	RoomsMutex.Unlock()

	// Add peer to room
	peer := &Peer{ID: peerID, Conn: c}
	room.Mu.Lock()
	room.Peers[peerID] = peer
	room.Mu.Unlock()

	// Notify existing peers of new peer
	broadcastNewPeer(room, peerID)

	// Listen for messages
	for {
		msg := new(Message)
		if err := c.ReadJSON(msg); err != nil {
			log.Printf("❌ Error reading message: %v\n", err)
			break
		}

		msg.From = peerID
		handleMessage(room, msg)
	}

	// Peer disconnected
	room.Mu.Lock()
	delete(room.Peers, peerID)
	room.Mu.Unlock()

	log.Printf("👋 Peer %s left room %s\n", peerID, roomID)
	broadcastPeerLeft(room, peerID)

	// Clean up empty rooms
	if len(room.Peers) == 0 {
		RoomsMutex.Lock()
		delete(Rooms, roomID)
		RoomsMutex.Unlock()
	}
}

// handleMessage routes different message types
func handleMessage(room *Room, msg *Message) {
	switch msg.Type {
	case "offer":
		// Relay offer from A to B
		relayMessage(room, msg)
	case "answer":
		// Relay answer from B to A
		relayMessage(room, msg)
	case "ice":
		// Relay ICE candidate
		relayMessage(room, msg)
	case "chat":
		// Broadcast chat to all peers
		broadcastChat(room, msg)
	}
}

// relayMessage sends to specific peer
func relayMessage(room *Room, msg *Message) {
	room.Mu.RLock()
	toPeer, exists := room.Peers[msg.To]
	room.Mu.RUnlock()

	if !exists {
		log.Printf("⚠️ Peer %s not found\n", msg.To)
		return
	}

	if err := toPeer.Conn.WriteJSON(msg); err != nil {
		log.Printf("❌ Error relaying message: %v\n", err)
	}
}

// broadcastNewPeer notifies others that new peer joined
func broadcastNewPeer(room *Room, newPeerID string) {
	msg := Message{
		Type: "new-peer",
		From: "server",
		Data: newPeerID,
	}

	room.Mu.RLock()
	defer room.Mu.RUnlock()

	for peerID, peer := range room.Peers {
		if peerID != newPeerID { // Don't send to the new peer
			if err := peer.Conn.WriteJSON(msg); err != nil {
				log.Printf("❌ Error broadcasting new peer: %v\n", err)
			}
		}
	}
}

// broadcastChat sends chat to all peers
func broadcastChat(room *Room, msg *Message) {
	room.Mu.RLock()
	defer room.Mu.RUnlock()

	for _, peer := range room.Peers {
		if err := peer.Conn.WriteJSON(msg); err != nil {
			log.Printf("❌ Error broadcasting chat: %v\n", err)
		}
	}
}

// broadcastPeerLeft notifies when peer leaves
func broadcastPeerLeft(room *Room, peerID string) {
	msg := Message{
		Type: "peer-left",
		From: "server",
		Data: peerID,
	}

	room.Mu.RLock()
	defer room.Mu.RUnlock()

	for _, peer := range room.Peers {
		if err := peer.Conn.WriteJSON(msg); err != nil {
			log.Printf("❌ Error broadcasting peer-left: %v\n", err)
		}
	}
}
```

### Updated `main.go`

```go
package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/websocket/v2"
	"record-meet/handlers"
)

func main() {
	app := fiber.New()

	// CORS for Next.js dev server
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Content-Type, Authorization, Upgrade, Connection",
	}))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// WebSocket endpoint
	app.Get("/ws/:room/:peerId", websocket.New(handlers.HandleWebSocket))

	log.Println("🚀 Signaling server running on :3001")
	log.Fatal(app.Listen(":3001"))
}
```

---

## 🔄 Event Flow (Phase 1)

```
Client A                              Server                         Client B
  │                                     │                              │
  ├─── join room:abc ──────────────────>│                              │
  │                                     ├─── notify "new-peer:A" ─────>│
  │                                     │                              │
  │                    Client B joins                                  │
  │                                     │<──── join room:abc ──────────┤
  │<──── notify "new-peer:B" ──────────┤                              │
  │                                     ├─── notify existing peers ───>│
  │                                     │                              │
  ├─── send SDP offer ───────────────>│                              │
  │                                     ├─── relay to B ──────────────>│
  │                                     │                              │
  │                            Client B processes offer               │
  │                                     │                              │
  │<────────── relay SDP answer ───────┤<────── send answer ──────────┤
  │                                     │                              │
  ├─── ICE candidate ────────────────>│                              │
  │                                     ├─── relay to B ──────────────>│
  │                                     │                              │
  │<────────── ICE candidate ──────────┤<──── ICE candidate ──────────┤
  │                                     │                              │
  └─────── P2P WebRTC connection established (media flows directly) ──┘
```

---

## 📦 Dependencies Needed

Add to `go.mod`:

```
require (
    github.com/gofiber/fiber/v2 v2.50.0
    github.com/gofiber/websocket/v2 v2.2.1
    github.com/joho/godotenv v1.5.1
)
```

Run:
```bash
go mod tidy
```

---

## ⚙️ Configuration for Phase 1

Create `.env`:
```
FIBER_PORT=3001
NEXT_JS_URL=http://localhost:3000
LOG_LEVEL=debug
```

Create `backend/config/config.go`:
```go
package config

import (
	"os"
	"log"
	"github.com/joho/godotenv"
)

type Config struct {
	Port         string
	NextJSURL    string
	LogLevel     string
}

func Load() *Config {
	godotenv.Load()

	return &Config{
		Port:      getEnv("FIBER_PORT", "3001"),
		NextJSURL: getEnv("NEXT_JS_URL", "http://localhost:3000"),
		LogLevel:  getEnv("LOG_LEVEL", "info"),
	}
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}
```

---

## 🧪 Testing Phase 1 Setup

### 1. Start Backend
```bash
cd backend
go run main.go
```

### 2. Test Health Endpoint
```bash
curl http://localhost:3001/health
# Response: {"status":"ok"}
```

### 3. Test WebSocket with `wscat` (CLI tool)
```bash
# Install wscat
npm install -g wscat

# Connect to room
wscat -c "ws://localhost:3001/ws/test-room/peer-1"

# In another terminal
wscat -c "ws://localhost:3001/ws/test-room/peer-2"

# Send message from first terminal
> {"type":"offer","from":"peer-1","to":"peer-2","data":{"sdp":"..."}}

# Should see in second terminal
< {"type":"offer","from":"peer-1","to":"peer-2","data":{"sdp":"..."}}
```

---

## 🚀 What's Next (After Phase 1)

**Phase 2** (audio/video):
- Frontend connects to `/ws/:room/:peerId`
- Backend relays SDP offers/answers
- Frontend handles ICE candidates
- **Backend code stays mostly the same** ✅

**Phase 3** (multi-user):
- Room service handles multiple peers
- Broadcasting still works ✅
- Just scale up the goroutines

---

## 📚 Fiber Resources

- **Official Docs**: https://docs.gofiber.io
- **WebSocket Guide**: https://docs.gofiber.io/guide/routing#websocket
- **GitHub**: https://github.com/gofiber/fiber

---

## ✅ Why Not the Others?

### ❌ Gin
- Requires external WebSocket library (`gorilla/websocket`)
- Heavier middleware setup
- Less ideal for real-time (more latency)

### ❌ Chi
- Minimalist approach (good for APIs, not real-time)
- WebSocket support is less integrated
- Overkill for this use case

### ✅ **Fiber**
- WebSocket built-in → less boilerplate
- Express.js-like → quick to learn
- Blazing fast routing → critical for low-latency signaling
- Perfect for this project 🎯

---

**Ready to build Phase 1?** Start with the `main.go` and `handlers/websocket.go` above!
