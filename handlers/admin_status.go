// Architecture
//
// The status of post should be allowed to edit such that admin positions
// JE can only report to AE and AE can only report to XEN
// Only one Primary handler (AdminFacultyPostStatus) is maintained in this file
// rest of the two handles just mirrors it.

package handlers

import (
	"fmt"
	"errors"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"
	"github.com/ayush00git/cms-web/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminReview struct {
	Review     string `json:"Review"`
	JeToAssign string `json:"JeToAssign"`
}

// PostStatus
type PostStatus string
const (
	PendingXEN 		PostStatus = "pending_xen" 	// default to open post
	PendingAE  		PostStatus = "pending_ae"
	ResolvedAE  	PostStatus = "resolved_ae"
	PendingJE  		PostStatus = "pending_je"
	ResolvedJE  	PostStatus = "resolved_je"
	ResolvedAll 	PostStatus = "resolved_all"	// defaults to closed post
)

// AdminFacultyPostStatus sets the status of the faculty posts
// Sends email to the corresponding post using goroutines
func (h *AdminHandler) AdminFacultyPostStatus(c *gin.Context) {
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

	// create the postURL
	frontendURL := helpers.GetEnvWithDefault("FRONTEND_URL", "http://localhost:5173")
	postURL := fmt.Sprintf(`%s/admin/posts/%s/%d`, frontendURL, "faculty", post.ID)

	switch post.Status {
	// ** Posts with status type mentioned PendingXEN **
	case string(PendingXEN):
		// only allow if user is of position XEN
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		// forward the post to AE
		if review.Review == string(PendingAE) {
			post.Status = string(PendingAE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingAE), TimeStamp: time.Now()})

			// send mail to ae
			go func() {
				// search for email of ae
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeAECivil
				} else {
					position = models.TypeAEElectrical
				}
				var ae models.Admin
				result := h.DB.Where("position = ?", position).Take(&ae)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(ae.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(ResolvedAll) {	// post can be set to close
			post.Status = string(ResolvedAll)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(ResolvedAll), TimeStamp: time.Now()})
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	// ** Posts with status type mentioned PendingAE **	
	case string(PendingAE):
		// only allow if user is of position AE
		if !strings.Contains(string(admin.Position), "AE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		// forward the post to JE
		if review.Review == string(PendingJE) {
			post.Status = string(PendingJE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingJE), TimeStamp: time.Now()})
			// Assign the JE's user id to the post
			var je models.Admin
			if review.JeToAssign != "" {
				if err := h.DB.Where("email = ?", review.JeToAssign).Take(&je).Error; err == nil {
					jeID := je.ID
					post.AssignedJE_ID = &jeID
					h.DB.Model(&post).Update("assigned_je_id", &jeID)
				}
			}
			// send mail to je
			go func() {
				JeToAssign := review.JeToAssign
				if err := services.SendPostMailToAdmins(JeToAssign, postURL); err != nil {
		       	 	log.Printf("failed to send JE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(PendingXEN) {		// forward the mail back to XEN if reviews were required
			post.Status = string(PendingXEN)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingXEN), TimeStamp: time.Now()})
			// send mail to xen
			go func() {
				// search for email of xen
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeXENCivil
				} else {
					position = models.TypeXENElectrical
				}
				var xen models.Admin
				result := h.DB.Where("position = ?", position).Take(&xen)
				if result.Error != nil {
		       	 	log.Printf("failed to send XEN mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(xen.Email, postURL); err != nil {
		       	 	log.Printf("failed to send XEN mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	
	// ** Posts with status type mentioned PendingJE **
	case string(ResolvedAE):
		// only XEN can edit the status of ResolvedAE
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == string(ResolvedAll) {
			post.Status = string(ResolvedAll)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(ResolvedAll), TimeStamp: time.Now()})
			// send mail to the post's author (to be implemented)
		} else if review.Review == string(PendingAE) {  	// if the xen wants the ae to re-review the post
			post.Status = string(PendingAE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingAE), TimeStamp: time.Now()})
			// send mail to ae
			go func() {
				// search for email of AE
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeAECivil
				} else {
					position = models.TypeAEElectrical
				}
				var ae models.Admin
				result := h.DB.Where("position = ?", position).Take(&ae)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(ae.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	// ** Posts with status type mentioned PendingJE **
	case string(PendingJE):
		// only allow if user is of position JE
		if !strings.Contains(string(admin.Position), "JE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		// if JE approves the post as resolved forward it to AE
		if review.Review == string(ResolvedJE) {
			post.Status = string(ResolvedJE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(ResolvedJE), TimeStamp: time.Now()})
			// send mail to AE
			go func() {
				// search for email of AE
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeAECivil
				} else {
					position = models.TypeAEElectrical
				}
				var ae models.Admin
				result := h.DB.Where("position = ?", position).Take(&ae)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(ae.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(PendingAE) {		// forward the mail back to JE if require reviews
			post.Status = string(PendingAE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingAE), TimeStamp: time.Now()})
			// send mail to AE
			go func() {
				// search for email of ae
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeAECivil
				} else {
					position = models.TypeAEElectrical
				}
				var ae models.Admin
				result := h.DB.Where("position = ?", position).Take(&ae)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(ae.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	
	// ** Posts with status type mentioned ResolvedJE **
	case string(ResolvedJE):
		// allow only if user is of position AE
		if !strings.Contains(string(admin.Position), "AE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		// if ae approves the work of je
		if review.Review == string(PendingJE) {
			post.Status = string(PendingJE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingJE), TimeStamp: time.Now()})
			// send mail to je (assigned JE can be changed atp)
			var je models.Admin
			if review.JeToAssign != "" {
				if err := h.DB.Where("email = ?", review.JeToAssign).Take(&je).Error; err == nil {
					jeID := je.ID
					post.AssignedJE_ID = &jeID
					h.DB.Model(&post).Update("assigned_je_id", &jeID)
				}
			}
			// send mail to je
			go func() {
				JeToAssign := review.JeToAssign
				if err := services.SendPostMailToAdmins(JeToAssign, postURL); err != nil {
		       	 	log.Printf("failed to send JE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(ResolvedAE) {
			post.Status = string(ResolvedAE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(ResolvedAE), TimeStamp: time.Now()})
			// send mail to xen
			go func() {
				// search for email of xen
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeXENCivil
				} else {
					position = models.TypeXENElectrical
				}
				var xen models.Admin
				result := h.DB.Where("position = ?", position).Take(&xen)
				if result.Error != nil {
		       	 	log.Printf("failed to send XEN mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(xen.Email, postURL); err != nil {
		       	 	log.Printf("failed to send XEN mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
		
	// ** Posts with status type mentioned ResolvedAll **
	case string(ResolvedAll):
		// allow only if user is of position XEN
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == string(PendingXEN) {		// to re-open an post
			post.Status = string(PendingXEN)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingXEN), TimeStamp: time.Now()})
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	// ** For any invalid review type **
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


// AdminWardenPostStatus sets the status of the warden posts
// Sends email to the corresponding post using goroutines
func (h *AdminHandler) AdminWardenPostStatus(c *gin.Context) {
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
	// only a XEN is allowed to open/close the post
	// je can't close the post as the post query is resolved by him, he just sends a signal "Resolved_JE"
	
	var review AdminReview
	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	// create the postURL
	frontendURL := helpers.GetEnvWithDefault("FRONTEND_URL", "http://localhost:5173")
	postURL := fmt.Sprintf(`%s/admin/posts/%s/%d`, frontendURL, "warden", post.ID)

	switch post.Status {
	// ** Posts with status type mentioned PendingXEN **
	case string(PendingXEN):
		// only allow if user is of position XEN
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		// forward the post to AE
		if review.Review == string(PendingAE) {
			post.Status = string(PendingAE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingAE), TimeStamp: time.Now()})

			// send mail to ae
			go func() {
				// search for email of ae
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeAECivil
				} else {
					position = models.TypeAEElectrical
				}
				var ae models.Admin
				result := h.DB.Where("position = ?", position).Take(&ae)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(ae.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(ResolvedAll) {	// post can be set to close
			post.Status = string(ResolvedAll)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(ResolvedAll), TimeStamp: time.Now()})
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	// ** Posts with status type mentioned PendingAE **	
	case string(PendingAE):
		// only allow if user is of position AE
		if !strings.Contains(string(admin.Position), "AE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		// forward the post to JE
		if review.Review == string(PendingJE) {
			post.Status = string(PendingJE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingJE), TimeStamp: time.Now()})
			// Assign the JE's user id to the post
			var je models.Admin
			if review.JeToAssign != "" {
				if err := h.DB.Where("email = ?", review.JeToAssign).Take(&je).Error; err == nil {
					jeID := je.ID
					post.AssignedJE_ID = &jeID
					h.DB.Model(&post).Update("assigned_je_id", &jeID)
				}
			}
			// send mail to je
			go func() {
				JeToAssign := review.JeToAssign
				if err := services.SendPostMailToAdmins(JeToAssign, postURL); err != nil {
		       	 	log.Printf("failed to send JE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(PendingXEN) {		// forward the mail back to XEN if reviews were required
			post.Status = string(PendingXEN)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingXEN), TimeStamp: time.Now()})
			// send mail to xen
			go func() {
				// search for email of xen
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeXENCivil
				} else {
					position = models.TypeXENElectrical
				}
				var xen models.Admin
				result := h.DB.Where("position = ?", position).Take(&xen)
				if result.Error != nil {
		       	 	log.Printf("failed to send XEN mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(xen.Email, postURL); err != nil {
		       	 	log.Printf("failed to send XEN mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	
	// ** Posts with status type mentioned PendingJE **
	case string(ResolvedAE):
		// only XEN can edit the status of ResolvedAE
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == string(ResolvedAll) {
			post.Status = string(ResolvedAll)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(ResolvedAll), TimeStamp: time.Now()})
			// send mail to the post's author (to be implemented)
		} else if review.Review == string(PendingAE) {  	// if the xen wants the ae to re-review the post
			post.Status = string(PendingAE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingAE), TimeStamp: time.Now()})
			// send mail to ae
			go func() {
				// search for email of AE
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeAECivil
				} else {
					position = models.TypeAEElectrical
				}
				var ae models.Admin
				result := h.DB.Where("position = ?", position).Take(&ae)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(ae.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	// ** Posts with status type mentioned PendingJE **
	case string(PendingJE):
		// only allow if user is of position JE
		if !strings.Contains(string(admin.Position), "JE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		// if JE approves the post as resolved forward it to AE
		if review.Review == string(ResolvedJE) {
			post.Status = string(ResolvedJE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(ResolvedJE), TimeStamp: time.Now()})
			// send mail to AE
			go func() {
				// search for email of AE
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeAECivil
				} else {
					position = models.TypeAEElectrical
				}
				var ae models.Admin
				result := h.DB.Where("position = ?", position).Take(&ae)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(ae.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(PendingAE) {		// forward the mail back to JE if require reviews
			post.Status = string(PendingAE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingAE), TimeStamp: time.Now()})
			// send mail to AE
			go func() {
				// search for email of ae
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeAECivil
				} else {
					position = models.TypeAEElectrical
				}
				var ae models.Admin
				result := h.DB.Where("position = ?", position).Take(&ae)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(ae.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	
	// ** Posts with status type mentioned ResolvedJE **
	case string(ResolvedJE):
		// allow only if user is of position AE
		if !strings.Contains(string(admin.Position), "AE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		// if ae approves the work of je
		if review.Review == string(PendingJE) {
			post.Status = string(PendingJE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingJE), TimeStamp: time.Now()})
			// send mail to je (assigned JE can be changed atp)
			var je models.Admin
			if review.JeToAssign != "" {
				if err := h.DB.Where("email = ?", review.JeToAssign).Take(&je).Error; err == nil {
					jeID := je.ID
					post.AssignedJE_ID = &jeID
					h.DB.Model(&post).Update("assigned_je_id", &jeID)
				}
			}
			// send mail to je
			go func() {
				JeToAssign := review.JeToAssign
				if err := services.SendPostMailToAdmins(JeToAssign, postURL); err != nil {
		       	 	log.Printf("failed to send JE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(ResolvedAE) {
			post.Status = string(ResolvedAE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(ResolvedAE), TimeStamp: time.Now()})
			// send mail to xen
			go func() {
				// search for email of xen
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeXENCivil
				} else {
					position = models.TypeXENElectrical
				}
				var xen models.Admin
				result := h.DB.Where("position = ?", position).Take(&xen)
				if result.Error != nil {
		       	 	log.Printf("failed to send XEN mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(xen.Email, postURL); err != nil {
		       	 	log.Printf("failed to send XEN mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
		
	// ** Posts with status type mentioned ResolvedAll **
	case string(ResolvedAll):
		// allow only if user is of position XEN
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == string(PendingXEN) {		// to re-open an post
			post.Status = string(PendingXEN)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingXEN), TimeStamp: time.Now()})
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	// ** For any invalid review type **
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


// AdminCentreheadPostStatus sets the status of the centrehead posts
// Sends email to the corresponding post using goroutines
func (h *AdminHandler) AdminCentreheadPostStatus(c *gin.Context) {
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
	var post models.CentreheadPost
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

	// create the postURL
	frontendURL := helpers.GetEnvWithDefault("FRONTEND_URL", "http://localhost:5173")
	postURL := fmt.Sprintf(`%s/admin/posts/%s/%d`, frontendURL, "centrehead", post.ID)

	switch post.Status {
	// ** Posts with status type mentioned PendingXEN **
	case string(PendingXEN):
		// only allow if user is of position XEN
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		// forward the post to AE
		if review.Review == string(PendingAE) {
			post.Status = string(PendingAE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingAE), TimeStamp: time.Now()})

			// send mail to ae
			go func() {
				// search for email of ae
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeAECivil
				} else {
					position = models.TypeAEElectrical
				}
				var ae models.Admin
				result := h.DB.Where("position = ?", position).Take(&ae)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(ae.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(ResolvedAll) {	// post can be set to close
			post.Status = string(ResolvedAll)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(ResolvedAll), TimeStamp: time.Now()})
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	// ** Posts with status type mentioned PendingAE **	
	case string(PendingAE):
		// only allow if user is of position AE
		if !strings.Contains(string(admin.Position), "AE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		// forward the post to JE
		if review.Review == string(PendingJE) {
			post.Status = string(PendingJE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingJE), TimeStamp: time.Now()})
			// Assign the JE's user id to the post
			var je models.Admin
			if review.JeToAssign != "" {
				if err := h.DB.Where("email = ?", review.JeToAssign).Take(&je).Error; err == nil {
					jeID := je.ID
					post.AssignedJE_ID = &jeID
					h.DB.Model(&post).Update("assigned_je_id", &jeID)
				}
			}
			// send mail to je
			go func() {
				JeToAssign := review.JeToAssign
				if err := services.SendPostMailToAdmins(JeToAssign, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(PendingXEN) {		// forward the mail back to XEN if reviews were required
			post.Status = string(PendingXEN)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingXEN), TimeStamp: time.Now()})
			// send mail to xen
			go func() {
				// search for email of xen
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeXENCivil
				} else {
					position = models.TypeXENElectrical
				}
				var xen models.Admin
				result := h.DB.Where("position = ?", position).Take(&xen)
				if result.Error != nil {
		       	 	log.Printf("failed to send XEN mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(xen.Email, postURL); err != nil {
		       	 	log.Printf("failed to send XEN mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	
	// ** Posts with status type mentioned PendingJE **
	case string(ResolvedAE):
		// only XEN can edit the status of ResolvedAE
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == string(ResolvedAll) {
			post.Status = string(ResolvedAll)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(ResolvedAll), TimeStamp: time.Now()})
			// send mail to the post's author (to be implemented)
		} else if review.Review == string(PendingAE) {  	// if the xen wants the ae to re-review the post
			post.Status = string(PendingAE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingAE), TimeStamp: time.Now()})
			// send mail to ae
			go func() {
				// search for email of AE
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeAECivil
				} else {
					position = models.TypeAEElectrical
				}
				var ae models.Admin
				result := h.DB.Where("position = ?", position).Take(&ae)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(ae.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	// ** Posts with status type mentioned PendingJE **
	case string(PendingJE):
		// only allow if user is of position JE
		if !strings.Contains(string(admin.Position), "JE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		// if JE approves the post as resolved forward it to AE
		if review.Review == string(ResolvedJE) {
			post.Status = string(ResolvedJE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(ResolvedJE), TimeStamp: time.Now()})
			// send mail to AE
			go func() {
				// search for email of AE
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeAECivil
				} else {
					position = models.TypeAEElectrical
				}
				var ae models.Admin
				result := h.DB.Where("position = ?", position).Take(&ae)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(ae.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(PendingAE) {		// forward the mail back to JE if require reviews
			post.Status = string(PendingAE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingAE), TimeStamp: time.Now()})
			// send mail to AE
			go func() {
				// search for email of ae
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeAECivil
				} else {
					position = models.TypeAEElectrical
				}
				var ae models.Admin
				result := h.DB.Where("position = ?", position).Take(&ae)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(ae.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	
	// ** Posts with status type mentioned ResolvedJE **
	case string(ResolvedJE):
		// allow only if user is of position AE
		if !strings.Contains(string(admin.Position), "AE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		// if ae approves the work of je
		if review.Review == string(PendingJE) {
			post.Status = string(PendingJE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingJE), TimeStamp: time.Now()})
			// send mail to je (assigned JE can be changed atp)
			var je models.Admin
			if review.JeToAssign != "" {
				if err := h.DB.Where("email = ?", review.JeToAssign).Take(&je).Error; err == nil {
					jeID := je.ID
					post.AssignedJE_ID = &jeID
					h.DB.Model(&post).Update("assigned_je_id", &jeID)
				}
			}
			// send mail to je
			go func() {
				JeToAssign := review.JeToAssign
				if err := services.SendPostMailToAdmins(JeToAssign, postURL); err != nil {
		       	 	log.Printf("failed to send JE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(ResolvedAE) {
			post.Status = string(ResolvedAE)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(ResolvedAE), TimeStamp: time.Now()})
			// send mail to xen
			go func() {
				// search for email of xen
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeXENCivil
				} else {
					position = models.TypeXENElectrical
				}
				var xen models.Admin
				result := h.DB.Where("position = ?", position).Take(&xen)
				if result.Error != nil {
		       	 	log.Printf("failed to send XEN mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(xen.Email, postURL); err != nil {
		       	 	log.Printf("failed to send XEN mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
		
	// ** Posts with status type mentioned ResolvedAll **
	case string(ResolvedAll):
		// allow only if user is of position XEN
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == string(PendingXEN) {		// to re-open an post
			post.Status = string(PendingXEN)
			// keep a audit
			post.StatusAuditLogs = append(post.StatusAuditLogs, models.StatusAudit{Event: string(PendingXEN), TimeStamp: time.Now()})
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	// ** For any invalid review type **
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
