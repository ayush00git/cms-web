package main

import (
	"fmt"

	"github.com/ayush00git/cms-web/config"
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error while loading the environment variables")
	}
	config.ConnectDB()

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "server running smooth"})
	})

	authHandler := &handlers.AuthHandler{
		DB: config.DB,
	}

	routes.AuthRoute(r, authHandler)

	complaintHandler := &handlers.ComplaintHandler{
		DB: config.DB,
	}

	// Setup application routes
	routes.ComplaintRoute(r, complaintHandler)

	r.Run(":8080")
	fmt.Println("Sevrer running on port 8080")
}
