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

	// keep separate apis for updating status
	stage := e.Group("/api/admin")
	{
		stage.PATCH("/faculty_posts/status/:post_id", middleware.IsAuthenticated(), h.AdminFacultyPostStatus)
		stage.PATCH("/warden_posts/status/:post_id", middleware.IsAuthenticated(), h.AdminWardenPostStatus)
		stage.PATCH("/centre_head_posts/status/:post_id", middleware.IsAuthenticated(), h.AdminCentreHeadPostStatus)
	}

}
