package routes

import (
	"github.com/ayush00git/cms-web/handlers"

	"github.com/gin-gonic/gin"
)

func ComplaintRoute(e *gin.Engine, h *handlers.ComplaintHandler) {
	
	e.POST("/api/complaint/faculty", h.FacultyReportComplaint)
	e.POST("/api/complaint/warden", h.WardenReportComplaint)
	e.POST("/api/complaint/centrehead", h.CentreHeadReportComplaint)

	admin := e.Group("/api/complaint/admin")
	{
		admin.POST("/xen/status", h.XENUpdateStatus)
		admin.POST("/ae/status", h.AEUpdateStatus)
		admin.POST("/je/status", h.JEUpdateStatus)
	}

	// Public dashboard
	e.GET("api/complaints/public", h.GetPublicDashboard)
}
