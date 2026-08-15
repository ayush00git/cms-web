package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/middleware"
	"github.com/gin-gonic/gin"
)

func AdminRoutes (e *gin.Engine, h *handlers.AdminHandler) {
	// e.POST("/api/auth/admin/signup", h.AdminSignup)           // not to be used as an public API
	e.POST("/api/auth/admin/login", h.AdminLogin)

	e.GET("/api/admin/comments", middleware.IsAuthenticated(), h.AdminGetComments)
	e.POST("/api/admin/comment/:type/:id", middleware.IsAuthenticated(), h.AdminPostComment)
	e.PATCH("/api/admin/comment/:type/:id/:comment_id", middleware.IsAuthenticated(), h.AdminEditComment)
	e.DELETE("/api/admin/comment/:type/:id/:comment_id", middleware.IsAuthenticated(), h.AdminDeleteComment)

	// keep separate apis for updating status
	status := e.Group("/api/admin")
	{
		status.PATCH("/faculty_posts/status/:post_id", middleware.IsAuthenticated(), h.AdminFacultyPostStatus)
		status.PATCH("/warden_posts/status/:post_id", middleware.IsAuthenticated(), h.AdminWardenPostStatus)
		status.PATCH("/centrehead_posts/status/:post_id", middleware.IsAuthenticated(), h.AdminCentreheadPostStatus)
	}

	// get the posts according to the status
	posts := e.Group("/api/admin")
	{
		posts.GET("/xen/posts", middleware.IsAuthenticated(), h.GetXENPosts)
		posts.GET("/ae/posts", middleware.IsAuthenticated(), h.GetAEPosts)
		posts.GET("/je/posts", middleware.IsAuthenticated(), h.GetJEPosts)
	}

	// for getting info of JEs
	e.GET("/api/admin/return-je", middleware.IsAuthenticated(), h.AdminReturnJE);

	// for any post
	e.GET("/api/admin/posts/:role/:post_id", middleware.IsAuthenticated(), h.AdminGetPost)
}
