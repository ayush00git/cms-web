package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/gin-gonic/gin"
)

// PostRoute initializes all post-related endpoints
func PostRoute(router *gin.Engine, h *handlers.PostHandler) {
	
	// Faculty, Warden & Centre Head reporting routes
	router.POST("/faculty/post/report", h.FacultyReportPost)
	router.POST("/warden/post/report", h.WardenReportPost)
	router.POST("/centrehead/post/report", h.CentreHeadReportPost)

	// Admin update routes
	admin := router.Group("/admin")
	{
		admin.POST("/xen/post/status", h.XENUpdateStatus)
		admin.POST("/ae/post/status", h.AEUpdateStatus)
		admin.POST("/je/post/status", h.JEUpdateStatus)
	}

	// Public dashboard
	router.GET("/posts/public", h.GetPublicDashboard)
}
