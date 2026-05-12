package routes

import (
	"github.com/ayush00git/cms-web/controllers"
	"github.com/gin-gonic/gin"
)

// SetupComplaintRoutes initializes all complaint-related endpoints
func SetupComplaintRoutes(router *gin.Engine) {
	
	// Faculty, Warden & Centre Head reporting routes
	router.POST("/faculty/complaint/report", controllers.FacultyReportComplaint)
	router.POST("/warden/complaint/report", controllers.WardenReportComplaint)
	router.POST("/centrehead/complaint/report", controllers.CentreHeadReportComplaint)

	// Admin update routes
	admin := router.Group("/admin")
	{
		admin.POST("/xen/complaint/status", controllers.XENUpdateStatus)
		admin.POST("/ae/complaint/status", controllers.AEUpdateStatus)
		admin.POST("/je/complaint/status", controllers.JEUpdateStatus)
	}

	// Public dashboard
	router.GET("/complaints/public", controllers.GetPublicDashboard)
}
