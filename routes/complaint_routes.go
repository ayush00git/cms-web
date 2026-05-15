package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/gin-gonic/gin"
)

// ComplaintRoute initializes all complaint-related endpoints
func ComplaintRoute(router *gin.Engine, h *handlers.ComplaintHandler) {
	
	// Faculty, Warden & Centre Head reporting routes
	router.POST("/faculty/complaint/report", h.FacultyReportComplaint)
	router.POST("/warden/complaint/report", h.WardenReportComplaint)
	router.POST("/centrehead/complaint/report", h.CentreHeadReportComplaint)

	// Admin update routes
	admin := router.Group("/admin")
	{
		admin.POST("/xen/complaint/status", h.XENUpdateStatus)
		admin.POST("/ae/complaint/status", h.AEUpdateStatus)
		admin.POST("/je/complaint/status", h.JEUpdateStatus)
	}

	// Public dashboard
	router.GET("/complaints/public", h.GetPublicDashboard)
}
