package handlers

import (
	"strconv"

	"github.com/desamart/backend/internal/services"
	"github.com/desamart/backend/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// AdminHandler handles HTTP requests for admin operations
type AdminHandler struct {
	adminService *services.AdminService
}

// NewAdminHandler creates a new instance of AdminHandler
func NewAdminHandler() *AdminHandler {
	return &AdminHandler{adminService: services.NewAdminService()}
}

// GetDashboardStats handles GET /api/v1/admin/dashboard
func (h *AdminHandler) GetDashboardStats(c *fiber.Ctx) error {
	stats, err := h.adminService.GetDashboardStats()
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal mengambil statistik dashboard", nil)
	}

	return utils.SuccessResponse(c, 200, "Statistik dashboard berhasil diambil", stats)
}

// GetAllUsers handles GET /api/v1/admin/users
func (h *AdminHandler) GetAllUsers(c *fiber.Ctx) error {
	var params services.UserQueryParams
	params.Search = c.Query("search")
	params.Page, _ = strconv.Atoi(c.Query("page", "1"))
	params.Limit, _ = strconv.Atoi(c.Query("limit", "20"))

	users, total, err := h.adminService.GetAllUsers(params)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal mengambil data pengguna", nil)
	}

	return utils.PaginatedResponse(c, users, params.Page, params.Limit, int(total))
}

// GetUserDetail handles GET /api/v1/admin/users/:id
func (h *AdminHandler) GetUserDetail(c *fiber.Ctx) error {
	idStr := c.Params("id")
	userID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	detail, err := h.adminService.GetUserDetail(userID)
	if err != nil {
		return utils.ErrorResponse(c, 404, "Pengguna tidak ditemukan", nil)
	}

	return utils.SuccessResponse(c, 200, "Detail pengguna berhasil diambil", detail)
}

// WarnUser handles PUT /api/v1/admin/users/:id/warn
func (h *AdminHandler) WarnUser(c *fiber.Ctx) error {
	adminIDVal := c.Locals("user_id")
	adminID, _ := adminIDVal.(uuid.UUID)

	idStr := c.Params("id")
	userID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	type WarnRequest struct {
		Message string `json:"message" validate:"required,min=5"`
	}

	var req WarnRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Format request tidak valid", nil)
	}

	if len(req.Message) < 5 {
		return utils.ErrorResponse(c, 400, "Pesan peringatan minimal 5 karakter", nil)
	}

	warning, err := h.adminService.WarnUser(adminID, userID, req.Message)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal memberikan peringatan", nil)
	}

	return utils.SuccessResponse(c, 200, "Peringatan berhasil dikirim", warning)
}

// DeactivateUser handles PUT /api/v1/admin/users/:id/deactivate
func (h *AdminHandler) DeactivateUser(c *fiber.Ctx) error {
	adminIDVal := c.Locals("user_id")
	adminID, _ := adminIDVal.(uuid.UUID)

	idStr := c.Params("id")
	userID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	err = h.adminService.DeactivateUser(adminID, userID)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal menonaktifkan pengguna", nil)
	}

	return utils.SuccessResponse(c, 200, "Pengguna berhasil dinonaktifkan", nil)
}

// GetAllProducts handles GET /api/v1/admin/products
func (h *AdminHandler) GetAllProducts(c *fiber.Ctx) error {
	var params services.AdminProductQueryParams
	params.Search = c.Query("search")
	params.Status = c.Query("status")
	params.Page, _ = strconv.Atoi(c.Query("page", "1"))
	params.Limit, _ = strconv.Atoi(c.Query("limit", "20"))

	products, total, err := h.adminService.GetAllProducts(params)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal mengambil data produk", nil)
	}

	return utils.PaginatedResponse(c, products, params.Page, params.Limit, int(total))
}

// AdminDeleteProduct handles DELETE /api/v1/admin/products/:id
func (h *AdminHandler) AdminDeleteProduct(c *fiber.Ctx) error {
	adminIDVal := c.Locals("user_id")
	adminID, _ := adminIDVal.(uuid.UUID)

	idStr := c.Params("id")
	productID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	err = h.adminService.AdminDeleteProduct(adminID, productID)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal menghapus produk", nil)
	}

	return utils.SuccessResponse(c, 200, "Produk berhasil dihapus oleh admin", nil)
}

// GetAllComplaints handles GET /api/v1/admin/complaints
func (h *AdminHandler) GetAllComplaints(c *fiber.Ctx) error {
	var params services.ComplaintQueryParams
	params.Status = c.Query("status")
	params.Category = c.Query("category")
	params.Page, _ = strconv.Atoi(c.Query("page", "1"))
	params.Limit, _ = strconv.Atoi(c.Query("limit", "20"))

	complaints, total, err := h.adminService.GetAllComplaints(params)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal mengambil data aduan", nil)
	}

	return utils.PaginatedResponse(c, complaints, params.Page, params.Limit, int(total))
}

// GetComplaintDetail handles GET /api/v1/admin/complaints/:id
func (h *AdminHandler) GetComplaintDetail(c *fiber.Ctx) error {
	idStr := c.Params("id")
	complaintID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	complaint, err := h.adminService.GetComplaintDetail(complaintID)
	if err != nil {
		return utils.ErrorResponse(c, 404, "Aduan tidak ditemukan", nil)
	}

	return utils.SuccessResponse(c, 200, "Detail aduan berhasil diambil", complaint)
}

// HandleComplaint handles PUT /api/v1/admin/complaints/:id/action
func (h *AdminHandler) HandleComplaint(c *fiber.Ctx) error {
	adminIDVal := c.Locals("user_id")
	adminID, _ := adminIDVal.(uuid.UUID)

	idStr := c.Params("id")
	complaintID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	var req services.ComplaintActionRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Format request tidak valid", nil)
	}

	// Validation
	if req.Status == "" {
		return utils.ErrorResponse(c, 400, "Status wajib diisi", nil)
	}
	if (req.Status == "resolved" || req.Status == "closed") && req.Action == "" {
		return utils.ErrorResponse(c, 400, "Tindakan wajib dipilih untuk status resolved/closed", nil)
	}
	if len(req.Note) < 5 {
		return utils.ErrorResponse(c, 400, "Catatan minimal 5 karakter", nil)
	}

	complaint, err := h.adminService.HandleComplaint(adminID, complaintID, req)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal memproses aduan", nil)
	}

	return utils.SuccessResponse(c, 200, "Aduan berhasil diproses", complaint)
}
