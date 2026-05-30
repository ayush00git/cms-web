package handlers

import (
	"time"
	"errors"

	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CentreheadPostEditType
type CentreheadPostEditType struct {
	Title			string		`json:"title"`
	Description		string		`json:"description"`
	UpdatedAt		time.Time	`json:"updated_at"`
}

// CentreheadPostType
type CentreheadPostType struct {
	Title			string		`json:"title"`
	Description		string		`json:"description"`
	TypeOfPost		string		`json:"type_of_post"`
}

// CentreheadPost registers the post of centre-head members.
// forwards the post to the associated XEN.
func (h *PostHandler) CentreheadPost (c *gin.Context) {
	var inputs CentreheadPostType

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
	email, _ := c.Get(middleware.EmailKey)

	// read db for this email exists or not
	var head models.Centrehead
	result := h.DB.Where("email = ?", email).Take(&head)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(401, gin.H{"error": "user not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch at the moment"})
		return
	}

	post := models.CentreheadPost{
		CentreheadID: centreheadId.(uint),
		TypeOfPost: models.PostType(inputs.TypeOfPost),
		Title: inputs.Title,
		Description: inputs.Description,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	result = h.DB.Create(&post)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}

	c.JSON(201, gin.H{"success": "post submitted successfully", "post": post})
}


// CentreheadPostEdit let's the author of the post edit it.
// Match is the author trying to edit.
func (h *PostHandler) CentreheadPostEdit (c *gin.Context) {
	// get the id of the user from gin context
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated access"})
		return
	}

	var post models.CentreheadPost
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
	if post.CentreheadID != userID.(uint) {
		c.JSON(403, gin.H{"error": "you are not authorized for this action"})
		return
	}

	var inputs CentreheadPostEditType
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


// CentreheadPostDelete lets the author delete his post.
// Matches is the author trying to delete.
func (h *PostHandler) CentreheadPostDelete (c *gin.Context) {
	// get userID from gin context
	userID, exists := c.Get(middleware.UserIDKey);
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated access"})
		return
	}

	// get postID from parameters and fetch the post
	postID := c.Param("post_id")
	var post models.CentreheadPost
	result := h.DB.Where("id = ?", postID).Take(&post)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "requested entry no longer exists"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if post.CentreheadID != userID.(uint) {
		c.JSON(403, gin.H{"error": "you are not authorized for this action"})
		return
	}

	if result := h.DB.Delete(&post); result.Error != nil {
		c.JSON(500, gin.H{"error": "failed deleting the post"})
		return
	}

	c.JSON(200, gin.H{"success": "post deleted successfully"})
}


// GetCentreheadPosts fetch the posts of the centre head member along with their status and comments
func (h *PostHandler) GetCentreheadPosts (c *gin.Context) {
	email, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated user"})
		return
	}

	var head models.Centrehead
	result := h.DB.Where("email = ?", email).Take(&head)
	if result.Error != nil {
		c.JSON(401, gin.H{"error": "user not found"})
		return
	}

	var posts []models.CentreheadPost
	result = h.DB.
	Preload("Comments", func(db *gorm.DB) (*gorm.DB) {
		return db.Preload("Author", func (d *gorm.DB) (*gorm.DB) {
			return d.Select("id, email, position")
		})
	}).
	Where("centrehead_id = ?", head.ID).
	Find(&posts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch posts at the moment"})
		return
	}

	c.JSON(200, gin.H{"success": "posts fetched successfully", "posts": posts})
}
