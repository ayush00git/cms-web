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

type AuthHandler struct {
	DB *gorm.DB
}

// FacultySignup registers a new faculty member.
// On success, sends a verification email with a JWT token link.
func (h *AuthHandler) FacultySignup (c *gin.Context) {
	var inputs models.FacultySignup

	// bind the request body in a json format
	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	// hash the password using bcrypt
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(inputs.Password), 10)
	if err != nil {
		c.JSON(500, gin.H{"error": "unable to hash the password"})
		return
	}

	inputs.Password = string(hashedPass);

	faculty := models.Faculty{
		Name: inputs.Name,
		Email: inputs.Email,
		Password: inputs.Password,
		Department: inputs.Department,
		HouseNumber: inputs.HouseNumber,
		Block: inputs.Block,
		Type: inputs.Type,
		PhoneNumber: inputs.PhoneNumber,
		IsVerified: false,
		CreatedAt: time.Now(),
	}

	// check if this email already exists ? // just for if a unverified
	// user tries to sign up.
	var existingUser models.Faculty
	result := h.DB.Where("email = ?", faculty.Email).Take(&existingUser)
	if result.Error == nil {
		if !existingUser.IsVerified {
			if err := services.SendVerificationMail(existingUser.ID, existingUser.Email, "faculty"); err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			c.JSON(200, gin.H{"success": "email sent for verification"})
			return
		}
		c.JSON(409, gin.H{"error": "email is already registered, please login"})
		return
	}

	// now save the user to the table
	result = h.DB.Create(&faculty)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}
	// send verification email
	if err := services.SendVerificationMail(faculty.ID, faculty.Email, "faculty"); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(201, gin.H{"success": "check your email inbox for the getting in"})
}


// FacultyLogin authenticates a faculty member using email and password.
// On success, signs a JWT and stores it in an httpOnly cookie.
func (h *AuthHandler) FacultyLogin (c *gin.Context) {
	var inputs models.FacultyLogin

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	// fetch user with the email = input.Email from the table
	var faculty models.Faculty
	result := h.DB.Where("email = ?", inputs.Email).Take(&faculty)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"email": "user not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if faculty.IsVerified == false {
		c.JSON(403, gin.H{"error": "please verify your account first"})
		return
	}

	// password verification
	if err := bcrypt.CompareHashAndPassword([]byte(faculty.Password), []byte(inputs.Password)); err != nil {
		c.JSON(401, gin.H{"error": "incorrect password"})
		return
	}

	// sign a jwt and store it in cookies
	token, err := helpers.GenerateToken(faculty.ID, faculty.Email, "faculty")
	if err != nil {
		c.JSON(500, gin.H{"error": "unable to sign the jwt token"})
		return
	}

	c.SetCookie(
		"token",
		token,
		30 * 24 * 60 * 60,			// 30 days
		"/",
		"localhost",
		false,						// set to true during deployment (secure bool)
		true,						// set to false during deployment (httpOnly bool)
	)

	c.JSON(200, gin.H{"success": "logged in successfully", "role": "faculty"})
}
