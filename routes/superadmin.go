package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/middleware"
	"github.com/gin-gonic/gin"
)

func SuperAdminRoute(e *gin.Engine, h *handlers.SuperAdminHandler) {
	sup := e.Group("/api/superadmin")
	{
		sup.POST("/login", h.SuperAdminLogin)
		sup.GET("/access", h.SuperAdminAccess)
		sup.GET("/posts/faculty", middleware.IsAuthenticated(), h.SuperAdminGetFacultyPosts)
		sup.GET("/posts/warden", middleware.IsAuthenticated(), h.SuperAdminGetWardenPosts)
		sup.GET("/posts/centreheads", middleware.IsAuthenticated(), h.SuperAdminGetCentreheadPosts)
	}
}
