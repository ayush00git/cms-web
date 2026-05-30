package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/middleware"
	"github.com/gin-gonic/gin"
)

func AuthRoute (e *gin.Engine, h *handlers.AuthHandler) {
	faculty := e.Group("/api/auth/faculty")
	{
		faculty.POST("/signup", h.FacultySignup)
		faculty.POST("/login", h.FacultyLogin)
		faculty.POST("/forget-password", h.FacultyForgetPassword)
		faculty.PATCH("/reset-password", h.FacultyResetPassword)
	}
	warden := e.Group("/api/auth/warden")
	{
		warden.POST("/signup", h.WardenSignup)
		warden.POST("/login", h.WardenLogin)
		warden.POST("/forget-password", h.WardenForgetPassword)
		warden.PATCH("/reset-password", h.WardenResetPassword)
	}
	centrehead := e.Group("/api/auth/centrehead")
	{
		centrehead.POST("/signup", h.CentreheadSignup)
		centrehead.POST("/login", h.CentreheadLogin)
		centrehead.POST("/forget-password", h.CentreheadForgetPassword)
		centrehead.PATCH("/reset-password", h.CentreheadResetPassword)
	}
	e.POST("/api/auth/logout", h.Logout)

	// for account verifications
	e.GET("/api/auth/verify", h.VerifyAccount)

	// for returning the user's profile
	e.GET("/api/profile", middleware.IsAuthenticated(), h.UserProfile)
}
