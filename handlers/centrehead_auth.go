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


// CentreheadSignup registers the head of adminstrations.
// On success, sends a verification email with a JWT token link.
func (h *AuthHandler) CentreheadSignup(c *gin.Context) {
	var inputs models.CentreheadSignup

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

	centrehead := models.Centrehead{
		Name: inputs.Name,
		Email: inputs.Email,
		Password: inputs.Password,
		Building: inputs.Building,
		PhoneNumber: inputs.PhoneNumber,
		IsVerified: false,
		CreatedAt: time.Now(),
	}
	
	var existingUser models.Centrehead
	result := h.DB.Where("email = ?", centrehead.Email).Take(&existingUser)
	if result.Error == nil {
		if !existingUser.IsVerified {
			if err := services.SendVerificationMail(existingUser.ID, existingUser.Email, "centrehead"); err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			c.JSON(200, gin.H{"success": "email sent for verification"})
			return
		}
		c.JSON(409, gin.H{"error": "email is already registered, please login"})
		return
	}

	result = h.DB.Create(&centrehead)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}

	if err := services.SendVerificationMail(centrehead.ID, centrehead.Email, "centrehead"); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, gin.H{"success": "check your email inbox for the getting in"})
}


// CentreheadLogin authenticates the head of administrations using email and password.
// On success, signs a JWT and stores it in an httpOnly cookie.
func (h *AuthHandler) CentreheadLogin(c *gin.Context) {
	var inputs models.CentreheadLogin

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	var head models.Centrehead
	result := h.DB.Where("email = ?", inputs.Email).Take(&head)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "user not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if head.IsVerified == false {
		c.JSON(403, gin.H{"error": "please verify your account first"})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(head.Password), []byte(inputs.Password))
	if err != nil {
		c.JSON(401, gin.H{"error": "incorrect password"})
		return
	}

	token, err := helpers.GenerateToken(head.ID, head.Email, "centrehead")
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
	
	c.JSON(200, gin.H{"success": "logged in successfully!", "role": "centrehead"})
}


// CentreheadForgetPassword sends an password reset email to the user
func (h* AuthHandler) CentreheadForgetPassword(c *gin.Context) {
	var input ForgetPassword
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}
	var head models.Centrehead
	result := h.DB.Where("email = ?", input.Email).Take(&head)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "user not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if head.IsVerified != true {
		c.JSON(403, gin.H{"error": "account isn't verified yet"})
		return
	}

	if err := services.SendPasswordResetMail(head.ID, head.Email, "centrehead"); err != nil {
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}
	
	c.JSON(200, gin.H{"success": "password reset mail sent!"})
}


// CentreheadResetPassword resets the password of the user
func (h *AuthHandler) CentreheadResetPassword(c *gin.Context) {
	// get the user from query parameters
	userToken := c.Query("user")

	claims, err := helpers.VerifyToken(userToken)
	if err != nil {
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	var head models.Centrehead
	result := h.DB.Where("email = ?", claims.Email).Take(&head)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(403, gin.H{"error": "user not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	var inputs ResetPassword
	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}
	
	newHash, err := bcrypt.GenerateFromPassword([]byte(inputs.Password), 10)
	if err != nil {
		c.JSON(500, gin.H{"error": "unable to hash at the moment"})
		return
	}

	head.Password = string(newHash)
	result = h.DB.Model(&head).Updates(head)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to reset password at the moment"})
		return
	}
	c.JSON(200, gin.H{"success": "password changed successfully", "role": "centrehead"})
}
