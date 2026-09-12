package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/middleware"

	"github.com/gin-gonic/gin"
)

func PostRoute(e *gin.Engine, h *handlers.PostHandler) {

	postRoutesRateLimiter := middleware.NewRateLimiter(200, 1.0/10.0)

	posts := e.Group("/api/posts", middleware.IsAuthenticated(), postRoutesRateLimiter.LimitByAuth())
	{
		// APIs for new post
		posts.POST("/faculty", h.FacultyPost)
		posts.POST("/warden", h.WardenPost)
		posts.POST("/centrehead", h.CentreheadPost)

		// APIs for updating the post
		posts.PATCH("/faculty/edit/:post_id", h.FacultyPostEdit)
		posts.PATCH("/warden/edit/:post_id", h.WardenPostEdit)
		posts.PATCH("/centrehead/edit/:post_id", h.CentreheadPostEdit)

		// APIs for deleting the post
		posts.DELETE("/faculty/delete/:post_id", h.FacultyPostDelete)
		posts.DELETE("/warden/delete/:post_id", h.WardenPostDelete)
		posts.DELETE("/centrehead/delete/:post_id", h.CentreheadPostDelete)

		// APIs for getting the posts
		posts.GET("/faculty", h.GetFacultyPosts)
		posts.GET("/warden", h.GetWardenPosts)
		posts.GET("/centrehead", h.GetCentreheadPosts)

		// APIs for comments on the posts
		posts.POST("/faculty/comment/:post_id", h.FacultyPostComment)
		posts.POST("/warden/comment/:post_id", h.WardenPostComment)
		posts.POST("/centrehead/comment/:post_id", h.CentreheadPostComment)
	}

	// let this be public, anyone can read a single post, rate limited by IP.
	publicPostLimiter := middleware.NewRateLimiter(200, 1.0/10.0)
	e.GET("/api/posts/:role/:post_id", publicPostLimiter.Limit(), h.GetPostByID)
}
