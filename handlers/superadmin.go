package handlers

import (
	"errors"

	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SuperAdminGetFacultyPosts fetches faculty authored posts with a limit
// of 25 latest ones.
func (h *SuperAdminHandler) SuperAdminGetFacultyPosts(c *gin.Context) {
	email, ok := c.Get(middleware.EmailKey)
	if !ok {
		c.JSON(401, gin.H{"error": "unauthenticated access!"})
		return
	}

	// check if the user is a superadmin.
	var admin models.SuperAdmin
	result := h.DB.Where("email = ?", email).Take(&admin)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(403, gin.H{"error": "you are not authorized for this action. get back!"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch at the moment"})
		return
	}

	// fetch all faculty posts.
	// limit set to 25 latest posts in a single fetch.
	var posts []models.FacultyPost
	result = h.DB.Find(&posts).
	Order("created_at DESC").
	Limit(25).
	Preload("Comments").
	Preload("Author", func(db *gorm.DB) (*gorm.DB) {
		return db.Select("id, name, email, department, house_number, block, type, phone_number")
	})

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "no record found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch faculty posts at the moment."})
		return
	}

	c.JSON(200, gin.H{
		"success": "faculty posts fetched successfully!",
		"posts": posts,
	})
}

// SuperAdminGetWardenPosts fetches warden authored posts with a limit
// of 25 latest ones.
func (h *SuperAdminHandler) SuperAdminGetWardenPosts(c *gin.Context) {
	email, ok := c.Get(middleware.EmailKey)
	if !ok {
		c.JSON(401, gin.H{"error": "unauthenticated access!"})
		return
	}

	// check if the user is a superadmin.
	var admin models.SuperAdmin
	result := h.DB.Where("email = ?", email).Take(&admin)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(403, gin.H{"error": "you are not authorized for this action. get back!"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch at the moment"})
		return
	}

	// fetch all warden posts.
	// limit set to 25 latest posts in a single fetch.
	var posts []models.WardenPost
	result = h.DB.Find(&posts).
	Order("created_at DESC").
	Limit(25).
	Preload("Comments").
	Preload("Author", func(db *gorm.DB) (*gorm.DB) {
		return db.Select("id, name, email, hostel, phone_number")
	})

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "no record found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch warden posts at the moment."})
		return
	}

	c.JSON(200, gin.H{
		"success": "warden posts fetched successfully!",
		"posts": posts,
	})
}


func (h *SuperAdminHandler) SuperAdminGetCentreheadPosts(c *gin.Context) {
	email, ok := c.Get(middleware.EmailKey)
	if !ok {
		c.JSON(401, gin.H{"error": "unauthenticated access!"})
		return
	}

	// check if the user is a superadmin.
	var admin models.SuperAdmin
	result := h.DB.Where("email = ?", email).Take(&admin)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(403, gin.H{"error": "you are not authorized for this action. get back!"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch at the moment"})
		return
	}

	// fetch all warden posts.
	// limit set to 25 latest posts in a single fetch.
	var posts []models.CentreheadPost
	result = h.DB.Find(&posts).
	Order("created_at DESC").
	Limit(25).
	Preload("Comments").
	Preload("Author", func(db *gorm.DB) (*gorm.DB) {
		return db.Select("id, name, email, building, phone_number")
	})

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "no record found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch centrehead posts at the moment."})
		return
	}

	c.JSON(200, gin.H{
		"success": "centrehead posts fetched successfully!",
		"posts": posts,
	})
}
