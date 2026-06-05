package handlers

import (
	"strconv"

	"github.com/desamart/backend/internal/services"
	"github.com/desamart/backend/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// ChatHandler handles HTTP requests for chat and complaints
type ChatHandler struct {
	chatService *services.ChatService
}

// NewChatHandler creates a new instance of ChatHandler
func NewChatHandler() *ChatHandler {
	return &ChatHandler{chatService: services.NewChatService()}
}

// ProcessMessage handles POST /api/v1/chat/message
func (h *ChatHandler) ProcessMessage(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	type ChatRequest struct {
		Message string `json:"message" validate:"required,min=2,max=1000"`
	}

	var req ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Format request tidak valid", nil)
	}

	if len(req.Message) < 2 || len(req.Message) > 1000 {
		return utils.ErrorResponse(c, 400, "Pesan minimal 2 karakter dan maksimal 1000 karakter", nil)
	}

	resp, err := h.chatService.ProcessMessage(userID, req.Message)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal memproses pesan", nil)
	}

	return utils.SuccessResponse(c, 200, "Pesan berhasil diproses", resp)
}

// GetChatHistory handles GET /api/v1/chat/history
func (h *ChatHandler) GetChatHistory(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	history, total, err := h.chatService.GetChatHistory(userID, page, limit)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal mengambil riwayat chat", nil)
	}

	return utils.PaginatedResponse(c, history, page, limit, int(total))
}

// GetComplaintDetail handles GET /api/v1/chat/complaint/:id
func (h *ChatHandler) GetComplaintDetail(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	idStr := c.Params("id")
	complaintID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	complaint, err := h.chatService.GetComplaintDetail(userID, complaintID)
	if err != nil {
		return utils.ErrorResponse(c, 404, "Aduan tidak ditemukan", nil)
	}

	return utils.SuccessResponse(c, 200, "Detail aduan berhasil diambil", complaint)
}
