package handlers

import (
	"errors"
	"time"

	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/models"
	"github.com/ayush00git/cms-web/services"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// WardenSignup registers a warden.
// On success, sends a verification email with a JWT token link.
func (h *AuthHandler) WardenSignup (c *gin.Context) {
	var inputs models.WardenSignup

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	hashedPass, err := bcrypt.GenerateFromPassword([]byte(inputs.Password), 10)
	if err != nil {
		c.JSON(500, gin.H{"error": "unable to hash the password"})
		return
	}
	inputs.Password = string(hashedPass)

	// send a email for account verification

	warden := models.Warden{
		Email: inputs.Email,
		Password: inputs.Password,
		Hostel: inputs.Hostel,
		PhoneNumber: inputs.PhoneNumber,
		IsVerified: false,
		CreatedAt: time.Now(),
	}

	var existingUser models.Warden
	result := h.DB.Where("email = ?", warden.Email).Take(&existingUser)
	if result.Error == nil {
		if !existingUser.IsVerified {
			if err := services.SendVerificationMail(existingUser.ID, existingUser.Email, "warden"); err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			c.JSON(200, gin.H{"success": "email sent for verification"})
			return
		}
		c.JSON(409, gin.H{"error": "email is already registered, please login"})
		return
	}

	result = h.DB.Create(&warden)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}

	if err := services.SendVerificationMail(warden.ID, warden.Email, "warden"); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, gin.H{"success": "check your email inbox for the getting in"})
}


// WardenLogin authenticates warden user using email and password.
// On success, signs a JWT and stores it in an httpOnly cookie.
func (h *AuthHandler) WardenLogin (c *gin.Context) {
	var inputs models.WardenLogin

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "request body unacceptable"})
		return
	}

	var warden models.Warden
	result := h.DB.Where("email = ?", inputs.Email).Take(&warden)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "user not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if warden.IsVerified == false {
		c.JSON(403, gin.H{"error": "please verify your account first"})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(warden.Password), []byte(inputs.Password))
	if err != nil {
		c.JSON(401, gin.H{"error": "incorrect password"})
		return
	}

	token, err := helpers.GenerateToken(warden.ID, warden.Email, "warden")
	if err != nil {
		c.JSON(500, gin.H{"error": "unable to sign the jwt token"})
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

	c.JSON(200, gin.H{"success": "logged in successfully!", "role": "warden"})
}
