package models

// ChatMessage represents a text message sent in a room
type ChatMessage struct {
	Type      string `json:"type"` // "chat"
	RoomID    string `json:"room"`
	Text      string `json:"text"`
	Sender    string `json:"sender"`    // Peer ID or Name
	Timestamp string `json:"timestamp"` // ISO 8601
}
