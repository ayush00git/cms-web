package routes

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/middleware"
	"github.com/gin-gonic/gin"
)

func AuthRoute (e *gin.Engine, h *handlers.AuthHandler) {

	// maximum of 3 tokens and 1 refill per 15 seconds.
	mailRoutesRateLimiter := middleware.NewRateLimiter(3, 1.0/30.0)
	standardRateLimiter := middleware.NewRateLimiter(10, 1.0/6.0)

	faculty := e.Group("/api/auth/faculty")
	{
		faculty.POST("/signup", mailRoutesRateLimiter.Limit(), h.FacultySignup)
		faculty.POST("/login", standardRateLimiter.Limit(), h.FacultyLogin)
		faculty.POST("/forget-password", mailRoutesRateLimiter.Limit(), h.FacultyForgetPassword)
		faculty.PATCH("/reset-password", standardRateLimiter.Limit(), h.FacultyResetPassword)
	}
	warden := e.Group("/api/auth/warden")
	{
		warden.POST("/signup", mailRoutesRateLimiter.Limit(), h.WardenSignup)
		warden.POST("/login", standardRateLimiter.Limit(), h.WardenLogin)
		warden.POST("/forget-password", mailRoutesRateLimiter.Limit(), h.WardenForgetPassword)
		warden.PATCH("/reset-password", standardRateLimiter.Limit(), h.WardenResetPassword)
	}
	centrehead := e.Group("/api/auth/centrehead")
	{
		centrehead.POST("/signup", mailRoutesRateLimiter.Limit(), h.CentreheadSignup)
		centrehead.POST("/login", standardRateLimiter.Limit(), h.CentreheadLogin)
		centrehead.POST("/forget-password", mailRoutesRateLimiter.Limit(), h.CentreheadForgetPassword)
		centrehead.PATCH("/reset-password", standardRateLimiter.Limit(), h.CentreheadResetPassword)
	}
	e.POST("/api/auth/logout", h.Logout)

	// for account verifications.
	e.GET("/api/auth/verify", h.VerifyAccount)

	// for returning the user's profile.
	e.GET("/api/profile", middleware.IsAuthenticated(), h.UserProfile)

	// for editing user's profile.
	e.PATCH("/api/faculty/profile/edit", middleware.IsAuthenticated(), h.FacultyProfileEdit)
	e.PATCH("/api/warden/profile/edit", middleware.IsAuthenticated(), h.WardenProfileEdit)
	e.PATCH("/api/centrehead/profile/edit", middleware.IsAuthenticated(), h.CentreheadProfileEdit)
}
