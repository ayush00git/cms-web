package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/middleware"

	"github.com/gin-gonic/gin"
)

func PostRoute(e *gin.Engine, h *handlers.PostHandler) {
	// APIs for new post
	e.POST("/api/posts/faculty", middleware.IsAuthenticated(), h.FacultyPost)
	e.POST("/api/posts/warden", middleware.IsAuthenticated(), h.WardenPost)
	e.POST("/api/posts/centrehead", middleware.IsAuthenticated(), h.CentreheadPost)

	// APIs for updating the post
	e.PATCH("/api/posts/faculty/edit/:post_id", middleware.IsAuthenticated(), h.FacultyPostEdit)
	e.PATCH("/api/posts/warden/edit/:post_id", middleware.IsAuthenticated(), h.WardenPostEdit)
	e.PATCH("/api/posts/centrehead/edit/:post_id", middleware.IsAuthenticated(), h.CentreheadPostEdit)

	// APIs for deleting the post
	e.DELETE("/api/posts/faculty/delete/:post_id", middleware.IsAuthenticated(), h.FacultyPostDelete)
	e.DELETE("/api/posts/warden/delete/:post_id", middleware.IsAuthenticated(), h.WardenPostDelete)
	e.DELETE("/api/posts/centrehead/delete/:post_id", middleware.IsAuthenticated(), h.CentreheadPostDelete)

	// APIs for getting the posts
	e.GET("/api/posts/faculty", middleware.IsAuthenticated(), h.GetFacultyPosts)
	e.GET("/api/posts/warden", middleware.IsAuthenticated(), h.GetWardenPosts)
	e.GET("/api/posts/centrehead", middleware.IsAuthenticated(), h.GetCentreheadPosts)
	e.GET("/api/posts/:role/:post_id", middleware.IsAuthenticated(), h.GetPostByID)

	// APIs for comments on the posts
	e.POST("/api/posts/faculty/comment/:post_id", middleware.IsAuthenticated() ,h.FacultyPostComment)
	e.POST("/api/posts/warden/comment/:post_id", middleware.IsAuthenticated(), h.WardenPostComment)
	e.POST("/api/posts/centrehead/comment/:post_id", middleware.IsAuthenticated(), h.CentreheadPostComment)
}
