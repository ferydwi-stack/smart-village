package services

import (
	"github.com/desamart/backend/internal/database"
	"github.com/desamart/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ChatService handles business logic for chat and complaints
type ChatService struct {
	db        *gorm.DB
	nlpClient *NLPClient
}

// NewChatService creates a new instance of ChatService
func NewChatService() *ChatService {
	return &ChatService{
		db:        database.GetDB(),
		nlpClient: NewNLPClient(),
	}
}

// ChatResponse represents the response after processing a message
type ChatResponse struct {
	Kategori    string    `json:"kategori"`
	Confidence  float64   `json:"confidence"`
	Response    string    `json:"response"`
	ComplaintID uuid.UUID `json:"complaint_id"`
}

// ProcessMessage processes a user message, calls NLP, and persists data
func (s *ChatService) ProcessMessage(userID uuid.UUID, message string) (*ChatResponse, error) {
	nlpResp, err := s.nlpClient.ClassifyMessage(message)
	if err != nil {
		// Fallback if hard error occurs
		nlpResp = &NLPResponse{
			Kategori:   "Lainnya",
			Confidence: 0,
			Response:   "Maaf, layanan chatbot sedang tidak tersedia. Silakan coba lagi nanti.",
		}
	}

	status := "open"
	if nlpResp.Kategori == "FAQ" {
		status = "closed" // Auto-resolved
	}

	complaint := models.Complaint{
		UserID:      userID,
		Category:    nlpResp.Kategori,
		Confidence:  &nlpResp.Confidence,
		RawMessage:  message,
		BotResponse: &nlpResp.Response,
		Status:      status,
	}

	if err := s.db.Create(&complaint).Error; err != nil {
		return nil, err
	}

	// Create complaint_message records
	userMsg := models.ComplaintMessage{
		ComplaintID: complaint.ID,
		Sender:      "user",
		Message:     message,
	}
	botMsg := models.ComplaintMessage{
		ComplaintID: complaint.ID,
		Sender:      "bot",
		Message:     nlpResp.Response,
	}

	s.db.Create(&userMsg)
	s.db.Create(&botMsg)

	return &ChatResponse{
		Kategori:    nlpResp.Kategori,
		Confidence:  nlpResp.Confidence,
		Response:    nlpResp.Response,
		ComplaintID: complaint.ID,
	}, nil
}

// GetChatHistory retrieves complaint history for a user
func (s *ChatService) GetChatHistory(userID uuid.UUID, page, limit int) ([]models.Complaint, int64, error) {
	var complaints []models.Complaint
	var total int64

	query := s.db.Model(&models.Complaint{}).Where("user_id = ?", userID)

	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 20
	}
	offset := (page - 1) * limit

	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&complaints).Error
	if err != nil {
		return nil, 0, err
	}

	return complaints, total, nil
}

// GetComplaintDetail retrieves a complaint with full message history
func (s *ChatService) GetComplaintDetail(userID, complaintID uuid.UUID) (*models.Complaint, error) {
	var complaint models.Complaint
	err := s.db.Preload("Messages", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at ASC")
	}).First(&complaint, "id = ?", complaintID).Error

	if err != nil {
		return nil, err
	}

	// Verify ownership
	if complaint.UserID != userID {
		return nil, gorm.ErrRecordNotFound // Return not found for unauthorized access
	}

	return &complaint, nil
}
