package handlers

import (
	"time"

	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ComplaintHandler struct {
	DB *gorm.DB
}

// FacultyReportComplaint registers the complaint of faculty members.
// forwards the complaint to the associated XEN.
func (h *ComplaintHandler) FacultyComplaint (c *gin.Context) {
	var inputs models.FacultyComplaint

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
	inputs.FacultyID = facultyId.(uint)

	inputs.CreatedAt = time.Now()
	inputs.UpdatedAt = time.Now()

	result := h.DB.Create(&inputs)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}
	
	c.JSON(201, gin.H{"success": "complaint submitted successfully", "complaint": inputs})
}

// WardenComplaint registers the complaint of warden members.
// forwards the complaint to the associated XEN.
func (h *ComplaintHandler) WardenComplaint (c *gin.Context) {
	var inputs models.WardenComplaint

	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	// gets userId from the context keys set by the IsAuthenticated middleware
	wardenId, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(401, gin.H{"error": "unauthenticated access"})
		return
	}
	inputs.WardenID = wardenId.(uint)

	// set default values
	inputs.CreatedAt = time.Now()
	inputs.UpdatedAt = time.Now()

	result := h.DB.Create(&inputs)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}

	c.JSON(201, gin.H{"error": "Complaint submitted successfully", "complaint": inputs})
}

// CentreHeadComplaint registers the complaint of centre-head members.
// forwards the complaint to the associated XEN.
func (h *ComplaintHandler) CentreHeadComplaint (c *gin.Context) {
	var inputs models.CentreHeadComplaint

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
	inputs.CentreHeadID = centreheadId.(uint)

	// set default values
	inputs.CreatedAt = time.Now()
	inputs.UpdatedAt = time.Now()

	result := h.DB.Create(&inputs)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "failed inserting to table"})
		return
	}

	c.JSON(201, gin.H{"message": "Complaint submitted successfully", "complaint": inputs})
}
