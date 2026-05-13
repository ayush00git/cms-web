package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/gin-gonic/gin"
)

func AuthRoute (e *gin.Engine, h *handlers.AuthHandler) {
	faculty := e.Group("/api/auth/faculty")
	{
		faculty.POST("/signup", h.FacultySignup)
		faculty.POST("/login", h.FacultyLogin)
	}
	warden := e.Group("/api/auth/warden")
	{
		warden.POST("/signup", h.WardenSignup)
		warden.POST("/login", h.WardenLogin)
	}
	centrehead := e.Group("/api/auth/centre_head")
	{
		centrehead.POST("/signup", h.CentreHeadSignup)
		centrehead.POST("/login", h.CentreHeadLogin)
	}
}
