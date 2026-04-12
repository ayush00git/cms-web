package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "server running smooth"})
	})
 
	r.Run(":8080")
	fmt.Println("Sevrer running on port 8080")
}
