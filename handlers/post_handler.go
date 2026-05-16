package handlers

import (
	"fmt"
	"net/http"

	"github.com/ayush00git/cms-web/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PostHandler struct {
	DB *gorm.DB
}

// Let faculty members submit a new post
func (h *PostHandler) FacultyReportPost(c *gin.Context) {
	var input struct {
		FacultyID       uint                  `json:"faculty_id" binding:"required"`
		Place           models.PostPlace `json:"place" binding:"required"`
		TypeOfPost models.PostType  `json:"type_of_post" binding:"required"`
		Title           string                `json:"title" binding:"required"`
		Description     string                `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post := models.FacultyPost{
		FacultyID:       &input.FacultyID,
		Place:           input.Place,
		TypeOfPost: input.TypeOfPost,
		Title:           input.Title,
		Description:     input.Description,
		Status:          models.StatusPendingXEN,
		Stage:           models.StageXEN,
	}

	if h.DB != nil {
		h.DB.Create(&post)
	}

	xenEmail := "xen_civil@nit.edu"
	if input.TypeOfPost == models.TypeElectrical {
		xenEmail = "xen_electrical@nit.edu"
	}

	fmt.Printf("Email to %s: New Faculty Post - A new %s post was reported: %s\n", xenEmail, input.TypeOfPost, input.Title)

	c.JSON(http.StatusOK, gin.H{"message": "Post submitted successfully", "post": post})
}

// Let wardens submit a post for their hostel
func (h *PostHandler) WardenReportPost(c *gin.Context) {
	var input struct {
		WardenID        uint                 `json:"warden_id" binding:"required"`
		TypeOfPost models.PostType `json:"type_of_post" binding:"required"`
		RoomNumber      string               `json:"room_number" binding:"required"`
		Title           string               `json:"title" binding:"required"`
		Description     string               `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post := models.WardenPost{
		WardenID:        &input.WardenID,
		RoomNumber:      input.RoomNumber,
		TypeOfPost: input.TypeOfPost,
		Title:           input.Title,
		Description:     input.Description,
		Status:          models.StatusPendingXEN,
		Stage:           models.StageXEN,
	}

	if h.DB != nil {
		h.DB.Create(&post)
	}

	xenEmail := "xen_civil@nit.edu"
	if input.TypeOfPost == models.TypeElectrical {
		xenEmail = "xen_electrical@nit.edu"
	}

	fmt.Printf("Email to %s: New Warden Post - A new %s post was reported for room %s: %s\n", xenEmail, input.TypeOfPost, input.RoomNumber, input.Title)

	c.JSON(http.StatusOK, gin.H{"message": "Post submitted successfully", "post": post})
}

// Let Centre Heads submit posts for their department
func (h *PostHandler) CentreHeadReportPost(c *gin.Context) {
	var input struct {
		CentreHeadID    uint                 `json:"centre_head_id" binding:"required"`
		TypeOfPost models.PostType `json:"type_of_post" binding:"required"`
		Title           string               `json:"title" binding:"required"`
		Description     string               `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post := models.CentreHeadPost{
		CentreHeadID:    &input.CentreHeadID,
		TypeOfPost: input.TypeOfPost,
		Title:           input.Title,
		Description:     input.Description,
		Status:          models.StatusPendingXEN,
		Stage:           models.StageXEN,
	}

	if h.DB != nil {
		h.DB.Create(&post)
	}

	xenEmail := "xen_civil@nit.edu"
	if input.TypeOfPost == models.TypeElectrical {
		xenEmail = "xen_electrical@nit.edu"
	}

	fmt.Printf("Email to %s: New Centre Head Post - A new %s post was reported by Centre Head: %s\n", xenEmail, input.TypeOfPost, input.Title)

	c.JSON(http.StatusOK, gin.H{"message": "Post submitted successfully", "post": post})
}

// Allow XEN to review the post and either pass it forward or reject it
func (h *PostHandler) XENUpdateStatus(c *gin.Context) {
	var input struct {
		Source      string `json:"source" binding:"required"` // "Faculty", "Warden", "CentreHead"
		PostID uint   `json:"post_id" binding:"required"`
		Action      string `json:"action" binding:"required"` // "pass" or "reject"
		CommentText string `json:"comment" binding:"required"`
		AdminID     uint   `json:"admin_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if h.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection missing"})
		return
	}

	var typeOfPost models.PostType
	var stage models.PostStage
	commentableType := input.Source + "Post"

	// Fetch and update based on source
	if input.Source == string(models.SourceFaculty) {
		var post models.FacultyPost
		if err := h.DB.First(&post, input.PostID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		typeOfPost = post.TypeOfPost
		stage = post.Stage
		if stage != models.StageXEN {
			c.JSON(http.StatusForbidden, gin.H{"error": "Post is not at XEN stage"})
			return
		}
		if input.Action == "pass" {
			post.Status = models.StatusPendingAE
			post.Stage = models.StageAE
		} else if input.Action == "reject" {
			post.Status = models.StatusRejected
		}
		h.DB.Save(&post)

	} else if input.Source == string(models.SourceWarden) {
		var post models.WardenPost
		if err := h.DB.First(&post, input.PostID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		typeOfPost = post.TypeOfPost
		stage = post.Stage
		if stage != models.StageXEN {
			c.JSON(http.StatusForbidden, gin.H{"error": "Post is not at XEN stage"})
			return
		}
		if input.Action == "pass" {
			post.Status = models.StatusPendingAE
			post.Stage = models.StageAE
		} else if input.Action == "reject" {
			post.Status = models.StatusRejected
		}
		h.DB.Save(&post)

	} else if input.Source == string(models.SourceCentreHead) {
		var post models.CentreHeadPost
		if err := h.DB.First(&post, input.PostID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		typeOfPost = post.TypeOfPost
		stage = post.Stage
		if stage != models.StageXEN {
			c.JSON(http.StatusForbidden, gin.H{"error": "Post is not at XEN stage"})
			return
		}
		if input.Action == "pass" {
			post.Status = models.StatusPendingAE
			post.Stage = models.StageAE
		} else if input.Action == "reject" {
			post.Status = models.StatusRejected
		}
		h.DB.Save(&post)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid source"})
		return
	}

	// Create the comment
	comment := models.Comment{
		CommentableID:   input.PostID,
		CommentableType: commentableType,
		AdminID:         input.AdminID,
		CommentText:     input.CommentText,
	}
	h.DB.Create(&comment)

	if input.Action == "pass" {
		aeEmail := "ae_civil@nit.edu"
		if typeOfPost == models.TypeElectrical {
			aeEmail = "ae_electrical@nit.edu"
		}
		fmt.Printf("Email to %s: Post Forwarded to AE - A post has been forwarded to you for action.\n", aeEmail)
	} else if input.Action == "reject" {
		fmt.Println("Email to filer@nit.edu: Post Rejected - Your post has been rejected by XEN.")
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated by XEN"})
}

// Allow AE to review the post, and if passing, assign a specific JE
func (h *PostHandler) AEUpdateStatus(c *gin.Context) {
	var input struct {
		Source      string `json:"source" binding:"required"`
		PostID uint   `json:"post_id" binding:"required"`
		Action      string `json:"action" binding:"required"` // "pass" or "reject"
		CommentText string `json:"comment" binding:"required"`
		SelectJE_ID *uint  `json:"select_je_id"` // required if pass
		AdminID     uint   `json:"admin_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if h.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection missing"})
		return
	}

	var stage models.PostStage
	commentableType := input.Source + "Post"

	// Fetch and update based on source
	if input.Source == string(models.SourceFaculty) {
		var post models.FacultyPost
		if err := h.DB.First(&post, input.PostID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		stage = post.Stage
		if stage != models.StageAE {
			c.JSON(http.StatusForbidden, gin.H{"error": "Post is not at AE stage"})
			return
		}
		if input.Action == "pass" && input.SelectJE_ID != nil {
			post.Status = models.StatusPendingJE
			post.Stage = models.StageJE
			post.AssignedJE_ID = input.SelectJE_ID
		} else if input.Action == "reject" {
			post.Status = models.StatusRejected
		}
		h.DB.Save(&post)

	} else if input.Source == string(models.SourceWarden) {
		var post models.WardenPost
		if err := h.DB.First(&post, input.PostID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		stage = post.Stage
		if stage != models.StageAE {
			c.JSON(http.StatusForbidden, gin.H{"error": "Post is not at AE stage"})
			return
		}
		if input.Action == "pass" && input.SelectJE_ID != nil {
			post.Status = models.StatusPendingJE
			post.Stage = models.StageJE
			post.AssignedJE_ID = input.SelectJE_ID
		} else if input.Action == "reject" {
			post.Status = models.StatusRejected
		}
		h.DB.Save(&post)

	} else if input.Source == string(models.SourceCentreHead) {
		var post models.CentreHeadPost
		if err := h.DB.First(&post, input.PostID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		stage = post.Stage
		if stage != models.StageAE {
			c.JSON(http.StatusForbidden, gin.H{"error": "Post is not at AE stage"})
			return
		}
		if input.Action == "pass" && input.SelectJE_ID != nil {
			post.Status = models.StatusPendingJE
			post.Stage = models.StageJE
			post.AssignedJE_ID = input.SelectJE_ID
		} else if input.Action == "reject" {
			post.Status = models.StatusRejected
		}
		h.DB.Save(&post)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid source"})
		return
	}

	// Create the comment
	comment := models.Comment{
		CommentableID:   input.PostID,
		CommentableType: commentableType,
		AdminID:         input.AdminID,
		CommentText:     input.CommentText,
	}
	h.DB.Create(&comment)

	if input.Action == "pass" && input.SelectJE_ID != nil {
		fmt.Println("Email to je@nit.edu: Post Assigned to JE - A new post has been assigned to you by AE.")
	} else if input.Action == "reject" {
		fmt.Println("Email to filer@nit.edu: Post Rejected - Your post has been rejected by AE.")
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated by AE"})
}

// Allow JE to mark the post as finally resolved or reject it
func (h *PostHandler) JEUpdateStatus(c *gin.Context) {
	var input struct {
		Source      string `json:"source" binding:"required"`
		PostID uint   `json:"post_id" binding:"required"`
		Action      string `json:"action" binding:"required"` // "resolve" or "reject"
		CommentText string `json:"comment" binding:"required"`
		AdminID     uint   `json:"admin_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if h.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection missing"})
		return
	}

	var stage models.PostStage
	commentableType := input.Source + "Post"

	// Fetch and update based on source
	if input.Source == string(models.SourceFaculty) {
		var post models.FacultyPost
		if err := h.DB.First(&post, input.PostID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		stage = post.Stage
		if stage != models.StageJE {
			c.JSON(http.StatusForbidden, gin.H{"error": "Post is not at JE stage"})
			return
		}
		if input.Action == "resolve" {
			post.Status = models.StatusResolved
		} else if input.Action == "reject" {
			post.Status = models.StatusRejected
		}
		h.DB.Save(&post)

	} else if input.Source == string(models.SourceWarden) {
		var post models.WardenPost
		if err := h.DB.First(&post, input.PostID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		stage = post.Stage
		if stage != models.StageJE {
			c.JSON(http.StatusForbidden, gin.H{"error": "Post is not at JE stage"})
			return
		}
		if input.Action == "resolve" {
			post.Status = models.StatusResolved
		} else if input.Action == "reject" {
			post.Status = models.StatusRejected
		}
		h.DB.Save(&post)

	} else if input.Source == string(models.SourceCentreHead) {
		var post models.CentreHeadPost
		if err := h.DB.First(&post, input.PostID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		stage = post.Stage
		if stage != models.StageJE {
			c.JSON(http.StatusForbidden, gin.H{"error": "Post is not at JE stage"})
			return
		}
		if input.Action == "resolve" {
			post.Status = models.StatusResolved
		} else if input.Action == "reject" {
			post.Status = models.StatusRejected
		}
		h.DB.Save(&post)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid source"})
		return
	}

	// Create the comment
	comment := models.Comment{
		CommentableID:   input.PostID,
		CommentableType: commentableType,
		AdminID:         input.AdminID,
		CommentText:     input.CommentText,
	}
	h.DB.Create(&comment)

	if input.Action == "resolve" {
		fmt.Println("Email to filer@nit.edu: Post Resolved - Your post has been successfully resolved.")
	} else if input.Action == "reject" {
		fmt.Println("Email to filer@nit.edu: Post Rejected - Your post has been rejected by JE.")
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated by JE"})
}

// Fetch all posts and their comments to show on the public dashboard
func (h *PostHandler) GetPublicDashboard(c *gin.Context) {
	var facultyPosts []models.FacultyPost
	var wardenPosts []models.WardenPost
	var centreHeadPosts []models.CentreHeadPost

	if h.DB != nil {
		h.DB.Preload("Comments").Find(&facultyPosts)
		h.DB.Preload("Comments").Find(&wardenPosts)
		h.DB.Preload("Comments").Find(&centreHeadPosts)
	}

	c.JSON(http.StatusOK, gin.H{
		"faculty_posts":     facultyPosts,
		"warden_posts":      wardenPosts,
		"centre_head_posts": centreHeadPosts,
	})
}
