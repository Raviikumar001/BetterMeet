package handlers

import (
	"record-meet/services"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// CreateRoom handles creating a new room with a unique ID
func CreateRoom(c *fiber.Ctx) error {
	roomID := uuid.New().String()
	room := services.GetOrCreateRoom(roomID)

	return c.JSON(fiber.Map{
		"roomId": room.ID,
		"peers":  room.PeerCount(),
	})
}

// GetRoom handles checking if a room exists and getting its details
func GetRoom(c *fiber.Ctx) error {
	roomID := c.Params("id")
	room, exists := services.GetRoom(roomID)

	if !exists {
		return c.Status(404).JSON(fiber.Map{
			"error": "Room not found",
		})
	}

	return c.JSON(fiber.Map{
		"roomId": room.ID,
		"peers":  room.PeerCount(),
	})
}
