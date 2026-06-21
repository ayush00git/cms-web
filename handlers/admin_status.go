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

	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"
	"github.com/ayush00git/cms-web/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminReview struct {
	Review	string
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

// AdminFacultyPostStatus sets the stage of the faculty posts
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
	postURL := fmt.Sprintf(`http://localhost:5173/admin/posts/%s/%d`, "faculty", post.ID)

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
			// send mail to je
			go func() {
				// search for email of je
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeJECivil
				} else {
					position = models.TypeJEElectrical
				}
				var je models.Admin
				result := h.DB.Where("position = ?", position).Take(&je)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(je.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == string(PendingXEN) {		// forward the mail back to XEN if reviews were required
			post.Status = string(PendingXEN)
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
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(xen.Email, postURL); err != nil {
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
	case string(ResolvedAll):
		// allow only if user is of position XEN
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == string(PendingXEN) {		// to re-open an post
			post.Status = string(PendingXEN)
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
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


// AdminWardenPostStatus sets the stage of the warden posts
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
	var review AdminReview
	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	// create the postURL
	postURL := fmt.Sprintf(`http://localhost:5173/admin/posts/%s/%d`, "warden", post.ID)

	switch post.Status {
	case "Resolved_JE":
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "close" {
			post.Status = "Closed"
		}
	case "Pending_XEN" :
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "to_ae" {
			post.Status = "Pending_AE"
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
		} else if review.Review == "close" {
			post.Status = "Closed"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	
	case "Pending_AE":
		if !strings.Contains(string(admin.Position), "AE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "to_je" {
			post.Status = "Pending_JE"
			// send mail to je
			go func() {
				// search for email of je
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeJECivil
				} else {
					position = models.TypeJEElectrical
				}
				var je models.Admin
				result := h.DB.Where("position = ?", position).Take(&je)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(je.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == "require_review" {
			post.Status = "Pending_XEN"
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
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(xen.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	case "Pending_JE":
		if !strings.Contains(string(admin.Position), "JE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "resolved" {
			post.Status = "Resolved_JE"
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
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(xen.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == "require_review" {
			post.Status = "Pending_AE"
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
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	case "Closed":
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "open" {
			post.Status = "Pending_XEN"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
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


// AdminCentreheadPostStatus sets the stage of the centrehead posts
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
	var review AdminReview
	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}

	// create the postURL
	postURL := fmt.Sprintf(`http://localhost:5173/admin/posts/%s/%d`, "centrehead", post.ID)

	switch post.Status {
	case "Resolved_JE":
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "close" {
			post.Status = "Closed"
		}
	case "Pending_XEN" :
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "to_ae" {
			post.Status = "Pending_AE"
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
		} else if review.Review == "close" {
			post.Status = "Closed"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	
	case "Pending_AE":
		if !strings.Contains(string(admin.Position), "AE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "to_je" {
			post.Status = "Pending_JE"
			// send mail to je
			go func() {
				// search for email of je
				var position models.PositionType
				if post.TypeOfPost == "Civil" {
					position = models.TypeJECivil
				} else {
					position = models.TypeJEElectrical
				}
				var je models.Admin
				result := h.DB.Where("position = ?", position).Take(&je)
				if result.Error != nil {
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(je.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == "require_review" {
			post.Status = "Pending_XEN"
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
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(xen.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}

	case "Pending_JE":
		if !strings.Contains(string(admin.Position), "JE") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "resolved" {
			post.Status = "Resolved_JE"
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
		       	 	log.Printf("failed to send AE mail for post %d", post.ID)
					return
				}
				if err := services.SendPostMailToAdmins(xen.Email, postURL); err != nil {
		       	 	log.Printf("failed to send AE mail for post %d: %s", post.ID, err)
					return
				}
			} ()
		} else if review.Review == "require_review" {
			post.Status = "Pending_AE"
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
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
	case "Closed":
		if !strings.Contains(string(admin.Position), "XEN") {
			c.JSON(403, gin.H{"error": "permissions denied"})
			return
		}
		if review.Review == "open" {
			post.Status = "Pending_XEN"
		} else {
			c.JSON(400, gin.H{"error": "invalid review type"})
			return
		}
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
