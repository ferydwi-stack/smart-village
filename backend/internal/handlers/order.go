package handlers

import (
	"strconv"

	"github.com/desamart/backend/internal/models"
	"github.com/desamart/backend/internal/services"
	"github.com/desamart/backend/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// OrderHandler handles HTTP requests for orders
type OrderHandler struct {
	orderService *services.OrderService
}

// NewOrderHandler creates a new instance of OrderHandler
func NewOrderHandler() *OrderHandler {
	return &OrderHandler{orderService: services.NewOrderService()}
}

// CreateOrder handles POST /api/v1/orders
func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	buyerIDVal := c.Locals("user_id")
	buyerID, ok := buyerIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	var req models.CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Format request tidak valid", nil)
	}

	// Validation
	if req.ProductID == uuid.Nil {
		return utils.ErrorResponse(c, 400, "ID Produk wajib diisi", nil)
	}
	if req.Quantity < 1 {
		return utils.ErrorResponse(c, 400, "Jumlah minimal 1", nil)
	}
	if len(req.ShippingAddress) < 10 {
		return utils.ErrorResponse(c, 400, "Alamat pengiriman minimal 10 karakter", nil)
	}
	if req.Note != nil && len(*req.Note) > 500 {
		return utils.ErrorResponse(c, 400, "Catatan maksimal 500 karakter", nil)
	}

	order, err := h.orderService.CreateOrder(buyerID, req)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error(), nil)
	}

	return utils.SuccessResponse(c, 201, "Pesanan berhasil dibuat", order)
}

// GetBuyerOrders handles GET /api/v1/orders/buyer
func (h *OrderHandler) GetBuyerOrders(c *fiber.Ctx) error {
	buyerIDVal := c.Locals("user_id")
	buyerID, ok := buyerIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	status := c.Query("status")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	orders, total, err := h.orderService.GetBuyerOrders(buyerID, status, page, limit)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal mengambil data pesanan", nil)
	}

	return utils.PaginatedResponse(c, orders, page, limit, int(total))
}

// GetSellerOrders handles GET /api/v1/orders/seller
func (h *OrderHandler) GetSellerOrders(c *fiber.Ctx) error {
	sellerIDVal := c.Locals("user_id")
	sellerID, ok := sellerIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	status := c.Query("status")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	orders, total, err := h.orderService.GetSellerOrders(sellerID, status, page, limit)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal mengambil data pesanan", nil)
	}

	return utils.PaginatedResponse(c, orders, page, limit, int(total))
}

// GetOrderDetail handles GET /api/v1/orders/:id
func (h *OrderHandler) GetOrderDetail(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	idStr := c.Params("id")
	orderID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	order, err := h.orderService.GetOrderDetail(orderID, userID)
	if err != nil {
		return utils.ErrorResponse(c, 403, err.Error(), nil)
	}

	return utils.SuccessResponse(c, 200, "Detail pesanan berhasil diambil", order)
}

// UpdateOrderStatus handles PUT /api/v1/orders/:id/status
func (h *OrderHandler) UpdateOrderStatus(c *fiber.Ctx) error {
	sellerIDVal := c.Locals("user_id")
	sellerID, ok := sellerIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	idStr := c.Params("id")
	orderID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	var req models.UpdateOrderStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Format request tidak valid", nil)
	}

	order, err := h.orderService.UpdateOrderStatus(sellerID, orderID, req)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error(), nil)
	}

	return utils.SuccessResponse(c, 200, "Status pesanan berhasil diperbarui", order)
}

// ConfirmOrderCompleted handles PUT /api/v1/orders/:id/confirm
func (h *OrderHandler) ConfirmOrderCompleted(c *fiber.Ctx) error {
	buyerIDVal := c.Locals("user_id")
	buyerID, ok := buyerIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	idStr := c.Params("id")
	orderID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	order, err := h.orderService.ConfirmOrderCompleted(buyerID, orderID)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error(), nil)
	}

	return utils.SuccessResponse(c, 200, "Pesanan berhasil diselesaikan", order)
}

// CancelOrder handles PUT /api/v1/orders/:id/cancel
func (h *OrderHandler) CancelOrder(c *fiber.Ctx) error {
	buyerIDVal := c.Locals("user_id")
	buyerID, ok := buyerIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	idStr := c.Params("id")
	orderID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	type CancelRequest struct {
		Reason string `json:"reason" validate:"required"`
	}

	var req CancelRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Format request tidak valid", nil)
	}

	if req.Reason == "" {
		req.Reason = "Dibatalkan oleh pembeli"
	}

	order, err := h.orderService.CancelOrder(buyerID, orderID, req.Reason)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error(), nil)
	}

	return utils.SuccessResponse(c, 200, "Pesanan berhasil dibatalkan", order)
}
