package main

import (
	"fmt"
	"log"

	"github.com/ayush00git/cms-web/config"
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error while loading the environment variables")
	}

	// db connection
	config.ConnectDB()

	r := gin.Default()

	// CORS policy and config
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:5173"}
	corsConfig.AllowCredentials = true

	r.Use(cors.New(corsConfig))

	// health check route
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "server running smooth"})
	})

	// define handlers
	authHandler := &handlers.AuthHandler{
		DB: config.DB,
	}

	postHandler := &handlers.PostHandler{
		DB: config.DB,
	}

	adminHandler := &handlers.AdminHandler{
		DB: config.DB,
	}

	// register routes
	routes.AuthRoute(r, authHandler)
	routes.PostRoute(r, postHandler)
	routes.AdminRoutes(r, adminHandler)

	r.Run(":8080")
	fmt.Println("Sevrer running on port 8080")
}
