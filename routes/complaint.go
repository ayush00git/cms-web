package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/middleware"

	"github.com/gin-gonic/gin"
)

func ComplaintRoute(e *gin.Engine, h *handlers.ComplaintHandler) {
	e.POST("/api/complaint/faculty", middleware.IsAuthenticated(), h.FacultyComplaint)
	e.POST("/api/complaint/warden", middleware.IsAuthenticated(), h.WardenComplaint)
	e.POST("/api/complaint/centre_head", middleware.IsAuthenticated(), h.CentreHeadComplaint)

	e.PUT("/api/post/faculty/edit/:post_id", middleware.IsAuthenticated(), h.FacultyPostEdit)
	e.PUT("/api/post/warden/edit/:post_id", middleware.IsAuthenticated(), h.WardenPostEdit)
	e.PUT("/api/post/centre_head/edit/:post_id", middleware.IsAuthenticated(), h.CentreHeadPostEdit)

	e.DELETE("/api/post/faculty/delete/:post_id", middleware.IsAuthenticated(), h.FacultyPostDelete)
	e.DELETE("/api/post/warden/delete/:post_id", middleware.IsAuthenticated(), h.WardenPostDelete)
	e.DELETE("/api/post/centre_head/delete/:post_id", middleware.IsAuthenticated(), h.CentreHeadPostDelete)
}
