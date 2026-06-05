package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// Product represents the products table in database
type Product struct {
	ID          uuid.UUID                    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	SellerID    uuid.UUID                    `gorm:"type:uuid;not null" json:"seller_id"`
	CategoryID  *uint                        `json:"category_id"`
	Name        string                       `gorm:"size:200;not null" json:"name"`
	Description string                       `gorm:"type:text;not null" json:"description"`
	Price       float64                      `gorm:"type:decimal(15,2);not null" json:"price"`
	Stock       int                          `gorm:"not null;default:0" json:"stock"`
	Images      datatypes.JSONType[[]string] `gorm:"type:jsonb;default:'[]'" json:"images"`
	Status      string                       `gorm:"size:20;default:active" json:"status"`
	CreatedAt   time.Time                    `json:"created_at"`
	UpdatedAt   time.Time                    `json:"updated_at"`

	Seller   User     `gorm:"foreignKey:SellerID" json:"seller,omitempty"`
	Category Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

// TableName specifies the table name for GORM
func (Product) TableName() string {
	return "products"
}

// DTOs

type CreateProductRequest struct {
	CategoryID  *uint    `json:"category_id"`
	Name        string   `json:"name" validate:"required,min=2,max=200"`
	Description string   `json:"description" validate:"required"`
	Price       float64  `json:"price" validate:"required,gt=0"`
	Stock       int      `json:"stock" validate:"required,gte=0"`
	Images      []string `json:"images"`
}

type UpdateProductRequest struct {
	CategoryID  *uint    `json:"category_id"`
	Name        string   `json:"name" validate:"omitempty,min=2,max=200"`
	Description string   `json:"description"`
	Price       float64  `json:"price" validate:"omitempty,gt=0"`
	Stock       int      `json:"stock" validate:"omitempty,gte=0"`
	Images      []string `json:"images"`
	Status      string   `json:"status" validate:"omitempty,oneof=active inactive deleted"`
}
