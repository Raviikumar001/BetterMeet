# Google Meet Clone - Implementation Plan

**Project**: Real-time Video Meeting Platform with Recording  
**Stack**: Next.js (Frontend) + Go (Backend) + WebRTC + MediaRecorder  
**Complexity**: Medium | **Timeline**: 8-12 weeks (MVP → Production)

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────┐
│        CLIENT (Next.js 14+)                 │
│  WebRTC | WebSocket | MediaRecorder         │
└──────────────────┬──────────────────────────┘
                   │ WS + SDP/ICE
                   ▼
┌─────────────────────────────────────────────┐
│      BACKEND (Go: Fiber/Gin/Chi)            │
│  Room Manager | Signaling | Chat Broadcast │
└──────────────────┬──────────────────────────┘
                   │ STUN/TURN
                   ▼
┌─────────────────────────────────────────────┐
│    STUN/TURN (Google STUN + Coturn)         │
│    NAT Traversal & Connection Fallback      │
└─────────────────────────────────────────────┘
```

---

## 🚀 Phased Implementation Plan

### **PHASE 1: Foundation & MVP Setup** (Weeks 1-2)
**Goal**: Basic 1-on-1 video call with signaling

#### Frontend Structure
```
frontend/
├── app/
│   ├── (auth)/
│   │   └── page.jsx                # Landing page
│   ├── room/
│   │   └── [id]/
│   │       └── page.jsx            # Room page
│   ├── layout.jsx                  # Root layout with Tailwind
│   └── page.jsx                    # Home
├── components/
│   ├── VideoCall.jsx               # Main video call UI
│   ├── RemoteVideo.jsx             # Remote peer video element
│   ├── LocalVideo.jsx              # Local camera feed
│   ├── Controls.jsx                # Control buttons
│   └── ...
├── hooks/
│   ├── useWebRTC.js                # WebRTC peer connection logic
│   └── useWebSocket.js             # WebSocket connection management
├── lib/
│   ├── rtc-config.js               # STUN/TURN servers config
│   ├── socket-events.js            # WebSocket event constants
│   └── utils.js                    # Helper functions
├── public/
├── next.config.js
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

#### Backend Structure
```
backend/
├── main.go                         # Entry point
├── handlers/
│   └── websocket.go               # WS server & signaling
├── models/
│   ├── room.go                    # Room structure
│   └── peer.go                    # Peer connection metadata
├── utils/
│   └── constants.go               # Event types, configs
├── go.mod
├── go.sum
└── Dockerfile
```

#### Deliverables
- [ ] Vite + React project with basic UI
- [ ] Go Fiber/Gin server with WebSocket handler
- [ ] RTCPeerConnection setup (no actual media yet)
- [ ] Signaling flow: offer → answer → ICE candidates
- [ ] Test with localhost 2-person call

#### Key Files to Create
| File | Purpose |
|------|---------|
| `frontend/src/hooks/useWebRTC.js` | Manage WebRTC peer connection lifecycle |
| `backend/handlers/websocket.go` | Handle join/leave, relay SDP/ICE |
| `backend/models/room.go` | Room state & peer tracking |

---

### **PHASE 2: Audio & Video Streaming** (Weeks 3-4)
**Goal**: 1-on-1 call with working audio/video

#### Frontend Updates
```
frontend/app/
├── room/
│   └── [id]/
│       ├── page.jsx               # Main room page
│       ├── layout.jsx             # Room layout
│       └── components/
│           ├── VideoCall.jsx
│           ├── RemoteVideo.jsx
│           ├── LocalVideo.jsx
│           └── Controls.jsx
├── hooks/
│   └── useMediaStream.js          # NEW: Get user media
└── lib/
    └── media-constraints.js        # NEW: Audio/video quality settings
```

#### Backend Updates
- Add ICE candidate handling (relay candidates between peers)
- Improve room state management

#### Deliverables
- [ ] `navigator.mediaDevices.getUserMedia()` integration
- [ ] Render `<video>` elements with MediaStream
- [ ] Mute/unmute & camera toggle buttons
- [ ] ICE candidate exchange working
- [ ] Test 1-on-1 call with audio/video on localhost

#### Key APIs
```javascript
// Frontend: Get media
const stream = await navigator.mediaDevices.getUserMedia({ 
  audio: true, 
  video: { width: 1280, height: 720 } 
});

// Frontend: Add to peer connection
stream.getTracks().forEach(track => 
  peerConnection.addTrack(track, stream)
);
```

