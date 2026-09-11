package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/gin-gonic/gin"
)

func SuperAdminRoute(e *gin.Engine, h *handlers.SuperAdminHandler) {
	sup := e.Group("/api/superadmin")
	{
		sup.POST("/login", h.SuperAdminLogin)
		sup.GET("/access", h.SuperAdminAccess)
	}
}
