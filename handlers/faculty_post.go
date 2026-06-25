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

type PostHandler struct {
	DB *gorm.DB
}

// FacultyPostEditType
type FacultyPostEditType struct {
	Place			string		`json:"place"`
	Title			string		`json:"title"`
	Description		string		`json:"description"`
	UpdatedAt		time.Time	`json:"updated_at"`
}

// FacultyPostType
type FacultyPostType struct {
	Place			string		`json:"place"`
	TypeOfPost		string		`json:"type_of_post"`
	Title			string		`json:"title"`
	Description		string		`json:"description"`
}

// FacultyPost registers the post of faculty members.
// forwards the post to the associated XEN.
func (h *PostHandler) FacultyPost(c *gin.Context) {
	var inputs FacultyPostType

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
	email, _ := c.Get(middleware.EmailKey)

	// read db for this email exists or not
	var faculty models.Faculty
	result := h.DB.Where("email = ?", email).Take(&faculty)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(401, gin.H{"error": "user not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch at the moment"})
		return
	}

	post := models.FacultyPost{
		FacultyID: facultyId.(uint),
		Place: models.PostPlace(inputs.Place),
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
	postURL := fmt.Sprintf(`%s/admin/posts/%s/%d`, frontendURL, faculty.Role, post.ID)
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


// FacultyPostEdit let's the author of the post edit it.
// Match is the author trying to edit.
func (h *PostHandler) FacultyPostEdit(c *gin.Context) {
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

	// limit the edit window only for 30 minutes
	if time.Since(post.CreatedAt) >= 30*time.Minute {
		c.JSON(403, gin.H{"error": "edit window has been expired"})
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
func (h *PostHandler) FacultyPostDelete(c *gin.Context) {
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

	// check if the author is trying to delete
	if post.FacultyID != userID.(uint) {
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


// GetFacultyPosts fetch the posts of the faculty member along with their status and comments
// This API returns all the posts collectively
func (h *PostHandler) GetFacultyPosts(c *gin.Context) {
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
	Preload("Comments").
	Where("faculty_id = ?", faculty.ID).
	Find(&posts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch posts at the moment"})
		return
	}
	
	c.JSON(200, gin.H{"success": "posts fetched successfully", "posts": posts})
}


// FacultyPostComment allows the author of the post to
// comment on the post
func (h *PostHandler) FacultyPostComment(c *gin.Context) {
	// get email of the logged in user from gin context
	email, _ := c.Get(middleware.EmailKey)

	// find the user
	var faculty models.Faculty
	result := h.DB.Where("email = ?", email).Take(&faculty)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "user does not exists"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"});
		return;
	}

	// get post id from path parameters
	postIDString := c.Param("post_id")
	postIDU64, err := strconv.ParseUint(postIDString, 10, 64)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to parse post id"})
		return
	}

	// read database for this postIDU64
	var post models.FacultyPost
	result = h.DB.Where("id = ?", uint(postIDU64)).Take(&post)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "post unavailable"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	// validate the author of the post
	if post.FacultyID != faculty.ID {
		c.JSON(403, gin.H{"error": "you are not authorized to comment"})
		return
	}

	// bind input to json
	var inputs CommentType
	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(401, gin.H{"error": "invalid request body"})
		return
	}

	doc := models.Comment{
		CommentableID: uint(postIDU64),
		CommentableType: "faculty_posts",
		Content: inputs.Content,
		Email: faculty.Email,
		Role: "faculty",
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
