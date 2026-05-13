package handlers

import (
	"time"
	"errors"

	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/models"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
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

	// insert the profile details to the table
	result := h.DB.Create(&faculty)
	// log.Println(result)
	// log.Printf("Error imma lookin for: %s", result.Error)
	if result.Error != nil {
		pgErr, ok := result.Error.(*pgconn.PgError);
		if ok && pgErr.Code == "23505" {
			c.JSON(409, gin.H{"error": "email already registered"})
			return
		}
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}
	// send email logic
	c.JSON(201, gin.H{"success": "Signup success!"})
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
		30 * 24 * 60 * 60,			// 30 days
		"/",
		"localhost",
		false,						// set to true during deployment (secure bool)
		true,						// set to false during deployment (httpOnly bool)
	)

	c.JSON(200, gin.H{"success": "logged in successfully"})
}

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

	token, err := helpers.GenerateToken(inputs.Email)
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

// CentreHeadSignup registers the head of adminstrations.
// On success, sends a verification email with a JWT token link.
func (h *AuthHandler) CentreHeadSignup (c *gin.Context) {
	var inputs models.CentreHeadSignup

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

	centrehead := models.CentreHead{
		Email: inputs.Email,
		Password: inputs.Password,
		Building: inputs.Building,
		PhoneNumber: inputs.PhoneNumber,
		IsVerified: false,
		CreatedAt: time.Now(),
	}
	
	result := h.DB.Create(&centrehead)
	if result.Error != nil {
		pgErr, ok := result.Error.(*pgconn.PgError)
		if ok && pgErr.Code == "23505" {
			c.JSON(409, gin.H{"error": "email already registered"})
			return
		}
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}

	c.JSON(201, gin.H{"success": "signup success!"})
}

// CentreHeadLogin authenticates the head admin member using email and password.
// On success, signs a JWT and stores it in an httpOnly cookie.
func (h *AuthHandler) CentreHeadLogin (c *gin.Context) {
	var inputs models.CentreHeadLogin

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	var head models.CentreHead
	result := h.DB.Where("email = ?", inputs.Email).Take(&head)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "user not found"})
			return
		}
		c.JSON(404, gin.H{"error": "internal server error"})
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
		30 * 24 * 60 * 60,
		"/",
		"localhost",
		false,
		true,
	)
	
	c.JSON(200, gin.H{"success": "logged in successfully!"})
}

// APIs left to implement - logout API, admins login
