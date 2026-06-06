package database

import (
	"context"
	"fmt"
	"log"

	"github.com/desamart/backend/internal/config"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	db  *gorm.DB
	rdb *redis.Client
)

// Connect initializes the database and redis connections
func Connect(cfg *config.Config) error {
	var err error

	// 1. Connect to PostgreSQL
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=require",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort)
	
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}
	log.Println("Connected to PostgreSQL database")

	// 2. Connect to Redis
	opt, err := redis.ParseURL(cfg.RedisURL)
	if err != nil {
		// Fallback to simple address if not a URL
		opt = &redis.Options{
			Addr: cfg.RedisURL,
		}
	}
	
	rdb = redis.NewClient(opt)
	
	// Test Redis connection
	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("failed to connect to redis: %v", err)
	}
	log.Println("Connected to Redis")

	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return db
}

// GetRedis returns the redis client instance
func GetRedis() *redis.Client {
	return rdb
}
