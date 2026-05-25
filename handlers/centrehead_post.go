package handlers

import (
	"time"
	"errors"

	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CentreHeadPostEditType
type CentreHeadPostEditType struct {
	Title			string		`json:"title"`
	Description		string		`json:"description"`
	UpdatedAt		time.Time	`json:"updated_at"`
}


// CentreHeadPost registers the post of centre-head members.
// forwards the post to the associated XEN.
func (h *PostHandler) CentreHeadPost (c *gin.Context) {
	var inputs models.CentreHeadPost

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	// gets userId from the context keys set by the IsAuthenticated middleware
	centreheadId, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated access"})
		return
	}
	inputs.CentreHeadID = centreheadId.(uint)

	// set default values
	inputs.CreatedAt = time.Now()
	inputs.UpdatedAt = time.Now()

	result := h.DB.Create(&inputs)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}

	c.JSON(201, gin.H{"success": "post submitted successfully", "post": inputs})
}


// CentreHeadPostEdit let's the author of the post edit it.
// Match is the author trying to edit.
func (h *PostHandler) CentreHeadPostEdit (c *gin.Context) {
	// get the id of the user from gin context
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated access"})
		return
	}

	var post models.CentreHeadPost
	postID := c.Param("post_id")
	result := h.DB.Where("id = ?", postID).Take(&post)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "requested entry no longer exists"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	// verifying is it the author trying to edit
	if post.CentreHeadID != userID.(uint) {
		c.JSON(403, gin.H{"error": "you are not authorized for this action"})
		return
	}

	var inputs CentreHeadPostEditType
	inputs.UpdatedAt = time.Now()
	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	result = h.DB.Model(&post).Updates(inputs)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(200, gin.H{"success": "post updated successfully"})
}


// CentreHeadPostDelete lets the author delete his post.
// Matches is the author trying to delete.
func (h *PostHandler) CentreHeadPostDelete (c *gin.Context) {
	// get userID from gin context
	userID, exists := c.Get(middleware.UserIDKey);
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated access"})
		return
	}

	// get postID from parameters and fetch the post
	postID := c.Param("post_id")
	var post models.CentreHeadPost
	result := h.DB.Where("id = ?", postID).Take(&post)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "requested entry no longer exists"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if post.CentreHeadID != userID.(uint) {
		c.JSON(403, gin.H{"error": "you are not authorized for this action"})
		return
	}

	if result := h.DB.Delete(&post); result.Error != nil {
		c.JSON(500, gin.H{"error": "failed deleting the post"})
		return
	}

	c.JSON(200, gin.H{"success": "post deleted successfully"})
}


// GetCentreHeadPosts fetch the posts of the centre head member along with their status and comments
func (h *PostHandler) GetCentreHeadPosts (c *gin.Context) {
	email, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated user"})
		return
	}

	var head models.CentreHead
	result := h.DB.Where("email = ?", email).Take(&head)
	if result.Error != nil {
		c.JSON(401, gin.H{"error": "user not found"})
		return
	}

	var posts []models.CentreHeadPost
	result = h.DB.Joins("Author").Where(`"Author".email = ?`, email).Find(&posts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch posts at the moment"})
		return
	}

	c.JSON(200, gin.H{"success": "posts fetched successfully", "posts": posts})
}