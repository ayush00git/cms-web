package handlers

import (
	"strconv"
	"strings"

	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetXENPosts fetch posts (all that were posted) where status of post is
// Pending_XEN PENDING_AE PENDING_JE Resolved_JE Resolved Closed
func (h *AdminHandler) GetXENPosts (c *gin.Context) {

	emailID, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "access denied"})
		return
	}

	var admin models.Admin
	result := h.DB.Where("email = ?", emailID).Take(&admin)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed at the moment"})
		return
	}

	// only allow admins type XEN to enter this route
	if admin.Position != "XEN_Civil" && admin.Position != "XEN_Electrical" {
		c.JSON(403, gin.H{"error": "only XENs are allowed access to this page"})
		return
	}

	// sort type_of_post according to position type of admins (civil / electrical)
	var postType string
	if strings.Contains(string(admin.Position), "Civil") {
		postType = "Civil"
	} else {
		postType = "Electrical"
	}

	var facultyPosts []models.FacultyPost
	var wardenPosts []models.WardenPost
	var centreheadPosts []models.CentreHeadPost

	// fetch faculty posts
	// this api only returns the fields that are required at the
	// main page of all queries
	result = h.DB.Select("id, title, type_of_post, status, assigned_je_id").
	Where("status IN ?", []string{"Pending_XEN", "Resolved_JE", "Pending_JE", "Pending_AE", "Resolved", "Closed"}).
	Where("type_of_post = ?", postType).
	Find(&facultyPosts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch faculty posts at the moment"})
		return
	}

	result = h.DB.Select("id, title, type_of_post, status, assigned_je_id").
	Where("status IN ?", []string{"Pending_XEN", "Resolved_JE", "Pending_JE", "Pending_AE", "Resolved", "Closed"}).
	Where("type_of_post = ?", postType).
	Find(&wardenPosts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch warden posts at the moment"})
		return
	}

	result = h.DB.Select("id, title, type_of_post, status, assigned_je_id").
	Where("status IN ?", []string{"Pending_XEN", "Resolved_JE", "Pending_JE", "Pending_AE", "Resolved", "Closed"}).
	Where("type_of_post = ?", postType).
	Find(&centreheadPosts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch centre head posts at the moment"})
		return
	}

	c.JSON(200, gin.H{
		"success": "posts fetched successfully",
		"faculty_posts": facultyPosts,
		"warden_posts": wardenPosts,
		"centre_head_posts": centreheadPosts,
	})
}


// GetAEPosts fetch posts where status of post is
// Pending_AE Pending_JE
func (h* AdminHandler) GetAEPosts (c *gin.Context) {

	// get email of user from gin context
	email, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "access denied"})
		return
	}

	// see if admin with that email exists
	var admin models.Admin
	result := h.DB.Where("email = ?", email).Take(&admin)
	if result.Error != nil {
		c.JSON(403, gin.H{"error": "failed at the moment"})
		return
	}

	// see the posititon type of admin
	if admin.Position != "AE_Civil" && admin.Position != "AE_Electrical" {
		c.JSON(403, gin.H{"error": "only AEs are allowed to access this page"})
		return
	}

	var postType string
	if strings.Contains(string(admin.Position), "Civil") {
		postType = "Civil"
	} else {
		postType = "Electical"
	}

	var facultyPosts []models.FacultyPost
	var wardenPosts []models.WardenPost
	var centreheadPosts []models.CentreHeadPost

	// fetch faculty posts
	result = h.DB.Select("id, title, type_of_post, status, assigned_je_id").
	Where("type_of_post = ?", postType).
	Where("status IN ?", []string{"Pending_AE", "Pending_JE"}).
	Find(&facultyPosts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch faculty posts at the moment"})
		return
	}

	// fetch warden posts
	result = h.DB.Select("id, title, type_of_post, status, assigned_je_id").
	Where("type_of_post = ?", postType).
	Where("status IN ?", []string{"Pending_AE", "Pending_JE"}).
	Find(&wardenPosts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch warden posts at the moment"})
		return
	}

	// fetch centrehead posts
	result = h.DB.Select("id, title, type_of_post, status, assigned_je_id").
	Where("type_of_post = ?", postType).
	Where("status IN ?", []string{"Pending_AE", "Pending_JE"}).
	Find(&centreheadPosts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch centre head posts at the moment"})
		return
	}

	c.JSON(200, gin.H{
		"success": "posts fetched successfully",
		"faculty_posts": facultyPosts,
		"warden_posts": wardenPosts,
		"centre_head_posts": centreheadPosts,
	})
}


