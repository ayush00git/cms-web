package handlers

import (
	"errors"
	"strconv"
	"time"

	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminHandler struct {
	DB *gorm.DB
}

type CommentType struct {
	Content	string
}


// AdminGetComments fetches all comments made by the logged-in admin.
func (h *AdminHandler) AdminGetComments(c *gin.Context) {
	emailID, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "permission denied"})
		return
	}

	var comments []models.Comment
	result := h.DB.Where("email = ?", emailID).Find(&comments)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch comments"})
		return
	}

	c.JSON(200, gin.H{
		"success": "comments fetched",
		"comments": comments,
	})
}


// AdminPost comment allow any admin comment on any type of post.
// Common for all type of admins and posts.
func (h *AdminHandler) AdminPostComment(c *gin.Context) {
	// verify the admin
	emailID, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "permission denied"})
		return
	}

	var admin models.Admin
	result := h.DB.Where("email = ?", emailID).Take(&admin)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "no authorization for accessing this page"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	var inputs CommentType
	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	// picks up parameter from url to fetch the particular table type
	tableMap := map[string]interface{} {
		"faculty_posts": &models.FacultyPost{},
		"warden_posts": &models.WardenPost{},
		"centrehead_posts": &models.CentreheadPost{},
	}

	postType := c.Param("type")
	postModel, ok := tableMap[postType]
	if !ok {
		c.JSON(400, gin.H{"error": "invalid post type"})
		return
	}

	// get postID this needs to be parsed to uint64 and then type casted to uint
	postIDString := c.Param("id")
	postID, err := strconv.ParseUint(postIDString, 10, 64)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed parsing the post id"})
		return
	}

	// check if this post exists?
	result = h.DB.Where("id = ?", postID).Take(postModel)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "post not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	doc := models.Comment{
		CommentableID: uint(postID),
		CommentableType: postType,
		Content : inputs.Content,
		Email: admin.Email,
		Role: string(admin.Position),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	result = h.DB.Create(&doc)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to comment at the moment"})
		return
	}

	c.JSON(201, gin.H{"success": "comment posted!"})
}

// AdminEditComment allows an admin to edit their own comment.
func (h *AdminHandler) AdminEditComment(c *gin.Context) {
	// verify the admin
	emailID, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "permission denied"})
		return
	}

	var inputs CommentType
	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	postType := c.Param("type")
	postIDString := c.Param("id")
	postID, err := strconv.ParseUint(postIDString, 10, 64)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed parsing the post id"})
		return
	}

	commentIDString := c.Param("comment_id")
	commentID, err := strconv.ParseUint(commentIDString, 10, 64)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed parsing the comment id"})
		return
	}

	var comment models.Comment
	result := h.DB.Where("id = ?", commentID).Take(&comment)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "comment not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if comment.CommentableType != postType || comment.CommentableID != uint(postID) {
		c.JSON(400, gin.H{"error": "comment does not belong to this post"})
		return
	}

	// Verify that the comment belongs to this admin
	if comment.Email != emailID {
		c.JSON(403, gin.H{"error": "you are not authorized to edit this comment"})
		return
	}

	// limit the edit window only for 30 minutes
	if time.Since(comment.CreatedAt) >= 30*time.Minute {
		c.JSON(403, gin.H{"error": "edit window has been expired"})
		return
	}

	// Update the comment
	result = h.DB.Model(&comment).Updates(models.Comment{
		Content:   inputs.Content,
		UpdatedAt: time.Now(),
	})
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to update comment"})
		return
	}

	c.JSON(200, gin.H{"success": "comment updated!"})
}

// AdminDeleteComment allows an admin to delete their own comment.
func (h *AdminHandler) AdminDeleteComment(c *gin.Context) {
	// verify the admin
	emailID, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "permission denied"})
		return
	}

	postType := c.Param("type")
	postIDString := c.Param("id")
	postID, err := strconv.ParseUint(postIDString, 10, 64)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed parsing the post id"})
		return
	}

	commentIDString := c.Param("comment_id")
	commentID, err := strconv.ParseUint(commentIDString, 10, 64)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed parsing the comment id"})
		return
	}

	var comment models.Comment
	result := h.DB.Where("id = ?", commentID).Take(&comment)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "comment not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if comment.CommentableType != postType || comment.CommentableID != uint(postID) {
		c.JSON(400, gin.H{"error": "comment does not belong to this post"})
		return
	}

	// Verify that the comment belongs to this admin
	if comment.Email != emailID {
		c.JSON(403, gin.H{"error": "you are not authorized to delete this comment"})
		return
	}

	// limit the edit window only for 30 minutes
	if time.Since(comment.CreatedAt) >= 30*time.Minute {
		c.JSON(403, gin.H{"error": "edit window has been expired"})
		return
	}

	result = h.DB.Delete(&comment)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to delete comment"})
		return
	}

	c.JSON(200, gin.H{"success": "comment deleted!"})
}
