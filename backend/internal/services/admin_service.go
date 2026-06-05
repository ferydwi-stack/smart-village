package services

import (
	"time"

	"github.com/desamart/backend/internal/database"
	"github.com/desamart/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AdminService handles business logic for admin operations
type AdminService struct {
	db *gorm.DB
}

// NewAdminService creates a new instance of AdminService
func NewAdminService() *AdminService {
	return &AdminService{db: database.GetDB()}
}

// DashboardStats represents dashboard statistics
type DashboardStats struct {
	TotalUsers        int64          `json:"total_users"`
	TotalProducts     int64          `json:"total_products"`
	TodayOrders       int64          `json:"today_orders"`
	PendingComplaints int64          `json:"pending_complaints"`
	ComplaintsByCat   map[string]int `json:"complaints_by_category"`
}

// UserDetailResponse represents user details with counts
type UserDetailResponse struct {
	User              models.UserResponse `json:"user"`
	TotalProducts     int64               `json:"total_products"`
	TotalOrdersBuyer  int64               `json:"total_orders_buyer"`
	TotalOrdersSeller int64               `json:"total_orders_seller"`
	TotalComplaints   int64               `json:"total_complaints"`
	TotalWarnings     int64               `json:"total_warnings"`
}

// UserQueryParams represents filters for getting users
type UserQueryParams struct {
	Search string
	Page   int
	Limit  int
}

// AdminProductQueryParams represents filters for getting products by admin
type AdminProductQueryParams struct {
	Search string
	Status string
	Page   int
	Limit  int
}

// ComplaintQueryParams represents filters for getting complaints
type ComplaintQueryParams struct {
	Status   string
	Category string
	Page     int
	Limit    int
}

// GetDashboardStats retrieves statistics for the admin dashboard
func (s *AdminService) GetDashboardStats() (*DashboardStats, error) {
	var stats DashboardStats
	stats.ComplaintsByCat = make(map[string]int)

	s.db.Model(&models.User{}).Where("role = ?", "user").Count(&stats.TotalUsers)
	s.db.Model(&models.Product{}).Where("status = ?", "active").Count(&stats.TotalProducts)
	
	today := time.Now().Truncate(24 * time.Hour)
	s.db.Model(&models.Order{}).Where("created_at >= ?", today).Count(&stats.TodayOrders)
	
	s.db.Model(&models.Complaint{}).Where("status = ?", "open").Count(&stats.PendingComplaints)

	// Complaints by category
	var results []struct {
		Category string
		Count    int
	}
	s.db.Model(&models.Complaint{}).Select("category, count(*) as count").Group("category").Scan(&results)
	
	for _, r := range results {
		stats.ComplaintsByCat[r.Category] = r.Count
	}

	return &stats, nil
}

// GetAllUsers retrieves users with search and pagination
func (s *AdminService) GetAllUsers(params UserQueryParams) ([]models.UserResponse, int64, error) {
	var users []models.User
	var total int64

	query := s.db.Model(&models.User{}).Where("role = ?", "user")

	if params.Search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ?", "%"+params.Search+"%", "%"+params.Search+"%")
	}

	query.Count(&total)

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.Limit <= 0 {
		params.Limit = 20
	}
	offset := (params.Page - 1) * params.Limit

	err := query.Order("created_at DESC").Limit(params.Limit).Offset(offset).Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	var response []models.UserResponse
	for _, u := range users {
		response = append(response, u.ToResponse())
	}

	return response, total, nil
}

// GetUserDetail retrieves user detail with activity counts
func (s *AdminService) GetUserDetail(userID uuid.UUID) (*UserDetailResponse, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	res := UserDetailResponse{
		User: user.ToResponse(),
	}

	s.db.Model(&models.Product{}).Where("seller_id = ?", userID).Count(&res.TotalProducts)
	s.db.Model(&models.Order{}).Where("buyer_id = ?", userID).Count(&res.TotalOrdersBuyer)
	s.db.Model(&models.Order{}).Where("seller_id = ?", userID).Count(&res.TotalOrdersSeller)
	s.db.Model(&models.Complaint{}).Where("user_id = ?", userID).Count(&res.TotalComplaints)
	s.db.Model(&models.AdminWarning{}).Where("user_id = ?", userID).Count(&res.TotalWarnings)

	return &res, nil
}

// WarnUser creates a warning for a user
func (s *AdminService) WarnUser(adminID, userID uuid.UUID, message string) (*models.AdminWarning, error) {
	warning := models.AdminWarning{
		UserID:  userID,
		AdminID: adminID,
		Message: message,
	}

	if err := s.db.Create(&warning).Error; err != nil {
		return nil, err
	}

	return &warning, nil
}

