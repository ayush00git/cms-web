package handlers

import (
	"errors"
	"log"
	"time"

	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"
	"github.com/ayush00git/cms-web/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SuperAdminHandler struct {
	DB 	*gorm.DB
}

// Passwordless login via a magic link,
// considering a pre-seeded database here.
type SuperAdminLogin struct {
	Email		string		`json:"email" binding:"required,max=255"`
}

func (h *SuperAdminHandler) SuperAdminLogin(c *gin.Context) {
	var inputs SuperAdminLogin
	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	// read db for verifying is user a superadmin or not.
	var superAdmin models.SuperAdmin
	result := h.DB.Where("email = ?", inputs.Email).Take(&superAdmin)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(403, gin.H{"error": "you are not authorized for this action. get back!"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to lookup rn"})
		return
	}
	
	// send email to the user.
	err := services.SendProfileAccessMailToSuperAdmins(superAdmin.ID, superAdmin.Email)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed sending an access email"})
		return
	}

	// just for keeping a latest login track.
	// do not return if this action fails.
	superAdmin.VisitedAt = time.Now()
	result = h.DB.Updates(&superAdmin)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed updating visited-at at the moment"})
	}

	c.JSON(200, gin.H{"success": "an email has been sent to you with the access link"})
}

// SuperAdminAccess opens from the magic login link, and verifies
// the user's identity through the jwt token.
func (h *SuperAdminHandler) SuperAdminAccess(c *gin.Context) {
	token := c.Query("token")
	claims, err := helpers.VerifyToken(token)
	if err != nil {
		c.JSON(401, gin.H{"error": "unauthenticated access!"})
		return
	}

	email := claims.Email

	// check for this email in superadmin table.
	var superAdmin models.SuperAdmin
	result := h.DB.Where("email = ?", email).Take(&superAdmin)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed to lookup at the moment"})
		return
	}

	c.SetCookie(
		"token",
		token,
		3 * 24 * 60 * 60,	// 3 days.
		"/",
		helpers.GetEnvWithDefault("COOKIE_DOMAIN", "localhost"),
		true,
		false,
	)

	c.JSON(200, gin.H{"success": "logged in successfully!"})
}

func (h *SuperAdminHandler) SuperAdminAssignNewAdmin(c *gin.Context) {
	email, ok := c.Get(middleware.EmailKey)
	if !ok {
		c.JSON(401, gin.H{"error": "unauthenticated access!"})
		return
	}

	// check if the caller is a superadmin.
	var superAdmin models.SuperAdmin
	result := h.DB.Where("email = ?", email).Take(&superAdmin)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(403, gin.H{"error": "you are not authorized for this action. get back!"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to lookup at the moment"})
		return
	}

	var newAdmin models.SuperAdmin
	if err := c.ShouldBindJSON(&newAdmin); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}
	// never trust client-supplied ids or timestamps.
	newAdmin.ID = 0
	newAdmin.CreatedAt = time.Now()

	result = h.DB.Create(&newAdmin)
	if result.Error != nil {
		// email carries a unique index; the db rejects duplicates.
		if errors.Is(result.Error, gorm.ErrDuplicatedKey) {
			c.JSON(409, gin.H{"error": "a superadmin with this email already exists"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to assign an new admin."})
		return
	}

	// send an email to the newly assigned.
	go func(email string) {
		err := services.SendAccessMailToAssignedSuperAdmins(email)
		if err != nil {
			log.Printf("superadmin invite mail to %s failed: %v", email, err)
		}
	}(newAdmin.Email)

	c.JSON(201, gin.H{"success": "new superadmin assigned!", "admin": newAdmin})
}
