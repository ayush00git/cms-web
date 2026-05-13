package handlers

import (
	"strings"
	"github.com/ayush00git/cms-web/models"
	"github.com/ayush00git/cms-web/helpers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB *gorm.DB
}

func (h *AuthHandler) FacultySignup (c *gin.Context) {
	var inputs models.Faculty

	// bind the request body in a json format
	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "request body unacceptable"})
		return
	}

	// hash the password using bcrypt
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(inputs.Password), 10)
	if err != nil {
		c.JSON(500, gin.H{"error": "unable to hash the password"})
		return
	}

	inputs.Password = string(hashedPass);

	// insert the profile details to the table
	result := h.DB.Create(&inputs)
	// log.Println(result)
	// log.Printf("Error imma lookin for: %s", result.Error)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "unique constraint") {
			c.JSON(409, gin.H{"error": "user with that email already exists! login instead"})
			return
		}
		c.JSON(500, gin.H{"error": "failed inserting object to the table"})
		return
	}
	// send email logic
	c.JSON(201, gin.H{"success": "Signup success! (email verification ahead)"})
}

func (h *AuthHandler) FacultyLogin (c *gin.Context) {
	var inputs models.Faculty

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	// fetch user with the email = input.Email from the table
	var faculty models.Faculty
	result := h.DB.Where("email = ?", inputs.Email).Take(&faculty)
	if result.Error != nil {
		c.JSON(404, gin.H{"error": "user with that email doesn't exists"})
		return
	}

	// password verification
	if err := bcrypt.CompareHashAndPassword([]byte(faculty.Password), []byte(inputs.Password)); err != nil {
		c.JSON(401, gin.H{"error": "incorrect password"})
		return
	}

	// sign a jwt and store it in cookies
	token, err := helpers.GenerateToken(inputs.Email)
	if err != nil {
		c.JSON(500, gin.H{"error": "unable to sign the jwt token"})
		return
	}

	c.SetCookie(
		"token",
		token,
		30 * 24 * 60 * 60 * 1000,	// 30 days
		"/",
		"localhost",
		false,						// set to true during deployment (secure bool)
		true,						// set to false during deployment (httpOnly bool)
	)

	c.JSON(200, gin.H{"success": "logged in successfully"})
}

func (h *AuthHandler) WardenSignup (c *gin.Context) {
	var inputs models.Warden

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "request body unacceptable"})
		return
	}

	hashedPass, err := bcrypt.GenerateFromPassword([]byte(inputs.Password), 10)
	if err != nil {
		c.JSON(500, gin.H{"error": "unable to hash the password"})
		return
	}
	inputs.Password = string(hashedPass)

	// send a email for account verification

	result := h.DB.Create(&inputs)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "unique constraint") {
			c.JSON(409, gin.H{"error": "user with that email already exists! login instead"})
			return
		}
		c.JSON(500, gin.H{"error": "failed inserting object to the table"})
		return
	}
	c.JSON(201, gin.H{"success": "signup success!"})	
}

func (h *AuthHandler) WardenLogin (c *gin.Context) {
	var inputs models.Warden

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "request body unacceptable"})
		return
	}

	var warden models.Warden
	result := h.DB.Where("email = ?", inputs.Email).Take(&warden)
	if result.Error != nil {
		c.JSON(404, gin.H{"error": "user with that email doesn't exists"})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(warden.Password), []byte(inputs.Password))
	if err != nil {
		c.JSON(401, gin.H{"error": "incorrect password"})
		return
	}

	token, err := helpers.GenerateToken(inputs.Email)
	if err != nil {
		c.JSON(500, gin.H{"error": "unable to sign the jwt token"})
		return
	}

	c.SetCookie(
		"token",
		token,
		30 * 24 * 60 * 60 * 1000,
		"/",
		"localhost",
		false,
		true,
	)

	c.JSON(200, gin.H{"success": "logged in successfully!"})
}

func (h *AuthHandler) CentreHeadSignup (c *gin.Context) {
	var inputs models.CentreHead

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "request body unacceptable"})
		return
	}

	hashedPass, err := bcrypt.GenerateFromPassword([]byte(inputs.Password), 10)
	if err != nil {
		c.JSON(500, gin.H{"error": "unable to hash the password"})
		return
	}

	inputs.Password = string(hashedPass)
	
	result := h.DB.Create(&inputs)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "unique constraint") {
			c.JSON(409, gin.H{"error": "user with that email already exists, login instead"})
			return
		}
	}

	c.JSON(201, gin.H{"success": "signup success!"})
}

func (h *AuthHandler) CentreHeadLogin (c *gin.Context) {
	var inputs models.CentreHead

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "error body unacceptable"})
		return
	}

	var head models.CentreHead
	result := h.DB.Where("email = ?", inputs.Email).Take(&head)
	if result.Error != nil {
		c.JSON(404, gin.H{"error": "user with that email doesn't exists"})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(head.Password), []byte(inputs.Password))
	if err != nil {
		c.JSON(500, gin.H{"error": "incorrect password"})
		return
	}

	token, err := helpers.GenerateToken(inputs.Email)
	if err != nil {
		c.JSON(500, gin.H{"error": "unable to sign the jwt token"})
		return
	}

	c.SetCookie(
		"token",
		token,
		30 * 24 * 60 * 60 * 1000,
		"/",
		"localhost",
		false,
		true,
	)
	
	c.JSON(200, gin.H{"success": "logged in successfully!"})
}
