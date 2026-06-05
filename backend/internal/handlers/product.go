package handlers

import (
	"os"
	"path/filepath"
	"strconv"

	"github.com/desamart/backend/internal/database"
	"github.com/desamart/backend/internal/models"
	"github.com/desamart/backend/internal/services"
	"github.com/desamart/backend/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// ProductHandler handles HTTP requests for products
type ProductHandler struct {
	productService *services.ProductService
}

// NewProductHandler creates a new instance of ProductHandler
func NewProductHandler() *ProductHandler {
	return &ProductHandler{productService: services.NewProductService()}
}

// GetProducts handles GET /api/v1/products
func (h *ProductHandler) GetProducts(c *fiber.Ctx) error {
	var params services.ProductQueryParams

	params.Search = c.Query("search")
	params.Sort = c.Query("sort")
	
	if c.Query("category") != "" {
		categoryParam := c.Query("category")
		catID, err := strconv.Atoi(categoryParam)
		if err == nil {
			uintCatID := uint(catID)
			params.CategoryID = &uintCatID
		} else {
			// Find category by name if it's a string
			var category struct {
				ID uint
			}
			db := database.GetDB()
			if err := db.Table("categories").Where("name = ?", categoryParam).Select("id").First(&category).Error; err == nil {
				params.CategoryID = &category.ID
			} else {
				// If category not found, set to a non-existent ID to return empty results
				invalidID := uint(999999)
				params.CategoryID = &invalidID
			}
		}
	}
	
	if c.Query("min_price") != "" {
		min, _ := strconv.ParseFloat(c.Query("min_price"), 64)
		params.MinPrice = &min
	}
	
	if c.Query("max_price") != "" {
		max, _ := strconv.ParseFloat(c.Query("max_price"), 64)
		params.MaxPrice = &max
	}

	params.Page, _ = strconv.Atoi(c.Query("page", "1"))
	params.Limit, _ = strconv.Atoi(c.Query("limit", "20"))

	products, total, err := h.productService.GetProducts(params)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal mengambil data produk", nil)
	}

	return utils.PaginatedResponse(c, products, params.Page, params.Limit, int(total))
}

// GetProductByID handles GET /api/v1/products/:id
func (h *ProductHandler) GetProductByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	product, err := h.productService.GetProductByID(id)
	if err != nil {
		return utils.ErrorResponse(c, 404, "Produk tidak ditemukan", nil)
	}

	return utils.SuccessResponse(c, 200, "Produk berhasil diambil", product)
}

// CreateProduct handles POST /api/v1/products
func (h *ProductHandler) CreateProduct(c *fiber.Ctx) error {
	sellerIDVal := c.Locals("user_id")
	sellerID, ok := sellerIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	form, err := c.MultipartForm()
	if err != nil {
		return utils.ErrorResponse(c, 400, "Format data tidak valid", nil)
	}

	// Parse non-file fields
	name := c.FormValue("name")
	description := c.FormValue("description")
	price, _ := strconv.ParseFloat(c.FormValue("price"), 64)
	stock, _ := strconv.Atoi(c.FormValue("stock"))
	
	var categoryID *uint
	if c.FormValue("category_id") != "" {
		catID, _ := strconv.Atoi(c.FormValue("category_id"))
		uintCatID := uint(catID)
		categoryID = &uintCatID
	}

	// Validation
	if len(name) < 3 {
		return utils.ErrorResponse(c, 400, "Nama minimal 3 karakter", nil)
	}
	if len(description) < 10 {
		return utils.ErrorResponse(c, 400, "Deskripsi minimal 10 karakter", nil)
	}
	if price < 100 {
		return utils.ErrorResponse(c, 400, "Harga minimal 100", nil)
	}
	if stock < 0 {
		return utils.ErrorResponse(c, 400, "Stok tidak boleh negatif", nil)
	}
	if categoryID == nil {
		return utils.ErrorResponse(c, 400, "Kategori wajib diisi", nil)
	}

	// Handle file uploads
	files := form.File["images"]
	if len(files) > 5 {
		return utils.ErrorResponse(c, 400, "Maksimal 5 gambar diperbolehkan", nil)
	}

	// Ensure directory exists
	uploadDir := "./uploads/products/"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return utils.ErrorResponse(c, 500, "Gagal memproses folder unggahan", nil)
	}

	var imageUrls []string
	for _, file := range files {
		// Validate size (max 2MB)
		if file.Size > 2*1024*1024 {
			return utils.ErrorResponse(c, 400, "Ukuran gambar maksimal 2MB", nil)
		}

		// Validate type
		ext := filepath.Ext(file.Filename)
		if ext != ".jpg" && ext != ".png" && ext != ".webp" {
			return utils.ErrorResponse(c, 400, "Format gambar harus jpg, png, atau webp", nil)
		}

		filename := uuid.New().String() + ext
		filePath := uploadDir + filename

		if err := c.SaveFile(file, filePath); err != nil {
			return utils.ErrorResponse(c, 500, "Gagal menyimpan gambar", nil)
		}

		imageUrls = append(imageUrls, "/uploads/products/"+filename)
	}

	req := models.CreateProductRequest{
		CategoryID:  categoryID,
		Name:        name,
		Description: description,
		Price:       price,
		Stock:       stock,
		Images:      imageUrls,
	}

	product, err := h.productService.CreateProduct(sellerID, req)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error(), nil)
	}

	return utils.SuccessResponse(c, 201, "Produk berhasil dibuat", product)
}

// UpdateProduct handles PUT /api/v1/products/:id
func (h *ProductHandler) UpdateProduct(c *fiber.Ctx) error {
	sellerIDVal := c.Locals("user_id")
	sellerID, ok := sellerIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	idStr := c.Params("id")
	productID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	var req models.UpdateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Format request tidak valid", nil)
	}

	product, err := h.productService.UpdateProduct(sellerID, productID, req)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error(), nil)
	}

	return utils.SuccessResponse(c, 200, "Produk berhasil diperbarui", product)
}

// DeleteProduct handles DELETE /api/v1/products/:id
func (h *ProductHandler) DeleteProduct(c *fiber.Ctx) error {
	sellerIDVal := c.Locals("user_id")
	sellerID, ok := sellerIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	idStr := c.Params("id")
	productID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.ErrorResponse(c, 400, "ID tidak valid", nil)
	}

	err = h.productService.DeleteProduct(sellerID, productID)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error(), nil)
	}

	return utils.SuccessResponse(c, 200, "Produk berhasil dihapus", nil)
}

// GetMyProducts handles GET /api/v1/products/my
func (h *ProductHandler) GetMyProducts(c *fiber.Ctx) error {
	sellerIDVal := c.Locals("user_id")
	sellerID, ok := sellerIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	products, total, err := h.productService.GetMyProducts(sellerID, page, limit)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal mengambil data produk saya", nil)
	}

	return utils.PaginatedResponse(c, products, page, limit, int(total))
}
