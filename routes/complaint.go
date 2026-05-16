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
}
