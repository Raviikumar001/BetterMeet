package services

import (
	"sync"

	"record-meet/models"
)

// roomManager manages all active rooms
type roomManager struct {
	rooms map[string]*models.Room
	mu    sync.RWMutex
}

// Instance of room manager (singleton)
var manager = &roomManager{
	rooms: make(map[string]*models.Room),
}

// GetOrCreateRoom gets an existing room or creates a new one
func GetOrCreateRoom(roomID string) *models.Room {
	manager.mu.Lock()
	defer manager.mu.Unlock()

	if room, exists := manager.rooms[roomID]; exists {
		return room
	}

	// Create new room
	newRoom := &models.Room{
		ID:    roomID,
		Peers: make(map[string]*models.Peer),
	}
	manager.rooms[roomID] = newRoom
	return newRoom
}

// GetRoom retrieves a room by ID
func GetRoom(roomID string) (*models.Room, bool) {
	manager.mu.RLock()
	defer manager.mu.RUnlock()

	room, exists := manager.rooms[roomID]
	return room, exists
}

// DeleteRoom removes a room
func DeleteRoom(roomID string) {
	manager.mu.Lock()
	defer manager.mu.Unlock()

	delete(manager.rooms, roomID)
}

// GetAllRooms returns all active rooms
func GetAllRooms() map[string]*models.Room {
	manager.mu.RLock()
	defer manager.mu.RUnlock()

	// Create a copy to avoid external mutations
	roomsCopy := make(map[string]*models.Room)
	for id, room := range manager.rooms {
		roomsCopy[id] = room
	}
	return roomsCopy
}

// GetRoomCount returns the number of active rooms
func GetRoomCount() int {
	manager.mu.RLock()
	defer manager.mu.RUnlock()

	return len(manager.rooms)
}

// GetTotalPeers returns the total number of connected peers across all rooms
func GetTotalPeers() int {
	manager.mu.RLock()
	defer manager.mu.RUnlock()

	total := 0
	for _, room := range manager.rooms {
		total += room.PeerCount()
	}
	return total
}