---

### **PHASE 3: Multi-User Rooms** (Weeks 5-6)
**Goal**: Support 3+ participants in a room (mesh topology)

#### Frontend Updates
```
frontend/app/
├── room/
│   └── [id]/
│       ├── page.jsx               # Join room by ID
│       └── components/
│           ├── GridLayout.jsx     # NEW: Display multiple videos
│           ├── Participant.jsx    # NEW: Individual participant card
│           ├── RoomLobby.jsx      # NEW: Lobby before joining
│           └── VideoCall.jsx      # Refactor for multi-user
├── hooks/
│   └── usePeerConnections.js      # NEW: Manage multiple P2P connections
└── context/
    └── RoomContext.js             # NEW: Share room state across components
```

#### Backend Updates
```
backend/
├── handlers/
│   ├── websocket.go               # Update for room broadcast
│   └── rooms.go                   # NEW: Room management handlers
├── models/
│   └── room.go                    # Update: track multiple peers
└── services/
    └── room-service.go            # NEW: Centralized room logic
```

#### Deliverables
- [ ] Room URL generation (e.g., `meet.local/room/abc123`)
- [ ] Multiple WebRTC connections (one per peer)
- [ ] Grid layout displaying all participants
- [ ] Broadcasting new participant to existing peers
- [ ] Peer disconnect handling (cleanup)
- [ ] Test 4-person call

#### Key Concept
Each peer connects to every other peer (mesh):
```
A ↔ B
A ↔ C
B ↔ C
(For 4+ participants, consider SFU in Phase 7)
```

---

### **PHASE 4: Text Chat** (Weeks 7)
**Goal**: Real-time chat messages in room

#### Frontend Updates
```
frontend/app/
├── room/
│   └── [id]/
│       └── components/
│           ├── ChatPanel.jsx      # NEW: Chat UI
│           ├── MessageList.jsx    # NEW: Scrollable messages
│           └── MessageInput.jsx   # NEW: Send message input
└── hooks/
    └── useChat.js                 # NEW: Chat message handling
```

#### Backend Updates
```
backend/
├── handlers/
│   ├── websocket.go               # Add chat broadcast logic
│   └── chat.go                    # NEW: Chat message handling
└── models/
    └── message.go                 # NEW: Message structure
```

#### Deliverables
- [ ] Chat message UI (left panel or bottom panel)
- [ ] WebSocket broadcast of messages to room peers
- [ ] Timestamp & sender name display
- [ ] (Optional) Store chat history in memory/Redis

#### WebSocket Message Flow
```json
// Client sends
{ "type": "chat", "room": "abc", "text": "Hello!", "sender": "Alice" }

// Server broadcasts
{ "type": "chat", "text": "Hello!", "sender": "Alice", "timestamp": "2025-01-15T10:30:00Z" }
```

---

### **PHASE 5: Screen Sharing** (Weeks 8-9)
**Goal**: Share desktop/window with participants

#### Frontend Updates
```
frontend/app/
├── room/
│   └── [id]/
│       ├── page.jsx
│       └── components/
│           ├── ScreenShareButton.jsx  # NEW: Start/stop button
│           ├── ScreenView.jsx         # NEW: Display shared screen
│           ├── PictureInPicture.jsx   # NEW: Show camera over screen
│           └── Controls.jsx           # Update with screen share toggle
├── hooks/
│   └── useScreenShare.js              # NEW: getDisplayMedia() logic
└── lib/
    └── screen-constraints.js          # NEW: Screen quality settings
```

#### Deliverables
- [ ] `navigator.mediaDevices.getDisplayMedia()` integration
- [ ] Toggle between camera & screen share
- [ ] Display shared screen to all peers
- [ ] Picture-in-picture (show camera while sharing screen)
- [ ] Stop sharing button with fallback to camera

#### Key API
```javascript
// Frontend: Get screen
const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
  video: { cursor: "always" } 
});

// Replace video track in peer connection
const screenTrack = screenStream.getVideoTracks()[0];
const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
await sender.replaceTrack(screenTrack);
```

---

### **PHASE 6: Local Recording** (Weeks 10-11)
**Goal**: Record meeting locally as .webm file

