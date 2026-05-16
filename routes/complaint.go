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

	e.POST("/api/post/faculty/edit/:post_id", middleware.IsAuthenticated(), h.FacultyPostEdit)
	e.POST("/api/post/warden/edit/:post_id", middleware.IsAuthenticated(), h.WardenPostEdit)
	e.POST("/api/post/centre_head/edit/:post_id", middleware.IsAuthenticated(), h.CentreHeadPostEdit)
}
