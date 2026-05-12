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
	// DB_PORT := helpers.GetEnv("DB_PORT") // will see during deployment

	dsn := fmt.Sprintf("host=localhost user=%s password=%s dbname=%s port=5432 sslmode=disable", DB_USER, DB_PASS, DB_NAME)
	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Error connecting to the database")
	}

	DB = db

	DB.AutoMigrate(
		&models.Admin{},
		&models.Faculty{},
		&models.Admin{},
		&models.CentreHead{},
	)

	log.Println("Database connected")
}
