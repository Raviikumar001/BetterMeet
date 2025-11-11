package config
package config

import (
	"os"

	"github.com/joho/godotenv"
)

// Config holds application configuration
type Config struct {
	Port          string
	NextJSURL     string
	LogLevel      string
	RedisURL      string
	JWTSecret     string
	TURNServer    string
	STUNServers   string
	Environment   string
}

// Load loads configuration from environment variables
func Load() *Config {
	// Load .env file if it exists
	_ = godotenv.Load()

	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "development"
	}

	return &Config{
		Port:        getEnv("FIBER_PORT", "3001"),
		NextJSURL:   getEnv("NEXT_JS_URL", "http://localhost:3000"),
		LogLevel:    getEnv("LOG_LEVEL", "info"),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		TURNServer:  getEnv("TURN_SERVER", ""),
		STUNServers: getEnv("STUN_SERVERS", "stun:stun.l.google.com:19302"),
		Environment: env,
	}
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}

// IsDevelopment checks if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

// IsProduction checks if the environment is production
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}
