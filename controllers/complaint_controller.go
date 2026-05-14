package controllers

import (
	"fmt"
	"net/http"

	"github.com/ayush00git/cms-web/database"
	"github.com/ayush00git/cms-web/models"
	"github.com/ayush00git/cms-web/services"
	"github.com/gin-gonic/gin"
)

// Let faculty members submit a new complaint
func FacultyReportComplaint(c *gin.Context) {
	var input struct {
		FacultyID       uint                  `json:"faculty_id" binding:"required"`
		Place           models.ComplaintPlace `json:"place" binding:"required"`
		TypeOfComplaint models.ComplaintType  `json:"type_of_complaint" binding:"required"`
		Title           string                `json:"title" binding:"required"`
		Description     string                `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	complaint := models.Complaint{
		Source:          models.SourceFaculty,
		FacultyID:       &input.FacultyID,
		Place:           input.Place,
		TypeOfComplaint: input.TypeOfComplaint,
		Title:           input.Title,
		Description:     input.Description,
		Status:          models.StatusPendingXEN,
		Stage:           models.StageXEN,
	}

	if database.DB != nil {
		database.DB.Create(&complaint)
	}

	// Figure out which XEN should get the email based on the complaint type
	xenEmail := "xen_civil@nit.edu"
	if input.TypeOfComplaint == models.TypeElectrical {
		xenEmail = "xen_electrical@nit.edu"
	}

	services.SendStatusEmail(xenEmail, "New Faculty Complaint", fmt.Sprintf("A new %s complaint was reported: %s", input.TypeOfComplaint, input.Title))

	c.JSON(http.StatusOK, gin.H{"message": "Complaint submitted successfully", "complaint": complaint})
}

// Let wardens submit a complaint for their hostel
func WardenReportComplaint(c *gin.Context) {
	var input struct {
		WardenID        uint                 `json:"warden_id" binding:"required"`
		TypeOfComplaint models.ComplaintType `json:"type_of_complaint" binding:"required"`
		RoomNumber      string               `json:"room_number" binding:"required"`
		Title           string               `json:"title" binding:"required"`
		Description     string               `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	complaint := models.Complaint{
		Source:          models.SourceWarden,
		WardenID:        &input.WardenID,
		RoomNumber:      input.RoomNumber,
		TypeOfComplaint: input.TypeOfComplaint,
		Title:           input.Title,
		Description:     input.Description,
		Status:          models.StatusPendingXEN,
		Stage:           models.StageXEN,
	}

	if database.DB != nil {
		database.DB.Create(&complaint)
	}

	// Figure out which XEN should get the email based on the complaint type
	xenEmail := "xen_civil@nit.edu"
	if input.TypeOfComplaint == models.TypeElectrical {
		xenEmail = "xen_electrical@nit.edu"
	}

	services.SendStatusEmail(xenEmail, "New Warden Complaint", fmt.Sprintf("A new %s complaint was reported for room %s: %s", input.TypeOfComplaint, input.RoomNumber, input.Title))

	c.JSON(http.StatusOK, gin.H{"message": "Complaint submitted successfully", "complaint": complaint})
}

// Let Centre Heads submit complaints for their department
func CentreHeadReportComplaint(c *gin.Context) {
	var input struct {
		CentreHeadID    uint                 `json:"centre_head_id" binding:"required"`
		TypeOfComplaint models.ComplaintType `json:"type_of_complaint" binding:"required"`
		Title           string               `json:"title" binding:"required"`
		Description     string               `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	complaint := models.Complaint{
		Source:          models.SourceCentreHead,
		CentreHeadID:    &input.CentreHeadID,
		TypeOfComplaint: input.TypeOfComplaint,
		Title:           input.Title,
		Description:     input.Description,
		Status:          models.StatusPendingXEN,
		Stage:           models.StageXEN,
	}

	if database.DB != nil {
		database.DB.Create(&complaint)
	}

	// Figure out which XEN should get the email based on the complaint type
	xenEmail := "xen_civil@nit.edu"
	if input.TypeOfComplaint == models.TypeElectrical {
		xenEmail = "xen_electrical@nit.edu"
	}

	services.SendStatusEmail(xenEmail, "New Centre Head Complaint", fmt.Sprintf("A new %s complaint was reported by Centre Head: %s", input.TypeOfComplaint, input.Title))

	c.JSON(http.StatusOK, gin.H{"message": "Complaint submitted successfully", "complaint": complaint})
}

// Allow XEN to review the complaint and either pass it forward or reject it
func XENUpdateStatus(c *gin.Context) {
	var input struct {
		ComplaintID uint   `json:"complaint_id" binding:"required"`
		Action      string `json:"action" binding:"required"` // "pass" or "reject"
		CommentText string `json:"comment" binding:"required"`
		AdminID     uint   `json:"admin_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var complaint models.Complaint
	if database.DB != nil {
		if err := database.DB.First(&complaint, input.ComplaintID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Complaint not found"})
			return
		}

		// Make sure the complaint is actually waiting for XEN's approval
		if complaint.Stage != models.StageXEN {
			c.JSON(http.StatusForbidden, gin.H{"error": "Complaint is not at XEN stage"})
			return
		}

		comment := models.Comment{
			ComplaintID: input.ComplaintID,
			AdminID:     input.AdminID,
			CommentText: input.CommentText,
		}
		database.DB.Create(&comment)

		if input.Action == "pass" {
			complaint.Status = models.StatusPendingAE
			complaint.Stage = models.StageAE
			
			aeEmail := "ae_civil@nit.edu"
			if complaint.TypeOfComplaint == models.TypeElectrical {
				aeEmail = "ae_electrical@nit.edu"
			}
			services.SendStatusEmail(aeEmail, "Complaint Forwarded to AE", "A complaint has been forwarded to you for action.")
		} else if input.Action == "reject" {
			complaint.Status = models.StatusRejected
			services.SendStatusEmail("filer@nit.edu", "Complaint Rejected", "Your complaint has been rejected by XEN.")
		}
		database.DB.Save(&complaint)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated by XEN"})
}

// Allow AE to review the complaint, and if passing, assign a specific JE
func AEUpdateStatus(c *gin.Context) {
	var input struct {
		ComplaintID uint   `json:"complaint_id" binding:"required"`
		Action      string `json:"action" binding:"required"` // "pass" or "reject"
		CommentText string `json:"comment" binding:"required"`
		SelectJE_ID *uint  `json:"select_je_id"` // required if pass
		AdminID     uint   `json:"admin_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var complaint models.Complaint
	if database.DB != nil {
		if err := database.DB.First(&complaint, input.ComplaintID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Complaint not found"})
			return
		}

		if complaint.Stage != models.StageAE {
			c.JSON(http.StatusForbidden, gin.H{"error": "Complaint is not at AE stage"})
			return
		}

		comment := models.Comment{
			ComplaintID: input.ComplaintID,
			AdminID:     input.AdminID,
			CommentText: input.CommentText,
		}
		database.DB.Create(&comment)

		if input.Action == "pass" && input.SelectJE_ID != nil {
			complaint.Status = models.StatusPendingJE
			complaint.Stage = models.StageJE
			complaint.AssignedJE_ID = input.SelectJE_ID
			services.SendStatusEmail("je@nit.edu", "Complaint Assigned to JE", "A new complaint has been assigned to you by AE.")
		} else if input.Action == "reject" {
			complaint.Status = models.StatusRejected
			services.SendStatusEmail("filer@nit.edu", "Complaint Rejected", "Your complaint has been rejected by AE.")
		}
		database.DB.Save(&complaint)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated by AE"})
}

// Allow JE to mark the complaint as finally resolved or reject it
func JEUpdateStatus(c *gin.Context) {
	var input struct {
		ComplaintID uint   `json:"complaint_id" binding:"required"`
		Action      string `json:"action" binding:"required"` // "resolve" or "reject"
		CommentText string `json:"comment" binding:"required"`
		AdminID     uint   `json:"admin_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var complaint models.Complaint
	if database.DB != nil {
		if err := database.DB.First(&complaint, input.ComplaintID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Complaint not found"})
			return
		}

		if complaint.Stage != models.StageJE {
			c.JSON(http.StatusForbidden, gin.H{"error": "Complaint is not at JE stage"})
			return
		}

		comment := models.Comment{
			ComplaintID: input.ComplaintID,
			AdminID:     input.AdminID,
			CommentText: input.CommentText,
		}
		database.DB.Create(&comment)

		if input.Action == "resolve" {
			complaint.Status = models.StatusResolved
			services.SendStatusEmail("filer@nit.edu", "Complaint Resolved", "Your complaint has been successfully resolved.")
		} else if input.Action == "reject" {
			complaint.Status = models.StatusRejected
			services.SendStatusEmail("filer@nit.edu", "Complaint Rejected", "Your complaint has been rejected by JE.")
		}
		database.DB.Save(&complaint)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated by JE"})
}

// Fetch all complaints and their comments to show on the public dashboard
func GetPublicDashboard(c *gin.Context) {
	var complaints []models.Complaint

	if database.DB != nil {
		database.DB.Preload("Comments").Find(&complaints)
	}

	c.JSON(http.StatusOK, gin.H{"complaints": complaints})
}