// GetJEPosts fetch posts where status of Post is
// Pending_JE Resolved_JE
func (h* AdminHandler) GetJEPosts (c *gin.Context) {

	// get email of user from gin context
	email, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "access denied"})
		return
	}

	// see if admin with that email exists
	var admin models.Admin
	result := h.DB.Where("email = ?", email).Take(&admin)
	if result.Error != nil {
		c.JSON(403, gin.H{"error": "failed at the moment"})
		return
	}

	// see the posititon type of admin
	if admin.Position != "JE_Civil" && admin.Position != "JE_Electrical" {
		c.JSON(403, gin.H{"error": "only JEs are allowed to access this page"})
		return
	}

	var postType string
	if strings.Contains(string(admin.Position), "Civil") {
		postType = "Civil"
	} else {
		postType = "Electical"
	}

	var facultyPosts []models.FacultyPost
	var wardenPosts []models.WardenPost
	var centreheadPosts []models.CentreHeadPost

	// fetch faculty posts
	result = h.DB.Select("id, title, type_of_post, status, assigned_je_id").
	Where("type_of_post = ?", postType).
	Where("status IN ?", []string{"Resolved_JE", "Pending_JE"}).
	Find(&facultyPosts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch faculty posts at the moment"})
		return
	}

	// fetch warden posts
	result = h.DB.Select("id, title, type_of_post, status, assigned_je_id").
	Where("type_of_post = ?", postType).
	Where("status IN ?", []string{"Resolved_JE", "Pending_JE"}).
	Find(&wardenPosts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch warden posts at the moment"})
		return
	}

	// fetch centrehead posts
	result = h.DB.Select("id, title, type_of_post, status, assigned_je_id").
	Where("type_of_post = ?", postType).
	Where("status IN ?", []string{"Resolved_JE", "Pending_JE"}).
	Find(&centreheadPosts)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to fetch centre head posts at the moment"})
		return
	}

	c.JSON(200, gin.H{
		"success": "posts fetched successfully",
		"faculty_posts": facultyPosts,
		"warden_posts": wardenPosts,
		"centre_head_posts": centreheadPosts,
	})
}

// for now we treat 404 and 500 during fetching post the same
func (h *AdminHandler) AdminGetPost (c *gin.Context) {

	// get email from gin context
	email, exists := c.Get(middleware.EmailKey)
	if !exists {
		c.JSON(401, gin.H{"error": "access denied"})
		return
	}

	// check if logged in user is admin?
	var admin models.Admin
	result := h.DB.Where("email = ?", email).Take(&admin)
	if result.Error != nil {
		c.JSON(403, gin.H{"error": "access denied"})
		return
	}

	// get role and post_id from query parameters
	role := c.Param("role")

	postIDString := c.Param("post_id")
	postID64, err := strconv.ParseUint(postIDString, 10, 64)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to parse the post_id"})
		return
	}
	postID := uint(postID64)
	var reqPost any
	// get the post table type from the role
	switch role {
	case "faculty":
		var post models.FacultyPost
		result := h.DB.Preload("Author", func (db *gorm.DB) (*gorm.DB) {
			return db.Select("id, email, name, house_number, department, phone_number, block, type")
		}).
		Where("id = ?", postID).Take(&post)
		if result.Error != nil {
			c.JSON(404, gin.H{"error": "failed to fetch the post"})
			return
		}
		reqPost = post
	case "warden":
		var post models.WardenPost
		result := h.DB.Preload("Author", func (db *gorm.DB) (*gorm.DB) {
			return db.Select("id, email, hostel, phone_number")
		}).
		Where("id = ?", postID).Take(&post)
		if result.Error != nil {
			c.JSON(404, gin.H{"error": "failed to fetch the post"})
			return
		}
		reqPost = post
	case "centrehead":
		var post models.CentreHeadPost
		result := h.DB.Preload("Author", func (db *gorm.DB) (*gorm.DB) {
			return db.Select("id, email, building, phone_number")
		}).
		Where("id = ?", postID).Take(&post)
		if result.Error != nil {
			c.JSON(404, gin.H{"error": "failed to fetch the post"})
			return
		}
		reqPost = post
	default:
		c.JSON(403, gin.H{"error": "undefined role"})
		return
	}

	c.JSON(200, gin.H{"success": "post fetched", "post": reqPost})
}
