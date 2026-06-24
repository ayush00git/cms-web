package handlers

import (
	"errors"
	"strconv"

	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetPostByID fetches a single post for the logged in user by role and post_id
func (h *PostHandler) GetPostByID(c *gin.Context) {
	email, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated user"})
		return
	}

	role := c.Param("role")
	postIDString := c.Param("post_id")
	postIDU64, err := strconv.ParseUint(postIDString, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "failed to parse post_id"})
		return
	}
	postID := uint(postIDU64)

	switch role {
	case "faculty":
		var faculty models.Faculty
		result := h.DB.Where("email = ?", email).Take(&faculty)
		if result.Error != nil {
			c.JSON(401, gin.H{"error": "user not found"})
			return
		}
		var post models.FacultyPost
		result = h.DB.Preload("Comments").Where("id = ? AND faculty_id = ?", postID, faculty.ID).Take(&post)
		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				c.JSON(404, gin.H{"error": "requested entry no longer exists"})
				return
			}
			c.JSON(500, gin.H{"error": "internal server error"})
			return
		}
		c.JSON(200, gin.H{"success": "post fetched successfully", "post": post})

	case "warden":
		var warden models.Warden
		result := h.DB.Where("email = ?", email).Take(&warden)
		if result.Error != nil {
			c.JSON(401, gin.H{"error": "user not found"})
			return
		}
		var post models.WardenPost
		result = h.DB.Preload("Comments").Where("id = ? AND warden_id = ?", postID, warden.ID).Take(&post)
		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				c.JSON(404, gin.H{"error": "requested entry no longer exists"})
				return
			}
			c.JSON(500, gin.H{"error": "internal server error"})
			return
		}
		c.JSON(200, gin.H{"success": "post fetched successfully", "post": post})

	case "centrehead":
		var head models.Centrehead
		result := h.DB.Where("email = ?", email).Take(&head)
		if result.Error != nil {
			c.JSON(401, gin.H{"error": "user not found"})
			return
		}
		var post models.CentreheadPost
		result = h.DB.Preload("Comments").Where("id = ? AND centrehead_id = ?", postID, head.ID).Take(&post)
		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				c.JSON(404, gin.H{"error": "requested entry no longer exists"})
				return
			}
			c.JSON(500, gin.H{"error": "internal server error"})
			return
		}
		c.JSON(200, gin.H{"success": "post fetched successfully", "post": post})

	default:
		c.JSON(400, gin.H{"error": "undefined role"})
	}
}
