package database

import (
	"fmt"
	"log"

	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// ConnectDB connects to the database using environment variables
func ConnectDB() {
	DB_USER := helpers.GetEnv("DB_USER")
	DB_NAME := helpers.GetEnv("DB_NAME")
	DB_PASS := helpers.GetEnv("DB_PASS")

	dsn := fmt.Sprintf("host=localhost user=%s password=%s dbname=%s port=5432 sslmode=disable", DB_USER, DB_PASS, DB_NAME)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate models
	db.AutoMigrate(
		&models.Admin{},
		&models.Faculty{},
		&models.Warden{},
		&models.CentreHead{},
		&models.Complaint{},
		&models.Comment{},
	)

	DB = db
	log.Println("Database connected and migrated")
}
