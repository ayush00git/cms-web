package handlers

import (
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AdminHandler struct {
	DB *gorm.DB
}

type CommentType struct {
	Content	string
}

type AdminReview struct {
	Review	string
}

// // Use AdminSignup only when registering admins to the database.
// // Not to be used as a public API. 
// func (h *AdminHandler) AdminSignup (c *gin.Context) {
// 	var inputs models.Admin
// 	if err := c.ShouldBindJSON(&inputs); err != nil {
// 		c.JSON(400, gin.H{"error": "invalid request body"})
// 		return
// 	}

// 	hashedPass, err := bcrypt.GenerateFromPassword([]byte(inputs.Password), 10)
// 	if err != nil {
// 		c.JSON(500, gin.H{"error": "internal server error"})
// 		return
// 	}
// 	inputs.Password = string(hashedPass)

// 	inputs.CreatedAt = time.Now()
// 	_ = h.DB.Create(&inputs)
// 	c.JSON(201, gin.H{"success": "admin registered successfully!"})
// }

func (h *AdminHandler) AdminLogin (c *gin.Context) {
	var inputs models.AdminLogin

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	var admin models.Admin
	result := h.DB.Where("email = ?", inputs.Email).Take(&admin)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "admin record not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(inputs.Password))
	if err != nil {
		c.JSON(401, gin.H{"error": "incorrect password!"})
		return
	}

	token, err := helpers.GenerateToken(admin.ID, admin.Email)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to generate a token"})
		return
	}

	c.SetCookie(
		"token",
		token,
		30 * 24 * 60 * 60,
		"/",
		"localhost",
		false,
		true,
	)

	c.JSON(200, gin.H{"success": "logged in successfully!"})
}

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
		"wardens_posts": &models.WardenPost{},
		"centreheads_posts": &models.CentreHeadPost{},
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

// AdminFacultyPostStatus sets the stage of the faculty posts
func (h *AdminHandler) AdminFacultyPostStatus (c *gin.Context) {
	adminEmail, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "permission denied"})
		return
	}

	var admin models.Admin
	result := h.DB.Where("email = ?", adminEmail).Take(&admin)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "no authorization for accessing this page"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	postIDString := c.Param("post_id")
	postID, err := strconv.ParseUint(postIDString, 10, 64)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to parse post_id"})
		return
	}

	// see if this post exists
	var post models.FacultyPost
	result = h.DB.Where("id = ?", uint(postID)).Take(&post)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "post not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}
	
	// accepted / rejected type of response would be accepted by the admin
	// true by XEN means send it to Pending_AE status
	// false by XEN means post is closed
	// only a XEN is allowed to open/close the post
	// je can't close the post as the post query is resolved by him, he just sends a signal "Resolved_JE"
	
	var review AdminReview
	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}


	switch post.Status {
	case "Pending_XEN" :
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "to_ae" {
			post.Status = "Pending_AE"
		} else if review.Review == "open" {
			post.Status = "Pending_XEN"
		} else if review.Review == "close" {
			post.Status = "Closed"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	
	case "Pending_AE":
		if !strings.Contains(string(admin.Position), "AE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "to_je" {
			post.Status = "Pending_JE"
		} else if review.Review == "require_review" {
			post.Status = "Pending_XEN"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	case "Pending_JE":
		if !strings.Contains(string(admin.Position), "JE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "resolved" {
			post.Status = "Resolved_JE"
		} else if review.Review == "require_review" {
			post.Status = "Pending_AE"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	case "Closed":
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "open" {
			post.Status = "Pending_XEN"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	default:
		c.JSON(400, gin.H{"error": "invalid review type"})
		return
	}

	result = h.DB.Model(&post).Updates(post)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed updating the post"})
		return
	}
	c.JSON(200, gin.H{"success": "status updated"})
}

// AdminWardenPostStatus sets the stage of the warden posts
func (h *AdminHandler) AdminWardenPostStatus (c *gin.Context) {
	adminEmail, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "permission denied"})
		return
	}

	var admin models.Admin
	result := h.DB.Where("email = ?", adminEmail).Take(&admin)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "no authorization for accessing this page"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	postIDString := c.Param("post_id")
	postID, err := strconv.ParseUint(postIDString, 10, 64)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to parse post_id"})
		return
	}

	// see if this post exists
	var post models.WardenPost
	result = h.DB.Where("id = ?", uint(postID)).Take(&post)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "post not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}
	
	// accepted / rejected type of response would be accepted by the admin
	// true by XEN means send it to Pending_AE status
	// false by XEN means post is closed
	var review AdminReview
	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}


	switch post.Status {
	case "Pending_XEN" :
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "to_ae" {
			post.Status = "Pending_AE"
		} else if review.Review == "open" {
			post.Status = "Pending_XEN"
		} else if review.Review == "close" {
			post.Status = "Closed"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	
	case "Pending_AE":
		if !strings.Contains(string(admin.Position), "AE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "to_je" {
			post.Status = "Pending_JE"
		} else if review.Review == "require_review" {
			post.Status = "Pending_XEN"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	case "Pending_JE":
		if !strings.Contains(string(admin.Position), "JE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "resolved" {
			post.Status = "Resolved_JE"
		} else if review.Review == "require_review" {
			post.Status = "Pending_AE"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	case "Closed":
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "open" {
			post.Status = "Pending_XEN"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	default:
		c.JSON(400, gin.H{"error": "invalid review type"})
		return
	}

	result = h.DB.Model(&post).Updates(post)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed updating the post"})
		return
	}
	c.JSON(200, gin.H{"success": "status updated"})
}

// AdminCentreHeadPostStatus sets the stage of the centre_head posts
func (h *AdminHandler) AdminCentreHeadPostStatus (c *gin.Context) {
	adminEmail, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "permission denied"})
		return
	}

	var admin models.Admin
	result := h.DB.Where("email = ?", adminEmail).Take(&admin)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "no authorization for accessing this page"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	postIDString := c.Param("post_id")
	postID, err := strconv.ParseUint(postIDString, 10, 64)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to parse post_id"})
		return
	}

	// see if this post exists
	var post models.CentreHeadPost
	result = h.DB.Where("id = ?", uint(postID)).Take(&post)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "post not found"})
			return
		}
		c.JSON(500, gin.H{"error": "internal server error"})
		return
	}
	
	// accepted / rejected type of response would be accepted by the admin
	// true by XEN means send it to Pending_AE status
	// false by XEN means post is closed
	var review AdminReview
	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}


	switch post.Status {
	case "Pending_XEN" :
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "to_ae" {
			post.Status = "Pending_AE"
		} else if review.Review == "open" {
			post.Status = "Pending_XEN"
		} else if review.Review == "close" {
			post.Status = "Closed"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	
	case "Pending_AE":
		if !strings.Contains(string(admin.Position), "AE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "to_je" {
			post.Status = "Pending_JE"
		} else if review.Review == "require_review" {
			post.Status = "Pending_XEN"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	case "Pending_JE":
		if !strings.Contains(string(admin.Position), "JE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "resolved" {
			post.Status = "Resolved_JE"
		} else if review.Review == "require_review" {
			post.Status = "Pending_AE"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	case "Closed":
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "open" {
			post.Status = "Pending_XEN"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	default:
		c.JSON(400, gin.H{"error": "invalid review type"})
		return
	}

	result = h.DB.Model(&post).Updates(post)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed updating the post"})
		return
	}
	c.JSON(200, gin.H{"success": "status updated"})
}
