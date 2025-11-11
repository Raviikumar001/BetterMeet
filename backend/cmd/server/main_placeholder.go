package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	godotenv.Load()

	port := os.Getenv("FIBER_PORT")
	if port == "" {
		port = "3001"
	}

	app := fiber.New()

	// CORS middleware for development
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000, http://localhost:3001",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Content-Type, Authorization, Upgrade, Connection",
	}))

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"time":   c.Context().Time(),
		})
	})

	// WebSocket endpoint (placeholder)
	// TODO: Add WebSocket handler in Phase 1
	app.Get("/ws/:room/:peerId", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"error": "WebSocket handler not implemented yet",
		})
	})

	log.Println("")
	log.Println("╔════════════════════════════════════════╗")
	log.Println("║  🚀 Record Meet Backend Started        ║")
	log.Println(fmt.Sprintf("║  Port: :%s                            ║", port))
	log.Println("║  Health: http://localhost:" + port + "/health  ║")
	log.Println("╚════════════════════════════════════════╝")
	log.Println("")

	log.Fatal(app.Listen(":" + port))
}
