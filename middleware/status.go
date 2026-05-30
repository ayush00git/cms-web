package middleware

import (
	"github.com/gin-gonic/gin"
)

func PatchPostStatus() (gin.HandlerFunc) {
	return func(c *gin.Context) {
		// from authenticated middleware we can get ?
	}
}
