package main

import (
	"fmt"

	"github.com/ayush00git/cms-web/config"
	"github.com/ayush00git/cms-web/models"

	"github.com/gin-gonic/gin"
)

func main() {

	config.ConnectDB()	
	config.DB.AutoMigrate(
		&models.Admin{},
		&models.Faculty{},
		&models.Warden{},
		&models.CentreHead{},
	)

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "server running smooth"})
	})

	r.Run(":8080")
	fmt.Println("Sevrer running on port 8080")
}
