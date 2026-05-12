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
}
