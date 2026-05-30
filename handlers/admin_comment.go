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

/////////////////////////////////////////////////////////////////////
// More apis to integrate - AdminEditComment, AdminDeleteComment
// AdminGetComments
/////////////////////////////////////////////////////////////////////


// AdminPost comment allow any admin comment on any type of post.
// Common for all type of admins and posts.
func (h *AdminHandler) AdminPostComment (c *gin.Context) {
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
		AuthorID: admin.ID,
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
