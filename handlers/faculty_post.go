package handlers

import (
	"time"
	"errors"

	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PostHandler struct {
	DB *gorm.DB
}

// FacultyPostEdit
type FacultyPostEditType struct {
	Place			string		`json:"place"`
	Title			string		`json:"title"`
	Description		string		`json:"description"`
	UpdatedAt		time.Time	`json:"updated_at"`
}


// FacultyPost registers the post of faculty members.
// forwards the post to the associated XEN.
func (h *PostHandler) FacultyPost (c *gin.Context) {
	var inputs models.FacultyPost

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	// gets userId from the context keys set by the IsAuthenticated middleware
	facultyId, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated access"})
		return
	}
	inputs.FacultyID = facultyId.(uint)

	inputs.CreatedAt = time.Now()
	inputs.UpdatedAt = time.Now()

	result := h.DB.Create(&inputs)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}
	
	c.JSON(201, gin.H{"success": "post submitted successfully", "post": inputs})
}


// FacultyPostEdit let's the author of the post edit it.
// Match is the author trying to edit.
func (h *PostHandler) FacultyPostEdit (c *gin.Context) {
	// who is trying to edit the post
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated access"})
		return
	}
	
	var post models.FacultyPost
	// who is the owner of the post
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
	
	// check if it's the same person trying to edit the post
	if post.FacultyID != userID.(uint) {
		c.JSON(403, gin.H{"error": "you are not authorized for this action"})
		return
	}

	var inputs FacultyPostEditType
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


// FacultyPostDelete lets the author delete his post.
// Matches is the author trying to delete.
func (h *PostHandler) FacultyPostDelete (c *gin.Context) {
	// get userID from gin context
	userID, exists := c.Get(middleware.UserIDKey);
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated access"})
		return
	}

	// get postID from parameters and fetch the post
	postID := c.Param("post_id")
	var post models.FacultyPost
	result := h.DB.Where("id = ?", postID).Take(&post)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "requested entry no longer exists"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if post.FacultyID != userID.(uint) {
		c.JSON(403, gin.H{"error": "you are not authorized for this action"})
		return
	}

	if result := h.DB.Delete(&post); result.Error != nil {
		c.JSON(500, gin.H{"error": "failed deleting the post"})
		return
	}

	c.JSON(200, gin.H{"success": "post deleted successfully"})
}


// GetFacultyPosts fetch the posts of the faculty member along with their status and comments
// This API returns all the posts collectively
func (h *PostHandler) GetFacultyPosts (c *gin.Context) {
	// get email of the logged in user
	email, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated user"})
		return
	}

	// verify any faculty with this email id exists?
	var faculty models.Faculty
	result := h.DB.Where("email = ?", email).Take(&faculty)
	if result.Error != nil {
		c.JSON(401, gin.H{"error": "user not found"})
		return
	}

	// return posts where author is faculty (the logged in user)
	var posts []models.FacultyPost
	result = h.DB.
	Preload("Comments", func(db *gorm.DB) (*gorm.DB) {
		return db.Preload("Author", func(d *gorm.DB) (*gorm.DB) {
			return d.Select("id, email, position")
		})
	}).
	Where("faculty_id = ?", faculty.ID).
	Find(&posts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch posts at the moment"})
		return
	}
	
	c.JSON(200, gin.H{"success": "posts fetched successfully", "posts": posts})
}
