package handlers

import (
	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/models"

	"github.com/gin-gonic/gin"
)

// Logout clears the token stored in httpCookie.
// User is set to unauthenticated.
func (h *AuthHandler) Logout (c *gin.Context) {
	c.SetCookie(
		"token",
		" ",
		-1,
		"/",
		"localhost",
		false,
		true,
	)
	c.JSON(200, gin.H{"success": "logged out successfully!"})
}

func (h *AuthHandler) VerifyAccount (c *gin.Context) {
	// get the token from query parameters
	token := c.Query("token")

	// validate that token
	claims, err := helpers.VerifyToken(token)
	if err != nil {
		c.JSON(403, gin.H{"error": "failed verifying your account"})
		return
	}

	// find that email in the dbs
	switch claims.Role {
	case "admin":
		h.DB.Model(&models.Admin{}).Where("email = ?", claims.Email).Update("is_verified", true)		// for admins isVerified = true by default btw
	case "faculty":
		h.DB.Model(&models.Faculty{}).Where("email = ?", claims.Email).Update("is_verified", true)
	case "warden":
		h.DB.Model(&models.Warden{}).Where("email = ?", claims.Email).Update("is_verified", true)
	case "centrehead":
		h.DB.Model(&models.CentreHead{}).Where("email = ?", claims.Email).Update("is_verified", true)
	default:
		c.JSON(400, gin.H{"error": "role not defined"})
		return
	}
	c.JSON(200, gin.H{"success": "account verified"})
}
