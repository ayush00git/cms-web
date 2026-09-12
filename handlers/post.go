package handlers

import (
	"errors"
	"strconv"

	"github.com/ayush00git/cms-web/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetPostByID fetches a single post for the logged in user by role and post_id
// GetPostByID returns a single post with its comments. It is public,
// no authentication is required to read a post.
func (h *PostHandler) GetPostByID(c *gin.Context) {
	role := c.Param("role")
	postIDString := c.Param("post_id")
	postIDU64, err := strconv.ParseUint(postIDString, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "failed to parse post_id"})
		return
	}
	postID := uint(postIDU64)

	author := func(db *gorm.DB) *gorm.DB {
		return db.Select("id, name, email")
	}

	var post any
	var result *gorm.DB
	switch role {
	case "faculty":
		var p models.FacultyPost
		result = h.DB.Preload("Comments").Preload("Author", author).Where("id = ?", postID).Take(&p)
		post = p
	case "warden":
		var p models.WardenPost
		result = h.DB.Preload("Comments").Preload("Author", author).Where("id = ?", postID).Take(&p)
		post = p
	case "centrehead":
		var p models.CentreheadPost
		result = h.DB.Preload("Comments").Preload("Author", author).Where("id = ?", postID).Take(&p)
		post = p
	default:
		c.JSON(400, gin.H{"error": "undefined role"})
		return
	}

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "requested entry no longer exists"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}
	c.JSON(200, gin.H{"success": "post fetched successfully", "post": post})
}
