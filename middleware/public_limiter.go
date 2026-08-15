package middleware

import (
	"github.com/gin-gonic/gin"
)

// Limit is the middleware which looks for bucket associated with the IP / assigns a new one.
// And returns 429 if rate limit exceeded.
func (rl *RateLimiter) Limit() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		bucket := rl.GetBucket(ip)

		rl.mu.Lock()
		allowed := bucket.Allow()
		rl.mu.Unlock()

		if !allowed {
			c.JSON(429, gin.H{"error": "you've hit it too many times! get back later"})
			c.Abort()
			return
		}
		c.Next()
	}
}
