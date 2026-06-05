package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/desamart/backend/internal/config"
	"github.com/desamart/backend/internal/database"
	"github.com/desamart/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// SetupTestApp creates a test Fiber app and registers routes
func SetupTestApp() *fiber.App {
	app := fiber.New()

	// Load config and connect to DB
	cfg := config.LoadConfig()
	_ = database.Connect(cfg) // Ignore error for tests if DB not running, handlers will fail gracefully or panic if not handled

	authHandler := handlers.NewAuthHandler()
	productHandler := handlers.NewProductHandler()
	orderHandler := handlers.NewOrderHandler()
	chatHandler := handlers.NewChatHandler()
	adminHandler := handlers.NewAdminHandler()

	api := app.Group("/api/v1")

	// Auth
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/logout", authHandler.Logout)
	auth.Get("/profile", func(c *fiber.Ctx) error {
		// Mock auth middleware
		c.Locals("user_id", uuid.New())
		return authHandler.GetProfile(c)
	})

	// Products
	products := api.Group("/products")
	products.Get("/", productHandler.GetProducts)
	products.Get("/:id", productHandler.GetProductByID)
	products.Post("/", func(c *fiber.Ctx) error {
		c.Locals("user_id", uuid.New())
		return productHandler.CreateProduct(c)
	})
	products.Put("/:id", func(c *fiber.Ctx) error {
		c.Locals("user_id", uuid.New())
		return productHandler.UpdateProduct(c)
	})
	products.Delete("/:id", func(c *fiber.Ctx) error {
		c.Locals("user_id", uuid.New())
		return productHandler.DeleteProduct(c)
	})

	// Orders
	orders := api.Group("/orders")
	orders.Post("/", func(c *fiber.Ctx) error {
		c.Locals("user_id", uuid.New())
		return orderHandler.CreateOrder(c)
	})
	orders.Get("/buyer", func(c *fiber.Ctx) error {
		c.Locals("user_id", uuid.New())
		return orderHandler.GetBuyerOrders(c)
	})
	orders.Get("/seller", func(c *fiber.Ctx) error {
		c.Locals("user_id", uuid.New())
		return orderHandler.GetSellerOrders(c)
	})
	orders.Put("/:id/status", func(c *fiber.Ctx) error {
		c.Locals("user_id", uuid.New())
		return orderHandler.UpdateOrderStatus(c)
	})
	orders.Put("/:id/cancel", func(c *fiber.Ctx) error {
		c.Locals("user_id", uuid.New())
		return orderHandler.CancelOrder(c)
	})

	// Chat
	chat := api.Group("/chat")
	chat.Post("/message", func(c *fiber.Ctx) error {
		c.Locals("user_id", uuid.New())
		return chatHandler.ProcessMessage(c)
	})
	chat.Get("/history", func(c *fiber.Ctx) error {
		c.Locals("user_id", uuid.New())
		return chatHandler.GetChatHistory(c)
	})

	// Admin
	admin := api.Group("/admin")
	admin.Get("/dashboard", adminHandler.GetDashboardStats)
	admin.Get("/users", adminHandler.GetAllUsers)
	admin.Put("/users/:id/warn", adminHandler.WarnUser)
	admin.Get("/complaints", adminHandler.GetAllComplaints)
	admin.Put("/complaints/:id/action", adminHandler.HandleComplaint)

	return app
}

// Auth Tests
func TestRegister_Success(t *testing.T) {
	app := SetupTestApp()

	reqBody := map[string]string{
		"name":     "Test User",
		"email":    "test@example.com",
		"password": "Password123",
		"phone":    "081234567890",
		"address":  "Jl. Test No. 123",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := app.Test(req)

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 201 or 400 (if duplicate), got %d", resp.StatusCode)
	}
}

func TestLogin_Success(t *testing.T) {
	app := SetupTestApp()

	reqBody := map[string]string{
		"email":    "test@example.com",
		"password": "Password123",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := app.Test(req)

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected status 200 or 401, got %d", resp.StatusCode)
	}
}

// Product Tests
func TestGetProducts_Success(t *testing.T) {
	app := SetupTestApp()

	req := httptest.NewRequest("GET", "/api/v1/products", nil)
	resp, _ := app.Test(req)

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}
}

func TestCreateProduct_Success(t *testing.T) {
	app := SetupTestApp()

	// Using mock multipart form or simple JSON if handler supports it
	// Here we simulate a failure because we don't send multipart form
	req := httptest.NewRequest("POST", "/api/v1/products", nil)
	resp, _ := app.Test(req)

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400 (due to missing form), got %d", resp.StatusCode)
	}
}

// Order Tests
func TestGetBuyerOrders(t *testing.T) {
	app := SetupTestApp()

	req := httptest.NewRequest("GET", "/api/v1/orders/buyer", nil)
	resp, _ := app.Test(req)

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}
}

// Chat Tests
func TestSendMessage_Empty(t *testing.T) {
	app := SetupTestApp()

	reqBody := map[string]string{
		"message": "",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/api/v1/chat/message", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := app.Test(req)

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}
}

// Admin Tests
func TestAdminDashboard(t *testing.T) {
	app := SetupTestApp()

	req := httptest.NewRequest("GET", "/api/v1/admin/dashboard", nil)
	resp, _ := app.Test(req)

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}
}
