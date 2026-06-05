package database

import (
	"log"

	"github.com/desamart/backend/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// SeedAdmin creates a default admin account if it doesn't exist
func SeedAdmin() error {
	db := GetDB()

	var count int64
	db.Model(&models.User{}).Where("role = ?", "admin").Count(&count)

	if count == 0 {
		log.Println("No admin found, creating default admin...")

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("Katasandi123@"), 12)
		if err != nil {
			return err
		}

		admin := models.User{
			ID:           uuid.New(),
			Name:         "Admin DesaMart",
			Email:        "admin@desamart.id",
			PasswordHash: string(hashedPassword),
			Role:         "admin",
			IsActive:     true,
			Phone:        "081234567890",
			Address:      "Kantor Desa",
		}

		if err := db.Create(&admin).Error; err != nil {
			return err
		}

		log.Println("Default admin created successfully: admin@desamart.id / Katasandi123@")
	} else {
		log.Println("Admin account already exists.")
	}

	return nil
}
