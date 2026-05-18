package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/middleware"
	"github.com/gin-gonic/gin"
)

func AdminRoutes (e *gin.Engine, h *handlers.AdminHandler) {
	// e.POST("/api/auth/admin/signup", h.AdminSignup)           // not to be used as an public API
	e.POST("/api/auth/admin/login", h.AdminLogin)

	e.POST("/api/admin/comment/:type/:id", middleware.IsAuthenticated(), h.AdminPostComment)
}
