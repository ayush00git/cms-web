package handlers

import (
	"errors"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"
	"github.com/ayush00git/cms-web/services"

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
func (h *PostHandler) CentreheadPost(c *gin.Context) {
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
		StatusAuditLogs: []models.StatusAudit{
			{
				Event: string(PendingXEN),
				TimeStamp: time.Now(),
			},
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	result = h.DB.Create(&post)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}

	frontendURL := helpers.GetEnvWithDefault("FRONTEND_URL", "http://localhost:5173")
	postURL := fmt.Sprintf(`%s/admin/posts/%s/%d`, frontendURL, head.Role, post.ID)
	go func() {
		var position models.PositionType
		if post.TypeOfPost == "Civil" {
			position = models.TypeXENCivil
		} else {
			position = models.TypeXENElectrical
		}
		// through type of post send the mail to the corresponding civil/electrical XEN
		var xen models.Admin
		result := h.DB.Where("position = ?", position).Take(&xen)
		if result.Error != nil {
       	 	log.Printf("failed to send XEN mail for post %d", post.ID)
			return
		}
		// send mail to that user
		if err := services.SendPostMailToAdmins(xen.Email, postURL); err != nil {
        	log.Printf("failed to send XEN mail for post %d: %v", post.ID, err)
		}
	}()
	
	c.JSON(201, gin.H{"success": "post submitted successfully", "post": post})
}


// CentreheadPostEdit let's the author of the post edit it.
// Match is the author trying to edit.
func (h *PostHandler) CentreheadPostEdit(c *gin.Context) {
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
	
	// limit the edit window only for 30 minutes
	if time.Since(post.CreatedAt) >= 30*time.Minute {
		c.JSON(403, gin.H{"error": "edit window has been expired"})
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
func (h *PostHandler) CentreheadPostDelete(c *gin.Context) {
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

	// restrict post deletion after 30 minutes
	if time.Since(post.CreatedAt) >= 30*time.Minute {
		c.JSON(403, gin.H{"error": "deletion window has been expired"})
		return
	}

	if result := h.DB.Delete(&post); result.Error != nil {
		c.JSON(500, gin.H{"error": "failed deleting the post"})
		return
	}

	c.JSON(200, gin.H{"success": "post deleted successfully"})
}


// GetCentreheadPosts fetch the posts of the centre head member along with their status and comments
func (h *PostHandler) GetCentreheadPosts(c *gin.Context) {
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
	Preload("Comments").
	Where("centrehead_id = ?", head.ID).
	Find(&posts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch posts at the moment"})
		return
	}

	c.JSON(200, gin.H{"success": "posts fetched successfully", "posts": posts})
}


// CentreheadPostComment allows a user of type centrehead to post
// comment as the post's author
func (h *PostHandler) CentreheadPostComment(c *gin.Context) {
	// get email of the logged in user from the gin context
	email, _ := c.Get(middleware.EmailKey)

	// check if the user is a type centrehead role
	var head models.Centrehead
	result := h.DB.Where("email = ?", email).Take(&head)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "user not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	// get post_id from path parameters
	postIDString := c.Param("post_id")
	postIDU64, err := strconv.ParseUint(postIDString, 10, 64)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to parse post_id at the moment"})
		return
	}

	// read this post from the db
	postID := uint(postIDU64)
	var post models.CentreheadPost
	result = h.DB.Where("id = ?", postID).Take(&post)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "post not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	// verify the centrehead(logged in user) is the author of the post
	if head.ID != post.CentreheadID {
		c.JSON(403, gin.H{"error": "you are not authorized to comment"})
		return
	}

	// bind the input
	var inputs CommentType
	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(401, gin.H{"error": "invalid request body"})
		return
	}

	doc := models.Comment{
		CommentableID: postID,
		CommentableType: "centrehead_posts",
		Content: inputs.Content,
		Email: head.Email,
		Role: "centrehead",
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
