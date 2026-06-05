package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/desamart/backend/internal/config"
	"github.com/desamart/backend/internal/database"
	"github.com/desamart/backend/internal/handlers"
	"github.com/desamart/backend/internal/middleware"
	"github.com/desamart/backend/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// 1. Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// 2. Load config
	cfg := config.LoadConfig()

	// 3. Connect to Database & Redis
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to databases: %v", err)
	}

	// 4. Auto-migrate models
	db := database.GetDB()
	db.AutoMigrate(&models.User{}, &models.Product{}, &models.Order{}, &models.Category{}, &models.Complaint{}, &models.AdminWarning{})
	log.Println("Database migration completed")

	// Seed default admin
	if err := database.SeedAdmin(); err != nil {
		log.Printf("Warning: Failed to seed admin: %v", err)
	}

	// 5. Initialize Fiber App
	app := fiber.New(fiber.Config{
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	})

	// 6. Middleware
	app.Use(logger.New())
	
	// CORS configuration
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Adjust in production
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
	}))
	
	// Rate Limiter: 100 requests per minute per IP
	app.Use(limiter.New(limiter.Config{
		Max:        100,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Too many requests, please try again later.",
			})
		},
	}))

	// 7. Routes
	api := app.Group("/api/v1")

	// Serve static files for uploads
	app.Static("/uploads", "./uploads")

	// Health Check (Public)
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": "ok",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	// Initialize Handlers
	authHandler := handlers.NewAuthHandler()
	productHandler := handlers.NewProductHandler()
	orderHandler := handlers.NewOrderHandler()
	chatHandler := handlers.NewChatHandler()
	adminHandler := handlers.NewAdminHandler()

	// Auth Routes (Public)
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/logout", authHandler.Logout)
	auth.Post("/forgot-password", authHandler.ForgotPassword)
	auth.Post("/reset-password", authHandler.ResetPassword)
	auth.Get("/profile", middleware.AuthRequired(), authHandler.GetProfile)
	auth.Put("/profile", middleware.AuthRequired(), authHandler.UpdateProfile)

	// Products Routes (Mixed)
	products := api.Group("/products")
	products.Get("/", productHandler.GetProducts)
	products.Get("/my", middleware.AuthRequired(), productHandler.GetMyProducts)
	products.Get("/:id", productHandler.GetProductByID)
	products.Post("/", middleware.AuthRequired(), productHandler.CreateProduct)
	products.Put("/:id", middleware.AuthRequired(), productHandler.UpdateProduct)
	products.Delete("/:id", middleware.AuthRequired(), productHandler.DeleteProduct)

	// Orders Routes (Authenticated)
	orders := api.Group("/orders")
	orders.Use(middleware.AuthRequired())
	orders.Post("/", orderHandler.CreateOrder)
	orders.Get("/buyer", orderHandler.GetBuyerOrders)
	orders.Get("/seller", orderHandler.GetSellerOrders)
	orders.Get("/:id", orderHandler.GetOrderDetail)
	orders.Put("/:id/status", orderHandler.UpdateOrderStatus)
	orders.Put("/:id/cancel", orderHandler.CancelOrder)
	orders.Put("/:id/confirm", orderHandler.ConfirmOrderCompleted)

	// Chat Routes (Authenticated)
	chat := api.Group("/chat")
	chat.Use(middleware.AuthRequired())
	chat.Post("/message", chatHandler.ProcessMessage)
	chat.Get("/history", chatHandler.GetChatHistory)

	// Admin Routes (Admin Only)
	admin := api.Group("/admin")
	admin.Use(middleware.AuthRequired(), middleware.AdminRequired())
	admin.Get("/stats", adminHandler.GetDashboardStats)
	admin.Get("/users", adminHandler.GetAllUsers)
	admin.Put("/users/:id/warn", adminHandler.WarnUser)
	admin.Put("/users/:id/deactivate", adminHandler.DeactivateUser)
	admin.Get("/products", adminHandler.GetAllProducts)
	admin.Delete("/products/:id", adminHandler.AdminDeleteProduct)
	admin.Get("/complaints", adminHandler.GetAllComplaints)
	admin.Put("/complaints/:id/action", adminHandler.HandleComplaint)

	// 8. Graceful Shutdown
	go func() {
		log.Printf("Server starting on port %s", cfg.ServerPort)
		if err := app.Listen(":" + cfg.ServerPort); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	<-sigChan // Block until a signal is received
	log.Println("Shutting down server...")

	if err := app.Shutdown(); err != nil {
		log.Printf("Error during shutdown: %v", err)
	}

	log.Println("Server stopped")
}
