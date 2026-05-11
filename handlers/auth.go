package handlers

import (

	"github.com/ayush00git/cms-web/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB *gorm.DB
}

func (h *AuthHandler) FacultySignup (c *gin.Context) {
	var inputs models.Faculty

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(500, gin.H{"error": "request body unacceptable"})
		return
	}

	// password hashing logic
	// generate a jwt token and send a verification email

	result := h.DB.Create(&inputs)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed inserting object to the table"})
		return
	}
}
