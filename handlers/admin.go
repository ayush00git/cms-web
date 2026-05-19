package handlers

import (
	"errors"
	"strconv"
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

// func (h *AdminHandler) AdminPostStatus (c *gin.Context) {
// 	adminEmail, exists := c.Get(middleware.EmailKey)
// 	if !exists {
// 		c.JSON(401, gin.H{"error": "permission denied"})
// 		return
// 	}

// 	var admin models.Admin
// 	result := h.DB.Where("email = ?", adminEmail).Take(admin)
// 	if result.Error != nil {
// 		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
// 			c.JSON(404, gin.H{"error": "no authorization for accessing this page"})
// 			return
// 		}
// 		c.JSON(500, gin.H{"error": "internal server error"})
// 		return
// 	}

// 	postIdString := c.Param("post_id")
// 	postId, err := strconv.ParseUint(postIdString, 10, 64)
// 	if err != nil {
// 		c.JSON(500, gin.H{"error": "failed parsing the post_id"})
// 		return
// 	}

// 	tableMap := map[string]interface{} {
// 		"faculty_posts": &models.FacultyPost{},
// 		"warden_posts": &models.WardenPost{},
// 		"centrehead_posts": &models.CentreHeadPost{},
// 	}

// 	postType := c.Param("post_type")
// 	postModel, ok := tableMap[postType]
// 	if !ok {
// 		c.JSON(404, gin.H{"error": "invalid post type"})
// 		return
// 	}

// }