#### Frontend Updates
```
frontend/app/
├── room/
│   └── [id]/
│       └── components/
│           └── RecordingControls.jsx  # NEW: Record/stop/download buttons
├── hooks/
│   └── useRecorder.js                 # NEW: MediaRecorder logic
└── lib/
    └── recorder-utils.js              # NEW: File handling & download
```

#### Deliverables
- [ ] MediaRecorder API integration
- [ ] Combine audio/video tracks into single stream
- [ ] Record button in UI (start/stop)
- [ ] Download recording as `.webm` file
- [ ] Show recording status/timer

#### Key Code Pattern
```javascript
// Frontend: Create combined stream
const canvas = new HTMLCanvasElement();
const ctx = canvas.getContext('2d');
// Composite video tracks onto canvas
// Mix audio from all peers

const stream = canvas.captureStream(30);
stream.addTrack(audioMix);

const recorder = new MediaRecorder(stream, { 
  mimeType: 'video/webm;codecs=vp9' 
});

recorder.ondataavailable = (event) => {
  // Download blob as file
  const url = URL.createObjectURL(event.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meeting-${Date.now()}.webm`;
  a.click();
};

recorder.start();
```

---

### **PHASE 7: Production Hardening & Deployment** (Weeks 12+)
**Goal**: Deploy with security, reliability, and scalability

#### Features
```
backend/
├── config/
│   └── config.go                  # NEW: Environment-based config
├── auth/
│   └── jwt.go                     # NEW: Room tokens & auth
├── middleware/
│   └── cors.go                    # NEW: CORS headers
├── logging/
│   └── logger.go                  # NEW: Request/error logging
└── Dockerfile                     # NEW: Docker image
```

#### Frontend
```
frontend/
├── app/
│   ├── api/                       # API routes (optional for auth)
│   ├── room/
│   │   └── [id]/
│   │       ├── page.jsx
│   │       └── layout.jsx
│   ├── layout.jsx
│   └── page.jsx
├── components/
├── hooks/
├── lib/
├── .env.production                # NEW: Production API URL
├── next.config.js                 # NEW: Production build config
└── public/                        # NEW: Static assets (favicon, etc)
```

#### Deliverables
- [ ] **TURN Server**: Deploy Coturn or use Xirsys/Twilio
- [ ] **JWT Auth**: Room tokens with expiration
- [ ] **Rate Limiting**: Prevent abuse
- [ ] **Error Handling**: Graceful fallbacks
- [ ] **Logging**: Server-side request/error logs
- [ ] **Docker**: Containerize backend
- [ ] **Nginx**: Reverse proxy for static files + API routing
- [ ] **HTTPS**: SSL certificates (Let's Encrypt)
- [ ] **Database** (Optional): Store chat history, user sessions
- [ ] **CDN**: Serve frontend assets globally
- [ ] **Monitoring**: Uptime, error tracking (Sentry, etc)

#### Deployment Architecture
```
┌──────────────────────────────────────┐
│        Nginx (Reverse Proxy)         │
│  - Static files (React bundle)       │
│  - /api/* → Go backend               │
│  - /ws → WebSocket upgrade           │
└────────┬─────────────────────────────┘
         │
    ┌────┴──────────────────┐
    │                       │
┌───▼─────┐          ┌──────▼────┐
│ Go App  │ ← Redis ─│ Go App 2   │
│ (Primary)│          │(Replication)
└─────────┘          └────────────┘
```

#### Optional Enhancements
- [ ] SFU (Selective Forwarding Unit) for 10+ participants
- [ ] Mobile app (React Native)
- [ ] Virtual backgrounds
- [ ] Call recording to cloud (S3)
- [ ] Analytics dashboard
- [ ] User presence indicators

---

## 📅 Timeline Summary

| Phase | Duration | Key Deliverable | Difficulty |
|-------|----------|-----------------|------------|
| 1 | Weeks 1-2 | 1-on-1 signaling + connection | ⭐⭐ Low |
| 2 | Weeks 3-4 | Audio/video streaming | ⭐⭐ Low |
| 3 | Weeks 5-6 | Multi-user mesh topology | ⭐⭐⭐ Medium |
| 4 | Week 7 | Text chat | ⭐ Very Low |
| 5 | Weeks 8-9 | Screen sharing | ⭐⭐⭐ Medium |
| 6 | Weeks 10-11 | Local recording + download | ⭐⭐ Low |
| 7 | Week 12+ | Production deployment | ⭐⭐⭐⭐ High |

**MVP (Phases 1-2)**: 4 weeks  
**Full Features (Phases 1-6)**: 11 weeks  
**Production Ready (All)**: 12+ weeks

---

## 🔧 Technology Recommendations

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API + useReducer
- **WebRTC Library**: Simple native WebRTC APIs (no heavy library needed)
- **Testing**: Jest + React Testing Library

### Backend
- **Framework**: Fiber (fastest Go framework)
- **WebSocket**: nhooyr.io/websocket (modern, low-level)
- **Concurrency**: Goroutines + Channels (built-in)
- **Testing**: testify + httptest
- **Logging**: logrus or zap

### Infrastructure
- **STUN**: Google stun.l.google.com:19302 (free, start here)
- **TURN**: Self-host Coturn or use Xirsys
- **Deployment**: Docker + Kubernetes or Docker Compose + VPS
- **Database**: PostgreSQL (if needed later)
- **Cache**: Redis (optional, for chat history)

---

## 🎯 Success Criteria by Phase

### Phase 1 ✓
- [ ] Two browsers can initiate P2P connection
- [ ] Signaling messages exchanged via WebSocket
- [ ] No errors in console

### Phase 2 ✓
- [ ] Audio/video streams flowing both directions
- [ ] Video elements display live feeds
- [ ] Mute/unmute works
- [ ] Latency < 500ms

### Phase 3 ✓
- [ ] 4 participants can join same room
- [ ] Each peer connects to all others
- [ ] Grid displays all videos
- [ ] Peer disconnect removes video properly

### Phase 4 ✓
- [ ] Chat messages appear instantly
- [ ] Messages persist in memory during session
- [ ] Sender name & timestamp visible

### Phase 5 ✓
- [ ] Screen share starts without crashing
- [ ] All peers see shared screen
- [ ] Camera falls back on stop share
- [ ] No audio loss during share

### Phase 6 ✓
- [ ] Recording starts and stops cleanly
- [ ] Downloaded .webm plays in browser
- [ ] Audio from all peers is audible
- [ ] File size reasonable (< 500MB for 30-min call)

### Phase 7 ✓
- [ ] Public URL works (https)
- [ ] Survives network changes (TURN)
- [ ] Handles 50+ concurrent users
- [ ] No memory leaks
- [ ] Error tracking active

---

## 📝 Next Steps

1. **Start Phase 1** with folder structure above
2. **Install dependencies**:
   ```bash
   # Frontend
   npx create-next-app@latest frontend --typescript --tailwind
   npm install
   
   # Backend
   go mod init record-meet
   go get github.com/gofiber/fiber/v2
   go get nhooyr.io/websocket
   ```
3. **Implement WebSocket server** first (backend/handlers/websocket.go)
4. **Build React components** for video elements
5. **Test on localhost** before moving to Phase 2

---

## ⚠️ Gotchas to Watch

1. **CORS**: Enable CORS for WebSocket connections in Go
2. **Localhost limitations**: Some features (screen share) may require HTTPS even locally
3. **Memory usage**: Each additional peer = another connection; watch for leaks
4. **Browser support**: Ensure WebRTC support across target browsers
5. **Network conditions**: TURN/STUN becomes critical in production

---

## 💡 Alternative Architectures (if needed later)

### **SFU (Selective Forwarding Unit)** - for 10+ participants
Replace mesh topology with central relay:
- Frontend → Go backend (receives stream)
- Go backend → All other frontends (broadcasts)
- **Pro**: Better bandwidth usage, lower CPU
- **Con**: Higher server cost, added latency

### **MCU (Multipoint Conferencing Unit)** - for recording/mixing
- Frontend streams → Go backend
- Go backend mixes into single video
- All frontends receive mixed feed
- **Pro**: Easy to record, uniform experience
- **Con**: Much higher server cost, complexity

For now, **mesh (Phase 3) is perfect for 3-6 participants**.

---

## 📚 Resources

- **WebRTC**: https://webrtc.org
- **MDN WebRTC Guide**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- **Go Fiber Docs**: https://docs.gofiber.io
- **MediaRecorder API**: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- **Coturn**: https://github.com/coturn/coturn

---

**Last Updated**: November 2025  
**Status**: Ready for Phase 1 Implementation
