package services

import (
	"errors"
	"time"

	"github.com/desamart/backend/internal/database"
	"github.com/desamart/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// OrderService handles business logic for orders
type OrderService struct {
	db *gorm.DB
}

// NewOrderService creates a new instance of OrderService
func NewOrderService() *OrderService {
	return &OrderService{db: database.GetDB()}
}

// OrderResponse represents the safe order data to return
type OrderResponse struct {
	ID              uuid.UUID `json:"id"`
	BuyerID         uuid.UUID `json:"buyer_id"`
	SellerID        uuid.UUID `json:"seller_id"`
	ProductID       uuid.UUID `json:"product_id"`
	Quantity        int       `json:"quantity"`
	TotalPrice      float64   `json:"total_price"`
	ShippingAddress string    `json:"shipping_address"`
	Note            *string   `json:"note"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// OrderDetailResponse represents full order detail with history
type OrderDetailResponse struct {
	OrderResponse
	Buyer   UserInfo              `json:"buyer"`
	Seller  UserInfo              `json:"seller"`
	Product ProductInfo           `json:"product"`
	History []models.OrderHistory `json:"history"`
}

// UserInfo represents minimal user data
type UserInfo struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	AvatarURL *string   `json:"avatar_url"`
	Address   string    `json:"address,omitempty"`
}

// ProductInfo represents minimal product data
type ProductInfo struct {
	ID     uuid.UUID `json:"id"`
	Name   string    `json:"name"`
	Images []string  `json:"images"`
	Price  float64   `json:"price"`
}

// CreateOrder creates a new order and decreases product stock
func (s *OrderService) CreateOrder(buyerID uuid.UUID, req models.CreateOrderRequest) (*OrderResponse, error) {
	var orderResponse *OrderResponse

	err := s.db.Transaction(func(tx *gorm.DB) error {
		var product models.Product
		if err := tx.First(&product, "id = ?", req.ProductID).Error; err != nil {
			return errors.New("Produk tidak ditemukan atau tidak aktif")
		}

		if product.Status != "active" {
			return errors.New("Produk tidak ditemukan atau tidak aktif")
		}

		if product.Stock < req.Quantity {
			return errors.New("Stok tidak mencukupi")
		}

		totalPrice := product.Price * float64(req.Quantity)

		// Decrease product stock
		product.Stock -= req.Quantity
		if err := tx.Save(&product).Error; err != nil {
			return err
		}

		// Create order
		order := models.Order{
			BuyerID:         buyerID,
			SellerID:        product.SellerID,
			ProductID:       req.ProductID,
			Quantity:        req.Quantity,
			TotalPrice:      totalPrice,
			ShippingAddress: req.ShippingAddress,
			Note:            req.Note,
			Status:          "pending",
		}

		if err := tx.Create(&order).Error; err != nil {
			return err
		}

		// Create initial order history
		note := "Pesanan dibuat"
		history := models.OrderHistory{
			OrderID: order.ID,
			Status:  "pending",
			Note:    &note,
		}

		if err := tx.Create(&history).Error; err != nil {
			return err
		}

		orderResponse = &OrderResponse{
			ID:              order.ID,
			BuyerID:         order.BuyerID,
			SellerID:        order.SellerID,
			ProductID:       order.ProductID,
			Quantity:        order.Quantity,
			TotalPrice:      order.TotalPrice,
			ShippingAddress: order.ShippingAddress,
			Note:            order.Note,
			Status:          order.Status,
			CreatedAt:       order.CreatedAt,
			UpdatedAt:       order.UpdatedAt,
		}

		return nil
	})

	return orderResponse, err
}

// GetBuyerOrders retrieves orders for a buyer
func (s *OrderService) GetBuyerOrders(buyerID uuid.UUID, status string, page, limit int) ([]OrderResponse, int64, error) {
	var orders []models.Order
	var total int64

	query := s.db.Model(&models.Order{}).Where("buyer_id = ?", buyerID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 20
	}
	offset := (page - 1) * limit

	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&orders).Error
	if err != nil {
		return nil, 0, err
	}

	var response []OrderResponse
	for _, o := range orders {
		response = append(response, orderToResponse(o))
	}

	return response, total, nil
}

// GetSellerOrders retrieves orders for a seller
func (s *OrderService) GetSellerOrders(sellerID uuid.UUID, status string, page, limit int) ([]OrderResponse, int64, error) {
	var orders []models.Order
	var total int64

	query := s.db.Model(&models.Order{}).Where("seller_id = ?", sellerID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 20
	}
	offset := (page - 1) * limit

	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&orders).Error
	if err != nil {
		return nil, 0, err
	}

	var response []OrderResponse
	for _, o := range orders {
		response = append(response, orderToResponse(o))
	}

	return response, total, nil
}

// GetOrderDetail retrieves full order detail
func (s *OrderService) GetOrderDetail(orderID, userID uuid.UUID) (*OrderDetailResponse, error) {
	var order models.Order
	err := s.db.Preload("Product").Preload("Buyer").Preload("Seller").Preload("History", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at ASC")
	}).First(&order, "id = ?", orderID).Error

	if err != nil {
		return nil, err
	}

	// Verify user is either buyer or seller
	if order.BuyerID != userID && order.SellerID != userID {
		return nil, errors.New("Anda tidak memiliki akses ke pesanan ini")
	}

	res := OrderDetailResponse{
		OrderResponse: orderToResponse(order),
		Buyer: UserInfo{
			ID:        order.Buyer.ID,
			Name:      order.Buyer.Name,
			AvatarURL: order.Buyer.AvatarURL,
			Address:   order.Buyer.Address,
		},
		Seller: UserInfo{
			ID:        order.Seller.ID,
			Name:      order.Seller.Name,
			AvatarURL: order.Seller.AvatarURL,
		},
		Product: ProductInfo{
			ID:     order.Product.ID,
			Name:   order.Product.Name,
			Images: order.Product.Images.Data(),
			Price:  order.Product.Price,
		},
		History: order.History,
	}

	return &res, nil
}

// UpdateOrderStatus updates order status by seller
func (s *OrderService) UpdateOrderStatus(sellerID, orderID uuid.UUID, req models.UpdateOrderStatusRequest) (*OrderResponse, error) {
	var order models.Order
	if err := s.db.First(&order, "id = ?", orderID).Error; err != nil {
		return nil, err
	}

	// Verify seller ownership
	if order.SellerID != sellerID {
		return nil, errors.New("Anda tidak memiliki akses ke pesanan ini")
	}

	// Validate status transition
	valid := false
	if order.Status == "pending" && req.Status == "processing" {
		valid = true
	} else if order.Status == "processing" && req.Status == "shipped" {
		valid = true
	}

	if !valid {
		return nil, errors.New("Status pesanan tidak dapat diubah")
	}

	order.Status = req.Status

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		history := models.OrderHistory{
			OrderID: order.ID,
			Status:  req.Status,
			Note:    req.Note,
		}

		return tx.Create(&history).Error
	})

	if err != nil {
		return nil, err
	}

	res := orderToResponse(order)
	return &res, nil
}

// ConfirmOrderCompleted marks order as completed by buyer
func (s *OrderService) ConfirmOrderCompleted(buyerID, orderID uuid.UUID) (*OrderResponse, error) {
	var order models.Order
	if err := s.db.First(&order, "id = ?", orderID).Error; err != nil {
		return nil, err
	}

	if order.BuyerID != buyerID {
		return nil, errors.New("Anda tidak memiliki akses ke pesanan ini")
	}

	if order.Status != "shipped" {
		return nil, errors.New("Status pesanan tidak dapat diubah")
	}

	order.Status = "completed"

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		note := "Pesanan selesai dikonfirmasi oleh pembeli"
		history := models.OrderHistory{
			OrderID: order.ID,
			Status:  "completed",
			Note:    &note,
		}

		return tx.Create(&history).Error
	})

	if err != nil {
		return nil, err
	}

	res := orderToResponse(order)
	return &res, nil
}

// CancelOrder cancels order by buyer
func (s *OrderService) CancelOrder(buyerID, orderID uuid.UUID, reason string) (*OrderResponse, error) {
	var orderResponse *OrderResponse

	err := s.db.Transaction(func(tx *gorm.DB) error {
		var order models.Order
		if err := tx.First(&order, "id = ?", orderID).Error; err != nil {
			return err
		}

		if order.BuyerID != buyerID {
			return errors.New("Anda tidak memiliki akses ke pesanan ini")
		}

		if order.Status != "pending" {
			return errors.New("Pesanan hanya dapat dibatalkan saat status menunggu")
		}

		// Restore product stock
		var product models.Product
		if err := tx.First(&product, "id = ?", order.ProductID).Error; err == nil {
			product.Stock += order.Quantity
			if err := tx.Save(&product).Error; err != nil {
				return err
			}
		}

		order.Status = "cancelled"
		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		history := models.OrderHistory{
			OrderID: order.ID,
			Status:  "cancelled",
			Note:    &reason,
		}

		if err := tx.Create(&history).Error; err != nil {
			return err
		}

		orderResponse = &OrderResponse{
			ID:              order.ID,
			BuyerID:         order.BuyerID,
			SellerID:        order.SellerID,
			ProductID:       order.ProductID,
			Quantity:        order.Quantity,
			TotalPrice:      order.TotalPrice,
			ShippingAddress: order.ShippingAddress,
			Note:            order.Note,
			Status:          order.Status,
			CreatedAt:       order.CreatedAt,
			UpdatedAt:       order.UpdatedAt,
		}

		return nil
	})

	return orderResponse, err
}

// Helper to convert models.Order to OrderResponse
func orderToResponse(o models.Order) OrderResponse {
	return OrderResponse{
		ID:              o.ID,
		BuyerID:         o.BuyerID,
		SellerID:        o.SellerID,
		ProductID:       o.ProductID,
		Quantity:        o.Quantity,
		TotalPrice:      o.TotalPrice,
		ShippingAddress: o.ShippingAddress,
		Note:            o.Note,
		Status:          o.Status,
		CreatedAt:       o.CreatedAt,
		UpdatedAt:       o.UpdatedAt,
	}
}
