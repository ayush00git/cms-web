package main

import (
	"fmt"

	"github.com/ayush00git/cms-web/config"
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/routes"

	"github.com/gin-gonic/gin"
)

func main() {

	config.ConnectDB()	

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "server running smooth"})
	})

	authHandler := &handlers.AuthHandler{
		DB: config.DB,
	}

	routes.AuthRoute(r, authHandler)

	r.Run(":8080")
	fmt.Println("Sevrer running on port 8080")
}
