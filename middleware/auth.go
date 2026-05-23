package middleware

import (
	"github.com/ayush00git/cms-web/helpers"

	"github.com/gin-gonic/gin"
)

// context keys
const (
	UserIDKey	= "userId"
	EmailKey	= "emailId"
	RoleKey		= "role"
)

func IsAuthenticated() (gin.HandlerFunc) {
	return func(c *gin.Context) {
		tokenString := ""

		// search for token in http-cookies
		cookie, err := c.Cookie("token")
		if err == nil {
			tokenString = cookie
		}

		// if not found means user is unauthenticated
		if tokenString == "" {
			c.JSON(401, gin.H{"error": "unauthentication user"})
			c.Abort()
			return
		}

		// checks if the token is correct or not
		claims, err := helpers.VerifyToken(tokenString)
		if err != nil {
			c.JSON(401, gin.H{"error": "unauthenticated access not granted"})
			c.Abort()
			return
		}

		// gin context injections
		c.Set(UserIDKey, claims.UserId)
		c.Set(EmailKey, claims.Email)
		c.Set(RoleKey, claims.Role)
		
		c.Next()
	}
}
