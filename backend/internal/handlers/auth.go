package handlers

import (
	"regexp"
	"strings"
	"time"

	"github.com/desamart/backend/internal/database"
	"github.com/desamart/backend/internal/models"
	"github.com/desamart/backend/internal/services"
	"github.com/desamart/backend/internal/utils"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// AuthHandler handles HTTP requests for authentication
type AuthHandler struct {
	authService *services.AuthService
}

// NewAuthHandler creates a new instance of AuthHandler
func NewAuthHandler() *AuthHandler {
	return &AuthHandler{authService: services.NewAuthService()}
}

var validate = validator.New()

func init() {
	// Custom validation for password (must contain at least 1 letter and 1 number)
	validate.RegisterValidation("password_strength", func(fl validator.FieldLevel) bool {
		password := fl.Field().String()
		hasLetter := regexp.MustCompile(`[a-zA-Z]`).MatchString(password)
		hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
		return hasLetter && hasNumber
	})

	// Custom validation for Indonesian phone number (0... or 08..., 10-13 digits)
	validate.RegisterValidation("indo_phone", func(fl validator.FieldLevel) bool {
		phone := fl.Field().String()
		return regexp.MustCompile(`^0[0-9]{9,12}$`).MatchString(phone)
	})
}

// Register handles user registration
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req models.CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Format request tidak valid", nil)
	}

	// Validation struct to match prompt rules
	type RegisterValidationStruct struct {
		Name     string `validate:"required,min=3"`
		Email    string `validate:"required,email"`
		Password string `validate:"required,min=8,password_strength"`
		Phone    string `validate:"required,indo_phone"`
		Address  string `validate:"required,min=10"`
	}

	valReq := RegisterValidationStruct{
		Name:     req.Name,
		Email:    strings.ToLower(req.Email),
		Password: req.Password,
		Phone:    req.Phone,
		Address:  req.Address,
	}

	if err := validate.Struct(valReq); err != nil {
		errs := err.(validator.ValidationErrors)
		var customErrors []utils.ValidationError
		for _, e := range errs {
			field := e.Field()
			message := "Format tidak valid"
			switch field {
			case "Name":
				message = "Nama minimal 3 karakter"
			case "Email":
				message = "Format email tidak valid"
			case "Password":
				message = "Password minimal 8 karakter dengan huruf dan angka"
			case "Phone":
				message = "Format nomor telepon tidak valid"
			case "Address":
				message = "Alamat minimal 10 karakter"
			}
			customErrors = append(customErrors, utils.ValidationError{Field: field, Message: message})
		}
		return utils.ErrorResponse(c, 400, "Validasi gagal", customErrors)
	}

	req.Email = strings.ToLower(req.Email) // Ensure lowercase

	user, token, err := h.authService.Register(req)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error(), nil)
	}

	return utils.SuccessResponse(c, 201, "Registrasi berhasil", fiber.Map{
		"user":  user,
		"token": token,
	})
}

// Login handles user login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Format request tidak valid", nil)
	}

	if req.Email == "" || req.Password == "" {
		return utils.ErrorResponse(c, 400, "Email dan password wajib diisi", nil)
	}

	user, token, err := h.authService.Login(req)
	if err != nil {
		return utils.ErrorResponse(c, 401, err.Error(), nil)
	}

	return utils.SuccessResponse(c, 200, "Login berhasil", fiber.Map{
		"user":  user,
		"token": token,
	})
}

// Logout handles user logout by blacklisting the token
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return utils.ErrorResponse(c, 400, "Token tidak ditemukan", nil)
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return utils.ErrorResponse(c, 400, "Format token tidak valid", nil)
	}

	token := parts[1]

	// Extract expiry to set TTL in Redis
	claims, err := utils.ValidateToken(token)
	if err != nil {
		return utils.ErrorResponse(c, 401, "Token tidak valid", nil)
	}

	expiry := claims.ExpiresAt.Time
	ttl := time.Until(expiry)

	if ttl > 0 {
		rdb := database.GetRedis()
		ctx := c.Context()
		err := rdb.Set(ctx, "blacklist:"+token, "true", ttl).Err()
		if err != nil {
			return utils.ErrorResponse(c, 500, "Gagal memproses logout", nil)
		}
	}

	return utils.SuccessResponse(c, 200, "Logout berhasil", nil)
}

// GetProfile handles getting the current user's profile
func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	user, err := h.authService.GetProfile(userID)
	if err != nil {
		return utils.ErrorResponse(c, 404, "User tidak ditemukan", nil)
	}

	return utils.SuccessResponse(c, 200, "Profil berhasil diambil", user)
}

// UpdateProfile handles updating the current user's profile
func (h *AuthHandler) UpdateProfile(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		return utils.ErrorResponse(c, 401, "Unauthorized", nil)
	}

	var req services.UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Format request tidak valid", nil)
	}

	user, err := h.authService.UpdateProfile(userID, req)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal memperbarui profil", nil)
	}

	return utils.SuccessResponse(c, 200, "Profil berhasil diperbarui", user)
}

// ForgotPassword handles POST /api/v1/auth/forgot-password
func (h *AuthHandler) ForgotPassword(c *fiber.Ctx) error {
	var req struct {
		Email string `json:"email" validate:"required,email"`
	}
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Format request tidak valid", nil)
	}

	if err := validate.Struct(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Email tidak valid", nil)
	}

	// Check if user exists
	db := database.GetDB()
	var user models.User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return utils.ErrorResponse(c, 404, "Email tidak terdaftar", nil)
	}

	// Generate token
	token := uuid.New().String()

	// Save to Redis with expiration (15 minutes)
	rdb := database.GetRedis()
	key := "reset_token:" + token
	err := rdb.Set(c.Context(), key, user.ID.String(), 15*time.Minute).Err()
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal memproses permintaan", nil)
	}

	// Return the token or link in response (Simulation!)
	resetLink := "http://localhost/reset-password?token=" + token

	return utils.SuccessResponse(c, 200, "Link reset password berhasil dibuat (Simulasi)", fiber.Map{
		"token":      token,
		"reset_link": resetLink,
	})
}

// ResetPassword handles POST /api/v1/auth/reset-password
func (h *AuthHandler) ResetPassword(c *fiber.Ctx) error {
	var req struct {
		Token    string `json:"token" validate:"required"`
		Password string `json:"password" validate:"required,min=6,password_strength"`
	}
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Format request tidak valid", nil)
	}

	if err := validate.Struct(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Validasi gagal", nil)
	}

	// Get from Redis
	rdb := database.GetRedis()
	key := "reset_token:" + req.Token
	userIDStr, err := rdb.Get(c.Context(), key).Result()
	if err != nil {
		return utils.ErrorResponse(c, 400, "Token tidak valid atau telah kadaluarsa", nil)
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal memproses permintaan", nil)
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Gagal mengamankan password", nil)
	}

	// Update password in DB
	db := database.GetDB()
	if err := db.Model(&models.User{}).Where("id = ?", userID).Update("password_hash", hashedPassword).Error; err != nil {
		return utils.ErrorResponse(c, 500, "Gagal memperbarui password", nil)
	}

	// Delete token from Redis
	rdb.Del(c.Context(), key)

	return utils.SuccessResponse(c, 200, "Password berhasil diperbarui", nil)
}
