package handlers

import (
	"errors"
	"time"

	"github.com/ayush00git/cms-web/models"
	"github.com/ayush00git/cms-web/helpers"

	"gorm.io/gorm"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
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

	result := h.DB.Create(&warden)
	if result.Error != nil {
		pgErr, ok := result.Error.(*pgconn.PgError);
			if ok && pgErr.Code == "23505" {
				c.JSON(409, gin.H{"error": "email already registered"})
				return
			}
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}
	c.JSON(201, gin.H{"success": "signup success!"})	
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

	err := bcrypt.CompareHashAndPassword([]byte(warden.Password), []byte(inputs.Password))
	if err != nil {
		c.JSON(401, gin.H{"error": "incorrect password"})
		return
	}

	token, err := helpers.GenerateToken(warden.ID, warden.Email)
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

	c.JSON(200, gin.H{"success": "logged in successfully!"})
}
