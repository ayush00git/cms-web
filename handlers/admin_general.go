// this file holds the general apis for admin helpers
//

package handlers

import (
	"errors"
	"strings"

	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"
	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
)

// AdminReturnJE fetches the JEs
// a helper API for assigning the JEs a task
// during updating the status by a AE
func (h *AdminHandler) AdminReturnJE(c *gin.Context) {
	// a check for authenticated user's email
	email, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, "permission denied")
		return
	}

	// check if the the user is a admin
	var admin models.Admin
	result := h.DB.Where("email = ?", email).Take(&admin)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "you are not authorized for this action"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	// find those 2 JEs to return
	var je []models.Admin
	if(strings.Contains(string(admin.Position), "Civil")) {
		result := h.DB.Where("position = ?", models.TypeJECivil).
		Select("id, email, position").
		Find(&je)
		if result.Error != nil {
			c.JSON(500, gin.H{"error": "unable to fetch records"})
			return
		}
	} else {
		result := h.DB.Where("position = ?", models.TypeJEElectrical).
		Select("id, email, position").
		Find(&je)
		if result.Error != nil {
			c.JSON(500, gin.H{"error": "unable to fetch records"})
			return
		}
	}

	c.JSON(200, gin.H{
		"success": "JEs fetched successfully!",
		"JEs": je,
	})
}
