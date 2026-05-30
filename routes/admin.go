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
		stage.PATCH("/centrehead_posts/status/:post_id", middleware.IsAuthenticated(), h.AdminCentreheadPostStatus)
	}

	// get the posts according to the status
	posts := e.Group("/api/admin")
	{
		posts.GET("xen/posts", middleware.IsAuthenticated(), h.GetXENPosts)
		posts.GET("ae/posts", middleware.IsAuthenticated(), h.GetAEPosts)
		posts.GET("je/posts", middleware.IsAuthenticated(), h.GetJEPosts)
	}

	// for any post
	e.GET("/api/admin/posts/:role/:post_id", middleware.IsAuthenticated(), h.AdminGetPost)
}
