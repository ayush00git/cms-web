package handlers

import (
	"errors"
	"strconv"

	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// superAdminPageSize is how many posts a single fetch returns.
const superAdminPageSize = 25

// pageOffset reads the "offset" query param, defaulting to 0.
func pageOffset(c *gin.Context) int {
	offset, err := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if err != nil || offset < 0 {
		return 0
	}
	return offset
}

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
	// paginated: 25 per page via ?offset=N.
	var posts []models.FacultyPost
	offset := pageOffset(c)
	result = h.DB.Order("created_at DESC").
	Offset(offset).
	Limit(superAdminPageSize + 1).
	Preload("Comments").
	Preload("Author", func(db *gorm.DB) (*gorm.DB) {
		return db.Select("id, name, email, department, house_number, block, type, phone_number")
	}).
	Find(&posts)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "no record found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch faculty posts at the moment."})
		return
	}

	// one extra row was fetched only to know whether a next page exists.
	hasMore := len(posts) > superAdminPageSize
	if hasMore {
		posts = posts[:superAdminPageSize]
	}

	c.JSON(200, gin.H{
		"success": "faculty posts fetched successfully!",
		"posts": posts,
		"has_more": hasMore,
		"next_offset": offset + len(posts),
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
	// paginated: 25 per page via ?offset=N.
	var posts []models.WardenPost
	offset := pageOffset(c)
	result = h.DB.Order("created_at DESC").
	Offset(offset).
	Limit(superAdminPageSize + 1).
	Preload("Comments").
	Preload("Author", func(db *gorm.DB) (*gorm.DB) {
		return db.Select("id, name, email, hostel, phone_number")
	}).
	Find(&posts)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "no record found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch warden posts at the moment."})
		return
	}

	// one extra row was fetched only to know whether a next page exists.
	hasMore := len(posts) > superAdminPageSize
	if hasMore {
		posts = posts[:superAdminPageSize]
	}

	c.JSON(200, gin.H{
		"success": "warden posts fetched successfully!",
		"posts": posts,
		"has_more": hasMore,
		"next_offset": offset + len(posts),
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
	// paginated: 25 per page via ?offset=N.
	var posts []models.CentreheadPost
	offset := pageOffset(c)
	result = h.DB.Order("created_at DESC").
	Offset(offset).
	Limit(superAdminPageSize + 1).
	Preload("Comments").
	Preload("Author", func(db *gorm.DB) (*gorm.DB) {
		return db.Select("id, name, email, building, phone_number")
	}).
	Find(&posts)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "no record found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch centrehead posts at the moment."})
		return
	}

	// one extra row was fetched only to know whether a next page exists.
	hasMore := len(posts) > superAdminPageSize
	if hasMore {
		posts = posts[:superAdminPageSize]
	}

	c.JSON(200, gin.H{
		"success": "centrehead posts fetched successfully!",
		"posts": posts,
		"has_more": hasMore,
		"next_offset": offset + len(posts),
	})
}
