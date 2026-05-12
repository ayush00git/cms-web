package handlers

import (

	"github.com/ayush00git/cms-web/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"golang.org/x/crypto/bcrypt"
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

	hashedPass, err := bcrypt.GenerateFromPassword([]byte(inputs.Password), 10)
	if err != nil {
		c.JSON(500, gin.H{"error": "unable to hash the password"})
		return
	}

	inputs.Password = string(hashedPass);

	// password hashing logic
	// generate a jwt token and send a verification email

	result := h.DB.Create(&inputs)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed inserting object to the table"})
		return
	}
}
