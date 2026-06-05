package utils

import "github.com/gofiber/fiber/v2"

// APIResponse represents the standard structure for all API responses
type APIResponse struct {
	Success    bool                `json:"success"`
	Message    string              `json:"message"`
	Data       interface{}         `json:"data,omitempty"`
	Errors     []ValidationError   `json:"errors,omitempty"`
	Pagination *PaginationMetadata `json:"pagination,omitempty"`
}

// ValidationError represents a field-specific validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// PaginationMetadata represents pagination details
type PaginationMetadata struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
	Total int `json:"total"`
}

// SuccessResponse sends a successful response
func SuccessResponse(c *fiber.Ctx, statusCode int, message string, data interface{}) error {
	return c.Status(statusCode).JSON(APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// ErrorResponse sends an error response
func ErrorResponse(c *fiber.Ctx, statusCode int, message string, errors []ValidationError) error {
	return c.Status(statusCode).JSON(APIResponse{
		Success: false,
		Message: message,
		Errors:  errors,
	})
}

// PaginatedResponse sends a response with pagination metadata
func PaginatedResponse(c *fiber.Ctx, data interface{}, page, limit, total int) error {
	return c.Status(200).JSON(APIResponse{
		Success: true,
		Message: "Data retrieved successfully",
		Data:    data,
		Pagination: &PaginationMetadata{
			Page:  page,
			Limit: limit,
			Total: total,
		},
	})
}
