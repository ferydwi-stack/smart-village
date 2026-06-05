package services

import (
	"errors"
	"time"

	"github.com/desamart/backend/internal/database"
	"github.com/desamart/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// ProductService handles business logic for products
type ProductService struct {
	db *gorm.DB
}

// NewProductService creates a new instance of ProductService
func NewProductService() *ProductService {
	return &ProductService{db: database.GetDB()}
}

// ProductQueryParams represents filters for getting products
type ProductQueryParams struct {
	Search     string
	CategoryID *uint
	MinPrice   *float64
	MaxPrice   *float64
	Sort       string
	Page       int
	Limit      int
}

// ProductResponse represents the safe product data to return
type ProductResponse struct {
	ID          uuid.UUID `json:"id"`
	SellerID    uuid.UUID `json:"seller_id"`
	CategoryID  *uint     `json:"category_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	Images      []string  `json:"images"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ProductDetailResponse represents product data with seller and category info
type ProductDetailResponse struct {
	ProductResponse
	Seller   SellerInfo    `json:"seller"`
	Category *CategoryInfo `json:"category,omitempty"`
}

// SellerInfo represents minimal seller data
type SellerInfo struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	AvatarURL *string   `json:"avatar_url"`
	CreatedAt time.Time `json:"created_at"`
}

// CategoryInfo represents minimal category data
type CategoryInfo struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

// GetProducts retrieves products with filters, sorting, and pagination
func (s *ProductService) GetProducts(params ProductQueryParams) ([]ProductResponse, int64, error) {
	var products []models.Product
	var total int64

	query := s.db.Model(&models.Product{}).Where("status = ?", "active")

	if params.Search != "" {
		query = query.Where("name ILIKE ?", "%"+params.Search+"%")
	}
	if params.CategoryID != nil {
		query = query.Where("category_id = ?", *params.CategoryID)
	}
	if params.MinPrice != nil {
		query = query.Where("price >= ?", *params.MinPrice)
	}
	if params.MaxPrice != nil {
		query = query.Where("price <= ?", *params.MaxPrice)
	}

	// Count total before pagination
	query.Count(&total)

	// Sorting
	switch params.Sort {
	case "terbaru":
		query = query.Order("created_at DESC")
	case "termurah":
		query = query.Order("price ASC")
	case "termahal":
		query = query.Order("price DESC")
	default:
		query = query.Order("created_at DESC")
	}

	// Pagination
	page := params.Page
	if page <= 0 {
		page = 1
	}
	limit := params.Limit
	if limit <= 0 {
		limit = 20
	}
	offset := (page - 1) * limit

	err := query.Preload("Seller").Preload("Category").Limit(limit).Offset(offset).Find(&products).Error
	if err != nil {
		return nil, 0, err
	}

	// Convert to response
	var response []ProductResponse
	for _, p := range products {
		response = append(response, productToResponse(p))
	}

	return response, total, nil
}

// GetProductByID retrieves a product by its ID
func (s *ProductService) GetProductByID(id uuid.UUID) (*ProductDetailResponse, error) {
	var product models.Product
	err := s.db.Preload("Seller").Preload("Category").First(&product, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	res := ProductDetailResponse{
		ProductResponse: productToResponse(product),
		Seller: SellerInfo{
			ID:        product.Seller.ID,
			Name:      product.Seller.Name,
			AvatarURL: product.Seller.AvatarURL,
			CreatedAt: product.Seller.CreatedAt,
		},
	}

	if product.Category.ID != 0 {
		res.Category = &CategoryInfo{
			ID:   product.Category.ID,
			Name: product.Category.Name,
			Slug: product.Category.Slug,
		}
	}

	return &res, nil
}

// CreateProduct creates a new product
func (s *ProductService) CreateProduct(sellerID uuid.UUID, req models.CreateProductRequest) (*ProductResponse, error) {
	// Validate category exists
	if req.CategoryID != nil {
		var count int64
		s.db.Model(&models.Category{}).Where("id = ?", *req.CategoryID).Count(&count)
		if count == 0 {
			return nil, errors.New("Kategori tidak ditemukan")
		}
	}

	product := models.Product{
		SellerID:    sellerID,
		CategoryID:  req.CategoryID,
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		Images:      datatypes.NewJSONType(req.Images),
		Status:      "active",
	}

	if err := s.db.Create(&product).Error; err != nil {
		return nil, err
	}

	res := productToResponse(product)
	return &res, nil
}

// UpdateProduct updates an existing product
func (s *ProductService) UpdateProduct(sellerID, productID uuid.UUID, req models.UpdateProductRequest) (*ProductResponse, error) {
	var product models.Product
	if err := s.db.First(&product, "id = ?", productID).Error; err != nil {
		return nil, err
	}

	// Verify ownership
	if product.SellerID != sellerID {
		return nil, errors.New("Anda tidak memiliki akses untuk mengubah produk ini")
	}

	// Update fields
	if req.CategoryID != nil {
		product.CategoryID = req.CategoryID
	}
	if req.Name != "" {
		product.Name = req.Name
	}
	if req.Description != "" {
		product.Description = req.Description
	}
	if req.Price > 0 {
		product.Price = req.Price
	}
	if req.Stock >= 0 {
		product.Stock = req.Stock
	}
	if len(req.Images) > 0 {
		product.Images = datatypes.NewJSONType(req.Images)
	}
	if req.Status != "" {
		product.Status = req.Status
	}

	if err := s.db.Save(&product).Error; err != nil {
		return nil, err
	}

	res := productToResponse(product)
	return &res, nil
}

// DeleteProduct soft deletes a product
func (s *ProductService) DeleteProduct(sellerID, productID uuid.UUID) error {
	var product models.Product
	if err := s.db.First(&product, "id = ?", productID).Error; err != nil {
		return err
	}

	// Verify ownership
	if product.SellerID != sellerID {
		return errors.New("Anda tidak memiliki akses untuk menghapus produk ini")
	}

	// Soft delete
	product.Status = "deleted"
	return s.db.Save(&product).Error
}

// GetMyProducts retrieves products for the logged-in seller
func (s *ProductService) GetMyProducts(sellerID uuid.UUID, page, limit int) ([]ProductResponse, int64, error) {
	var products []models.Product
	var total int64

	query := s.db.Model(&models.Product{}).Where("seller_id = ? AND status != ?", sellerID, "deleted")

	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 20
	}
	offset := (page - 1) * limit

	err := query.Limit(limit).Offset(offset).Find(&products).Error
	if err != nil {
		return nil, 0, err
	}

	var response []ProductResponse
	for _, p := range products {
		response = append(response, productToResponse(p))
	}

	return response, total, nil
}

// Helper to convert models.Product to ProductResponse
func productToResponse(p models.Product) ProductResponse {
	return ProductResponse{
		ID:          p.ID,
		SellerID:    p.SellerID,
		CategoryID:  p.CategoryID,
		Name:        p.Name,
		Description: p.Description,
		Price:       p.Price,
		Stock:       p.Stock,
		Images:      p.Images.Data(),
		Status:      p.Status,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}
