package models

import (
	"time"

	"github.com/google/uuid"
)

// AdminWarning represents the admin_warnings table in database
type AdminWarning struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID  `gorm:"type:uuid;not null" json:"user_id"`
	AdminID     uuid.UUID  `gorm:"type:uuid;not null" json:"admin_id"`
	ComplaintID *uuid.UUID `gorm:"type:uuid" json:"complaint_id"`
	Message     string     `gorm:"type:text;not null" json:"message"`
	CreatedAt   time.Time  `json:"created_at"`
}

// TableName specifies the table name for GORM
func (AdminWarning) TableName() string {
	return "admin_warnings"
}

// DTOs

type CreateAdminWarningRequest struct {
	UserID      uuid.UUID  `json:"user_id" validate:"required"`
	ComplaintID *uuid.UUID `json:"complaint_id"`
	Message     string     `json:"message" validate:"required"`
}
