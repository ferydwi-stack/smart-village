package services

import (
	"errors"

	"github.com/desamart/backend/internal/database"
	"github.com/desamart/backend/internal/models"
	"github.com/desamart/backend/internal/utils"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AuthService handles business logic for authentication
type AuthService struct {
	db *gorm.DB
}

// NewAuthService creates a new instance of AuthService
func NewAuthService() *AuthService {
	return &AuthService{db: database.GetDB()}
}

// Register creates a new user and returns user data and token
func (s *AuthService) Register(req models.CreateUserRequest) (*models.UserResponse, string, error) {
	// Validate email uniqueness
	var existingUser models.User
	if err := s.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return nil, "", errors.New("Email sudah terdaftar")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		return nil, "", err
	}

	// Create user
	user := models.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Phone:        req.Phone,
		Address:      req.Address,
		Role:         "user", // Default role
		IsActive:     true,
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, "", err
	}

	// Generate JWT
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return nil, "", err
	}

	res := user.ToResponse()
	return &res, token, nil
}

// Login validates credentials and returns user data and token
func (s *AuthService) Login(req models.LoginRequest) (*models.UserResponse, string, error) {
	var user models.User
	if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return nil, "", errors.New("Email atau password salah")
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, "", errors.New("Email atau password salah")
	}

	if !user.IsActive {
		return nil, "", errors.New("Akun telah dinonaktifkan")
	}

	// Generate JWT
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return nil, "", err
	}

	res := user.ToResponse()
	return &res, token, nil
}

// GetProfile returns user profile by ID
func (s *AuthService) GetProfile(userID uuid.UUID) (*models.UserResponse, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	res := user.ToResponse()
	return &res, nil
}

// UpdateProfileRequest represents the data allowed to be updated in profile
type UpdateProfileRequest struct {
	Name      string  `json:"name"`
	Phone     string  `json:"phone"`
	Address   string  `json:"address"`
	AvatarURL *string `json:"avatar_url"`
}

// UpdateProfile updates user profile
func (s *AuthService) UpdateProfile(userID uuid.UUID, req UpdateProfileRequest) (*models.UserResponse, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	// Update allowed fields
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Address != "" {
		user.Address = req.Address
	}
	if req.AvatarURL != nil {
		user.AvatarURL = req.AvatarURL
	}

	if err := s.db.Save(&user).Error; err != nil {
		return nil, err
	}

	res := user.ToResponse()
	return &res, nil
}
