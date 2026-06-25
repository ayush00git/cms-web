package config

import (
	"fmt"
	"log"

	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/models"

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

	log.Println("Database connected")
}