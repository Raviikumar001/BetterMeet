package utils
package utils

// Message types for signaling
const (
	// Connection messages
	MsgTypeNewPeer   = "new-peer"
	MsgTypePeerLeft  = "peer-left"
	
	// Signaling messages
	MsgTypeOffer     = "offer"
	MsgTypeAnswer    = "answer"
	MsgTypeICE       = "ice"
	
	// Chat messages
	MsgTypeChat      = "chat"
	
	// System messages
	MsgTypeError     = "error"
	MsgTypeStatus    = "status"
)

// Error messages
const (
	ErrPeerNotFound  = "peer not found"
	ErrRoomNotFound  = "room not found"
	ErrInvalidMessage = "invalid message format"
	ErrInternalServer = "internal server error"
)

// Room status
const (
	RoomActive   = "active"
	RoomClosed   = "closed"
	RoomWaiting  = "waiting"
)

// Peer status
const (
	PeerConnected    = "connected"
	PeerDisconnected = "disconnected"
	PeerOffering     = "offering"
	PeerAnswering    = "answering"
	PeerConnecting   = "connecting"
)
