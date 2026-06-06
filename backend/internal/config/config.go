package config

import (
	"os"
	"strconv"
)

// Config holds all the configuration for the application
type Config struct {
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	RedisURL       string
	JWTSecret      string
	JWTExpiryHours int
	NLPServiceURL  string
	ServerPort     string
}

// LoadConfig loads the configuration from environment variables
func LoadConfig() *Config {
	jwtExpiry, _ := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "24"))

	return &Config{
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "5432"),
		DBUser:         getEnv("DB_USER", "desamart_user"),
		DBPassword:     getEnv("DB_PASSWORD", "desamart_password"),
		DBName:         getEnv("DB_NAME", "desamart_db"),
		RedisURL:       getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:      getEnv("JWT_SECRET", "your_jwt_secret_key_here"),
		JWTExpiryHours: jwtExpiry,
		NLPServiceURL:  getEnv("NLP_SERVICE_URL", "https://fery.pythonanywhere.com"),
		ServerPort:     getEnv("SERVER_PORT", "8080"),
	}
}

// getEnv is a helper function to read an environment variable or return a fallback value
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