// DeactivateUser deactivates a user and their products
func (s *AdminService) DeactivateUser(adminID, userID uuid.UUID) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.User{}).Where("id = ?", userID).Update("is_active", false).Error; err != nil {
			return err
		}

		// Deactivate products
		if err := tx.Model(&models.Product{}).Where("seller_id = ?", userID).Update("status", "inactive").Error; err != nil {
			return err
		}

		return nil
	})
}

// GetAllProducts retrieves products for admin
func (s *AdminService) GetAllProducts(params AdminProductQueryParams) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	query := s.db.Model(&models.Product{})

	if params.Search != "" {
		query = query.Where("name ILIKE ?", "%"+params.Search+"%")
	}
	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}

	query.Count(&total)

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.Limit <= 0 {
		params.Limit = 20
	}
	offset := (params.Page - 1) * params.Limit

	err := query.Preload("Seller").Order("created_at DESC").Limit(params.Limit).Offset(offset).Find(&products).Error
	return products, total, err
}

// AdminDeleteProduct soft deletes a product by admin
func (s *AdminService) AdminDeleteProduct(adminID, productID uuid.UUID) error {
	return s.db.Model(&models.Product{}).Where("id = ?", productID).Update("status", "deleted").Error
}

// GetAllComplaints retrieves complaints for admin
func (s *AdminService) GetAllComplaints(params ComplaintQueryParams) ([]models.Complaint, int64, error) {
	var complaints []models.Complaint
	var total int64

	query := s.db.Model(&models.Complaint{})

	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}
	if params.Category != "" {
		query = query.Where("category = ?", params.Category)
	}

	query.Count(&total)

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.Limit <= 0 {
		params.Limit = 20
	}
	offset := (params.Page - 1) * params.Limit

	err := query.Preload("User").Order("created_at DESC").Limit(params.Limit).Offset(offset).Find(&complaints).Error
	return complaints, total, err
}

// GetComplaintDetail retrieves full complaint detail for admin
func (s *AdminService) GetComplaintDetail(complaintID uuid.UUID) (*models.Complaint, error) {
	var complaint models.Complaint
	err := s.db.Preload("User").Preload("Messages", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at ASC")
	}).First(&complaint, "id = ?", complaintID).Error

	return &complaint, err
}

// ComplaintActionRequest represents request to handle complaint
type ComplaintActionRequest struct {
	Status string `json:"status" validate:"required,oneof=in_progress resolved closed"`
	Action string `json:"action" validate:"required_if=Status resolved required_if=Status closed,oneof=warning product_deleted account_suspended no_action"`
	Note   string `json:"note" validate:"required,min=5"`
}

// HandleComplaint handles complaint and takes destructive actions if needed
func (s *AdminService) HandleComplaint(adminID, complaintID uuid.UUID, req ComplaintActionRequest) (*models.Complaint, error) {
	var complaint models.Complaint
	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&complaint, "id = ?", complaintID).Error; err != nil {
			return err
		}

		complaint.Status = req.Status
		complaint.AdminAction = &req.Action
		complaint.AdminNote = &req.Note

		if req.Status == "resolved" || req.Status == "closed" {
			now := time.Now()
			complaint.ResolvedAt = &now
		}

		if err := tx.Save(&complaint).Error; err != nil {
			return err
		}

		// Take action based on req.Action
		switch req.Action {
		case "warning":
			if complaint.OrderID != nil {
				var order models.Order
				if err := tx.First(&order, "id = ?", *complaint.OrderID).Error; err == nil {
					warning := models.AdminWarning{
						UserID:      order.SellerID,
						AdminID:     adminID,
						ComplaintID: &complaint.ID,
						Message:     req.Note,
					}
					if err := tx.Create(&warning).Error; err != nil {
						return err
					}
				}
			}
		case "product_deleted":
			if complaint.OrderID != nil {
				var order models.Order
				if err := tx.First(&order, "id = ?", *complaint.OrderID).Error; err == nil {
					if err := tx.Model(&models.Product{}).Where("id = ?", order.ProductID).Update("status", "deleted").Error; err != nil {
						return err
					}
				}
			}
		case "account_suspended":
			if complaint.OrderID != nil {
				var order models.Order
				if err := tx.First(&order, "id = ?", *complaint.OrderID).Error; err == nil {
					if err := tx.Model(&models.User{}).Where("id = ?", order.SellerID).Update("is_active", false).Error; err != nil {
						return err
					}
					// Also deactivate products
					if err := tx.Model(&models.Product{}).Where("seller_id = ?", order.SellerID).Update("status", "inactive").Error; err != nil {
						return err
					}
				}
			}
		}

		// Add admin message to thread
		msg := models.ComplaintMessage{
			ComplaintID: complaint.ID,
			Sender:      "admin",
			Message:     req.Note,
		}
		if err := tx.Create(&msg).Error; err != nil {
			return err
		}

		return nil
	})

	return &complaint, err
}
