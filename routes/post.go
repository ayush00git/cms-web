package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/middleware"

	"github.com/gin-gonic/gin"
)

func PostRoute(e *gin.Engine, h *handlers.PostHandler) {
	// APIs for new post
	e.POST("/api/post/faculty", middleware.IsAuthenticated(), h.FacultyPost)
	e.POST("/api/post/warden", middleware.IsAuthenticated(), h.WardenPost)
	e.POST("/api/post/centrehead", middleware.IsAuthenticated(), h.CentreheadPost)

	// APIs for updating the post
	e.PATCH("/api/post/faculty/edit/:post_id", middleware.IsAuthenticated(), h.FacultyPostEdit)
	e.PATCH("/api/post/warden/edit/:post_id", middleware.IsAuthenticated(), h.WardenPostEdit)
	e.PATCH("/api/post/centrehead/edit/:post_id", middleware.IsAuthenticated(), h.CentreheadPostEdit)

	// APIs for deleting the post
	e.DELETE("/api/post/faculty/delete/:post_id", middleware.IsAuthenticated(), h.FacultyPostDelete)
	e.DELETE("/api/post/warden/delete/:post_id", middleware.IsAuthenticated(), h.WardenPostDelete)
	e.DELETE("/api/post/centrehead/delete/:post_id", middleware.IsAuthenticated(), h.CentreheadPostDelete)

	// APIs for getting the posts
	e.GET("/api/post/faculty", middleware.IsAuthenticated(), h.GetFacultyPosts)
	e.GET("/api/post/warden", middleware.IsAuthenticated(), h.GetWardenPosts)
	e.GET("/api/post/centrehead", middleware.IsAuthenticated(), h.GetCentreheadPosts)

	// APIs for comments on the posts
	e.POST("/api/post/faculty/comment/:post_id", h.FacultyPostComment)
}
