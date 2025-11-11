package main

import (
	"fmt"
	"log"
	"os"

	"record-meet/handlers"

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

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Record Meet API v1.0.0",
	})

	// CORS middleware for development
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000, http://localhost:3001, http://127.0.0.1:3000",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Content-Type, Authorization, Upgrade, Connection",
	}))

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"time":   c.Context().Time(),
		})
	})

	// WebSocket endpoint for signaling
	app.Get("/ws/:room/:peerId", handlers.HandleWebSocket)

	// Root endpoint
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Record Meet Backend API",
			"version": "1.0.0",
			"endpoints": fiber.Map{
				"health":    "GET /health",
				"websocket": "GET /ws/:room/:peerId",
			},
		})
	})

	// 404 handler
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(404).JSON(fiber.Map{
			"error": "Not Found",
			"path":  c.Path(),
		})
	})

	// Print startup banner
	printBanner(port)

	// Start server
	log.Fatal(app.Listen(":" + port))
}

func printBanner(port string) {
	banner := `
╔════════════════════════════════════════════════════════╗
║                                                        ║
║          🚀 Record Meet Backend Started                ║
║                                                        ║
║  Port:   :` + port + `                                  ║
║  Health: http://localhost:` + port + `/health           ║
║  WS:     ws://localhost:` + port + `/ws/:room/:peerId   ║
║                                                        ║
║  Status: Ready for connections                        ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
`
	fmt.Println(banner)
}
