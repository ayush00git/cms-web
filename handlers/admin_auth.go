package handlers

import (
	"errors"

	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)


// // Use AdminSignup only when registering admins to the database.
// // Not to be used as a public API. 
// func (h *AdminHandler) AdminSignup (c *gin.Context) {
// 	var inputs models.Admin
// 	if err := c.ShouldBindJSON(&inputs); err != nil {
// 		c.JSON(400, gin.H{"error": "invalid request body"})
// 		return
// 	}

// 	hashedPass, err := bcrypt.GenerateFromPassword([]byte(inputs.Password), 10)
// 	if err != nil {
// 		c.JSON(500, gin.H{"error": "internal server error"})
// 		return
// 	}
// 	inputs.Password = string(hashedPass)

// 	inputs.CreatedAt = time.Now()
// 	_ = h.DB.Create(&inputs)
// 	c.JSON(201, gin.H{"success": "admin registered successfully!"})
// }

// Note that for admins as they are pre-set to the service the
// isVerified field is always by default true.
// AdminLogin authenticates the admin using email and password.
// On success, signs a JWT and stores it in an httpOnly cookie.
func (h *AdminHandler) AdminLogin (c *gin.Context) {
	var inputs models.AdminLogin

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	var admin models.Admin
	result := h.DB.Where("email = ?", inputs.Email).Take(&admin)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "admin record not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	// if admin.IsVerified == false {
	// 	c.JSON(401, gin.H{"error": "unverified user"})
	// 	return
	// }

	err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(inputs.Password))
	if err != nil {
		c.JSON(401, gin.H{"error": "incorrect password!"})
		return
	}

	token, err := helpers.GenerateToken(admin.ID, admin.Email, "admin")
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to generate a token"})
		return
	}

	c.SetCookie(
		"token",
		token,
		30 * 24 * 60 * 60,
		"/",
		"localhost",
		false,
		true,
	)

	c.JSON(200, gin.H{"success": "logged in successfully!", "position": admin.Position})
}
