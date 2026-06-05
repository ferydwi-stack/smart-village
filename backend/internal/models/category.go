package models

import "time"

// Category represents the categories table in database
type Category struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Slug      string    `gorm:"size:100;not null;uniqueIndex" json:"slug"`
	CreatedAt time.Time `json:"created_at"`
}

// TableName specifies the table name for GORM
func (Category) TableName() string {
	return "categories"
}

// DTOs

type CreateCategoryRequest struct {
	Name string `json:"name" validate:"required,min=2,max=100"`
	Slug string `json:"slug" validate:"required,min=2,max=100"`
}
