package handlers

import (
	"fmt"
	"net/http"

	"github.com/ayush00git/cms-web/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ComplaintHandler struct {
	DB *gorm.DB
}

// Let faculty members submit a new complaint
func (h *ComplaintHandler) FacultyReportComplaint(c *gin.Context) {
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

	if h.DB != nil {
		h.DB.Create(&complaint)
	}

	// Figure out which XEN should get the email based on the complaint type
	xenEmail := "xen_civil@nit.edu"
	if input.TypeOfComplaint == models.TypeElectrical {
		xenEmail = "xen_electrical@nit.edu"
	}

	fmt.Printf("Email to %s: New Faculty Complaint - A new %s complaint was reported: %s\n", xenEmail, input.TypeOfComplaint, input.Title)

	c.JSON(http.StatusOK, gin.H{"message": "Complaint submitted successfully", "complaint": complaint})
}

// Let wardens submit a complaint for their hostel
func (h *ComplaintHandler) WardenReportComplaint(c *gin.Context) {
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

	if h.DB != nil {
		h.DB.Create(&complaint)
	}

	// Figure out which XEN should get the email based on the complaint type
	xenEmail := "xen_civil@nit.edu"
	if input.TypeOfComplaint == models.TypeElectrical {
		xenEmail = "xen_electrical@nit.edu"
	}

	fmt.Printf("Email to %s: New Warden Complaint - A new %s complaint was reported for room %s: %s\n", xenEmail, input.TypeOfComplaint, input.RoomNumber, input.Title)

	c.JSON(http.StatusOK, gin.H{"message": "Complaint submitted successfully", "complaint": complaint})
}

// Let Centre Heads submit complaints for their department
func (h *ComplaintHandler) CentreHeadReportComplaint(c *gin.Context) {
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

	if h.DB != nil {
		h.DB.Create(&complaint)
	}

	// Figure out which XEN should get the email based on the complaint type
	xenEmail := "xen_civil@nit.edu"
	if input.TypeOfComplaint == models.TypeElectrical {
		xenEmail = "xen_electrical@nit.edu"
	}

	fmt.Printf("Email to %s: New Centre Head Complaint - A new %s complaint was reported by Centre Head: %s\n", xenEmail, input.TypeOfComplaint, input.Title)

	c.JSON(http.StatusOK, gin.H{"message": "Complaint submitted successfully", "complaint": complaint})
}

// Allow XEN to review the complaint and either pass it forward or reject it
func (h *ComplaintHandler) XENUpdateStatus(c *gin.Context) {
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
	if h.DB != nil {
		if err := h.DB.First(&complaint, input.ComplaintID).Error; err != nil {
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
		h.DB.Create(&comment)

		if input.Action == "pass" {
			complaint.Status = models.StatusPendingAE
			complaint.Stage = models.StageAE
			
			aeEmail := "ae_civil@nit.edu"
			if complaint.TypeOfComplaint == models.TypeElectrical {
				aeEmail = "ae_electrical@nit.edu"
			}
			fmt.Printf("Email to %s: Complaint Forwarded to AE - A complaint has been forwarded to you for action.\n", aeEmail)
		} else if input.Action == "reject" {
			complaint.Status = models.StatusRejected
			fmt.Println("Email to filer@nit.edu: Complaint Rejected - Your complaint has been rejected by XEN.")
		}
		h.DB.Save(&complaint)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated by XEN"})
}

// Allow AE to review the complaint, and if passing, assign a specific JE
func (h *ComplaintHandler) AEUpdateStatus(c *gin.Context) {
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
	if h.DB != nil {
		if err := h.DB.First(&complaint, input.ComplaintID).Error; err != nil {
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
		h.DB.Create(&comment)

		if input.Action == "pass" && input.SelectJE_ID != nil {
			complaint.Status = models.StatusPendingJE
			complaint.Stage = models.StageJE
			complaint.AssignedJE_ID = input.SelectJE_ID
			fmt.Println("Email to je@nit.edu: Complaint Assigned to JE - A new complaint has been assigned to you by AE.")
		} else if input.Action == "reject" {
			complaint.Status = models.StatusRejected
			fmt.Println("Email to filer@nit.edu: Complaint Rejected - Your complaint has been rejected by AE.")
		}
		h.DB.Save(&complaint)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated by AE"})
}

// Allow JE to mark the complaint as finally resolved or reject it
func (h *ComplaintHandler) JEUpdateStatus(c *gin.Context) {
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
	if h.DB != nil {
		if err := h.DB.First(&complaint, input.ComplaintID).Error; err != nil {
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
		h.DB.Create(&comment)

		if input.Action == "resolve" {
			complaint.Status = models.StatusResolved
			fmt.Println("Email to filer@nit.edu: Complaint Resolved - Your complaint has been successfully resolved.")
		} else if input.Action == "reject" {
			complaint.Status = models.StatusRejected
			fmt.Println("Email to filer@nit.edu: Complaint Rejected - Your complaint has been rejected by JE.")
		}
		h.DB.Save(&complaint)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated by JE"})
}

// Fetch all complaints and their comments to show on the public dashboard
func (h *ComplaintHandler) GetPublicDashboard(c *gin.Context) {
	var complaints []models.Complaint

	if h.DB != nil {
		h.DB.Preload("Comments").Find(&complaints)
	}

	c.JSON(http.StatusOK, gin.H{"complaints": complaints})
}
