package middleware

import (
	"github.com/gin-gonic/gin"
)

// LimitByAuth is the rate limiter middleware for authenticated users.
func (rl *RateLimiter) LimitByAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		email, ok := c.Get(EmailKey)
		role, okk := c.Get(RoleKey)

		if !ok || !okk {
			c.JSON(401, gin.H{"error": "unauthorized access!"})
			return
		}
		
		key := email.(string) + ":" + role.(string)

		bucket := rl.GetBucket(key)

		rl.mu.Lock()
		allowed := bucket.Allow()
		rl.mu.Unlock()

		if !allowed {
			c.JSON(429, gin.H{"error": "you've hit it too many time! try again later"})
			c.Abort()
			return
		}
		c.Next()
	}
}
