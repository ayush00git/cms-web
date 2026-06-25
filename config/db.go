package config

import (
	"fmt"
	"log"
	"time"

	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	DB_USER := helpers.GetEnv("DB_USER")
	DB_NAME := helpers.GetEnv("DB_NAME")
	DB_PASS := helpers.GetEnv("DB_PASS")
	DB_HOST := helpers.GetEnvWithDefault("DB_HOST", "localhost")
	DB_PORT := helpers.GetEnvWithDefault("DB_PORT", "5432")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT)
	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Error connecting to the database")
	}

	DB = db

	DB.AutoMigrate(
		&models.Admin{},
		&models.Faculty{},
		&models.Warden{},
		&models.Centrehead{},
		&models.FacultyPost{},
		&models.WardenPost{},
		&models.CentreheadPost{},
		&models.Comment{},
	)

	seedAdmins(DB)

	log.Println("Database connected")
}

func seedAdmins(db *gorm.DB) {
	var count int64
	db.Model(&models.Admin{}).Count(&count)
	if count == 0 {
		log.Println("Seeding default admin users...")
		admins := []models.Admin{
			{Email: "xen_civil@nith.ac.in", Position: models.TypeXENCivil, IsVerified: true},
			{Email: "ae_civil@nith.ac.in", Position: models.TypeAECivil, IsVerified: true},
			{Email: "je_civil@nith.ac.in", Position: models.TypeJECivil, IsVerified: true},
			{Email: "xen_electrical@nith.ac.in", Position: models.TypeXENElectrical, IsVerified: true},
			{Email: "ae_electrical@nith.ac.in", Position: models.TypeAEElectrical, IsVerified: true},
			{Email: "je_electrical@nith.ac.in", Position: models.TypeJEElectrical, IsVerified: true},
		}
		password := "Admin@123"
		hashedPass, err := bcrypt.GenerateFromPassword([]byte(password), 10)
		if err != nil {
			log.Printf("Failed to hash admin seed password: %v", err)
			return
		}
		for i := range admins {
			admins[i].Password = string(hashedPass)
			admins[i].CreatedAt = time.Now()
			if err := db.Create(&admins[i]).Error; err != nil {
				log.Printf("Failed to seed admin %s: %v", admins[i].Email, err)
			}
		}
		log.Println("Admin users seeded successfully!")
	}
}