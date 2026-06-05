package models

import (
	"time"

	"github.com/google/uuid"
)

// Complaint represents the complaints table in database
type Complaint struct {
	ID          uuid.UUID          `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID          `gorm:"type:uuid;not null" json:"user_id"`
	OrderID     *uuid.UUID         `gorm:"type:uuid" json:"order_id"`
	Category    string             `gorm:"size:50;not null" json:"category"`
	Confidence  *float64           `gorm:"type:decimal(5,4)" json:"confidence"`
	RawMessage  string             `gorm:"type:text;not null" json:"raw_message"`
	BotResponse *string            `gorm:"type:text" json:"bot_response"`
	Status      string             `gorm:"size:20;default:open" json:"status"`
	AdminAction *string            `gorm:"size:50" json:"admin_action"`
	AdminNote   *string            `gorm:"type:text" json:"admin_note"`
	ResolvedAt  *time.Time         `json:"resolved_at"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`

	User     User               `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Messages []ComplaintMessage `gorm:"foreignKey:ComplaintID" json:"messages,omitempty"`
}

// TableName specifies the table name for GORM
func (Complaint) TableName() string {
	return "complaints"
}

// ComplaintMessage represents the complaint_messages table in database
type ComplaintMessage struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ComplaintID uuid.UUID `gorm:"type:uuid;not null" json:"complaint_id"`
	Sender      string    `gorm:"size:10;not null" json:"sender"` // user, bot, admin
	Message     string    `gorm:"type:text;not null" json:"message"`
	CreatedAt   time.Time `json:"created_at"`
}

// TableName specifies the table name for GORM
func (ComplaintMessage) TableName() string {
	return "complaint_messages"
}

// DTOs

type CreateComplaintRequest struct {
	OrderID    *uuid.UUID `json:"order_id"`
	RawMessage string     `json:"raw_message" validate:"required"`
}

type AddComplaintMessageRequest struct {
	Message string `json:"message" validate:"required"`
}

type UpdateComplaintStatusRequest struct {
	Status      string  `json:"status" validate:"required,oneof=open in_progress resolved closed"`
	AdminAction *string `json:"admin_action"`
	AdminNote   *string `json:"admin_note"`
}
