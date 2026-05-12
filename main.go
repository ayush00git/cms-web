package main

import (
	"fmt"

	"github.com/ayush00git/cms-web/database"
	"github.com/ayush00git/cms-web/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	database.ConnectDB()

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "server running smooth"})
	})

	// Setup application routes
	routes.SetupComplaintRoutes(r)

	r.Run(":8080")
	fmt.Println("Sevrer running on port 8080")
}
