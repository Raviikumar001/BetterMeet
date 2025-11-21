package models

import (
	"sync"

	"github.com/gofiber/websocket/v2"
)

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
	Mu   sync.Mutex
}

// Send sends a message to the peer in a thread-safe manner
func (p *Peer) Send(msg Message) error {
	p.Mu.Lock()
	defer p.Mu.Unlock()
	return p.Conn.WriteJSON(msg)
}

// Message represents a signaling message
type Message struct {
	Type string      `json:"type"` // "offer", "answer", "ice", "chat", "new-peer", "peer-left"
	Room string      `json:"room"`
	From string      `json:"from"`
	To   string      `json:"to"`
	Data interface{} `json:"data"`
}

// AddPeer adds a peer to the room
func (r *Room) AddPeer(peer *Peer) {
	r.Mu.Lock()
	defer r.Mu.Unlock()
	r.Peers[peer.ID] = peer
}

// RemovePeer removes a peer from the room
func (r *Room) RemovePeer(peerID string) {
	r.Mu.Lock()
	defer r.Mu.Unlock()
	delete(r.Peers, peerID)
}

// PeerCount returns the number of peers in the room
func (r *Room) PeerCount() int {
	r.Mu.RLock()
	defer r.Mu.RUnlock()
	return len(r.Peers)
}

// GetPeer returns a peer by ID
func (r *Room) GetPeer(peerID string) (*Peer, bool) {
	r.Mu.RLock()
	defer r.Mu.RUnlock()
	peer, exists := r.Peers[peerID]
	return peer, exists
}

// BroadcastToAll sends a message to all peers in the room
func (r *Room) BroadcastToAll(msg Message) {
	r.Mu.RLock()
	peers := make([]*Peer, 0, len(r.Peers))
	for _, peer := range r.Peers {
		peers = append(peers, peer)
	}
	r.Mu.RUnlock()

	for _, peer := range peers {
		_ = peer.Send(msg)
	}
}

// BroadcastToOthers sends a message to all peers except the sender
func (r *Room) BroadcastToOthers(senderID string, msg Message) {
	r.Mu.RLock()
	peers := make([]*Peer, 0, len(r.Peers))
	for peerID, peer := range r.Peers {
		if peerID != senderID {
			peers = append(peers, peer)
		}
	}
	r.Mu.RUnlock()

	for _, peer := range peers {
		_ = peer.Send(msg)
	}
}
