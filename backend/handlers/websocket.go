package handlers

import (
	"log"

	"record-meet/models"
	"record-meet/services"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

// HandleWebSocket handles WebSocket connections for signaling
func HandleWebSocket(c *fiber.Ctx) error {
	if websocket.IsWebSocketUpgrade(c) {
		return websocket.New(websocketHandler)(c)
	}
	return c.SendStatus(fiber.StatusUpgradeRequired)
}

// websocketHandler manages individual WebSocket connections
func websocketHandler(conn *websocket.Conn) {
	roomID := conn.Params("room")
	peerID := conn.Params("peerId")

	log.Printf("📱 Peer %s joining room %s\n", peerID, roomID)

	// Get or create room
	room := services.GetOrCreateRoom(roomID)

	// Create peer
	peer := &models.Peer{
		ID:   peerID,
		Conn: conn,
	}

	// Add peer to room
	room.AddPeer(peer)
	defer room.RemovePeer(peerID)

	// Notify existing peers about new peer
	room.BroadcastToOthers(peerID, models.Message{
		Type: "new-peer",
		From: "server",
		Data: peerID,
	})

	// Listen for messages from this peer
	for {
		msg := new(models.Message)
		if err := conn.ReadJSON(msg); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("❌ WebSocket error: %v\n", err)
			}
			break
		}

		msg.From = peerID
		msg.Room = roomID

		// Route message based on type
		handleMessage(room, msg)
	}

	log.Printf("👋 Peer %s left room %s\n", peerID, roomID)

	// Notify remaining peers that this peer left
	room.BroadcastToAll(models.Message{
		Type: "peer-left",
		From: "server",
		Data: peerID,
	})

	// Clean up empty rooms
	if room.PeerCount() == 0 {
		services.DeleteRoom(roomID)
		log.Printf("🗑️  Room %s deleted (empty)\n", roomID)
	}
}

// handleMessage routes different message types
func handleMessage(room *models.Room, msg *models.Message) {
	switch msg.Type {
	case "offer":
		// Relay offer from peer A to peer B
		relayMessage(room, msg)
		log.Printf("📤 Offer relayed: %s → %s\n", msg.From, msg.To)

	case "answer":
		// Relay answer from peer B to peer A
		relayMessage(room, msg)
		log.Printf("📤 Answer relayed: %s → %s\n", msg.From, msg.To)

	case "ice":
		// Relay ICE candidate
		relayMessage(room, msg)
		log.Printf("❄️ ICE candidate relayed: %s → %s\n", msg.From, msg.To)

	case "chat":
		// Broadcast chat to all peers
		broadcastChat(room, msg)
		log.Printf("💬 Chat from %s: %s\n", msg.From, msg.Data)

	default:
		log.Printf("⚠️  Unknown message type: %s\n", msg.Type)
	}
}

// relayMessage sends a message to a specific peer
func relayMessage(room *models.Room, msg *models.Message) {
	room.Mu.RLock()
	toPeer, exists := room.Peers[msg.To]
	room.Mu.RUnlock()

	if !exists {
		log.Printf("⚠️  Peer %s not found in room %s\n", msg.To, room.ID)
		return
	}

	if err := toPeer.Send(*msg); err != nil {
		log.Printf("❌ Error relaying message to %s: %v\n", msg.To, err)
	}
}

// broadcastChat sends chat message to all peers in room
func broadcastChat(room *models.Room, msg *models.Message) {
	room.Mu.RLock()
	defer room.Mu.RUnlock()

	for peerID, peer := range room.Peers {
		// Send to all peers
		if err := peer.Send(*msg); err != nil {
			log.Printf("❌ Error broadcasting chat to %s: %v\n", peerID, err)
		}
	}
}
