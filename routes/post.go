package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/middleware"

	"github.com/gin-gonic/gin"
)

func PostRoute(e *gin.Engine, h *handlers.PostHandler) {
	e.POST("/api/post/faculty", middleware.IsAuthenticated(), h.FacultyPost)
	e.POST("/api/post/warden", middleware.IsAuthenticated(), h.WardenPost)
	e.POST("/api/post/centre_head", middleware.IsAuthenticated(), h.CentreHeadPost)

	e.PATCH("/api/post/faculty/edit/:post_id", middleware.IsAuthenticated(), h.FacultyPostEdit)
	e.PATCH("/api/post/warden/edit/:post_id", middleware.IsAuthenticated(), h.WardenPostEdit)
	e.PATCH("/api/post/centre_head/edit/:post_id", middleware.IsAuthenticated(), h.CentreHeadPostEdit)

	e.DELETE("/api/post/faculty/delete/:post_id", middleware.IsAuthenticated(), h.FacultyPostDelete)
	e.DELETE("/api/post/warden/delete/:post_id", middleware.IsAuthenticated(), h.WardenPostDelete)
	e.DELETE("/api/post/centre_head/delete/:post_id", middleware.IsAuthenticated(), h.CentreHeadPostDelete)
}
