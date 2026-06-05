package models

import (
	"time"

	"github.com/google/uuid"
)

// Order represents the orders table in database
type Order struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BuyerID         uuid.UUID      `gorm:"type:uuid;not null" json:"buyer_id"`
	SellerID        uuid.UUID      `gorm:"type:uuid;not null" json:"seller_id"`
	ProductID       uuid.UUID      `gorm:"type:uuid;not null" json:"product_id"`
	Quantity        int            `gorm:"not null" json:"quantity"`
	TotalPrice      float64        `gorm:"type:decimal(15,2);not null" json:"total_price"`
	ShippingAddress string         `gorm:"type:text;not null" json:"shipping_address"`
	Note            *string        `gorm:"type:text" json:"note"`
	Status          string         `gorm:"size:20;default:pending" json:"status"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`

	Buyer   User           `gorm:"foreignKey:BuyerID" json:"buyer,omitempty"`
	Seller  User           `gorm:"foreignKey:SellerID" json:"seller,omitempty"`
	Product Product        `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	History []OrderHistory `gorm:"foreignKey:OrderID" json:"history,omitempty"`
}

// TableName specifies the table name for GORM
func (Order) TableName() string {
	return "orders"
}

// OrderHistory represents the order_history table in database
type OrderHistory struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderID   uuid.UUID `gorm:"type:uuid;not null" json:"order_id"`
	Status    string    `gorm:"size:20;not null" json:"status"`
	Note      *string   `gorm:"type:text" json:"note"`
	CreatedAt time.Time `json:"created_at"`
}

// TableName specifies the table name for GORM
func (OrderHistory) TableName() string {
	return "order_history"
}

// DTOs

type CreateOrderRequest struct {
	ProductID       uuid.UUID `json:"product_id" validate:"required"`
	Quantity        int       `json:"quantity" validate:"required,gt=0"`
	ShippingAddress string    `json:"shipping_address" validate:"required"`
	Note            *string   `json:"note"`
}

type UpdateOrderStatusRequest struct {
	Status string  `json:"status" validate:"required,oneof=pending processing shipped completed cancelled"`
	Note   *string `json:"note"`
}
