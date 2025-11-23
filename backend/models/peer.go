package models

import (
	"sync"

	"github.com/gofiber/websocket/v2"
)

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
