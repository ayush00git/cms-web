package handlers

import (
	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/middleware"
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
	c.JSON(200, gin.H{"success": "account verified", "role": claims.Role})
}

func (h *AuthHandler) UserProfile (c *gin.Context) {
	// get role from gin context keys
	role, exists := c.Get(middleware.RoleKey)
	if !exists {
		c.JSON(401, gin.H{"error": "access denied"})
		return
	}

	// get email from context keys as well
	email, exists := c.Get(middleware.EmailKey)

	var userProfile any
	switch role{
	case "faculty":
		var profile models.Faculty
		result := h.DB.Where("email = ?", email).Take(&profile)
		if result.Error != nil {
			c.JSON(500, gin.H{"error": "failed to fetch user profile"})
			return
		}
		userProfile = profile
	case "warden":
		var profile models.Warden
		result := h.DB.Where("email = ?", email).Take(&profile)
		if result.Error != nil {
			c.JSON(500, gin.H{"error": "failed to fetch user profile"})
			return
		}
		userProfile = profile
	case "centrehead":
		var profile models.CentreHead
		result := h.DB.Where("email = ?", email).Take(&profile)
		if result.Error != nil {
			c.JSON(500, gin.H{"error": "failed to fetch user profile"})
			return
		}
		userProfile = profile
	default:
		c.JSON(404, gin.H{"error": "undefined role"})
		return
	}

	c.JSON(200, userProfile);
}
