package middleware

import (
	"sync"
	"time"
)

type TokenBucket struct {
	tokens			float64
	maxTokens		float64
	refillRate		float64
	lastRefill		time.Time
}

type RateLimiter struct {
	buckets			map[string]*TokenBucket
	mu				sync.Mutex
	max				float64
	refill			float64
}

// NewRateLimiter instantiates a new RateLimiter object and start
// a cleanup goroutine which deletes the stale buckets.
func NewRateLimiter(maxTokens, refillRate float64) *RateLimiter {
	rl := &RateLimiter{
		buckets: make(map[string]*TokenBucket),
		max: maxTokens,
		refill: refillRate,
	}

	// this goroutine runs every 10 minutes and clean stale
	// buckets with inactivity of 30 minutes.
	go func() {
		for {
			time.Sleep(10*time.Minute)
			rl.mu.Lock()
			for ip, bucket := range rl.buckets {
				if time.Since(bucket.lastRefill) > 30*time.Minute {
					delete(rl.buckets, ip)
				}
			}
			rl.mu.Unlock()
		}
	}()
	
	return rl
}

// GetBucket initiates a new/existing bucket inside the memory map with key = ip.
// And assigns a new bucket to a newly seen ip.
func (rl *RateLimiter) GetBucket(ip string) *TokenBucket {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	bucket, exists := rl.buckets[ip]
	if !exists {
		bucket = &TokenBucket{
			tokens: rl.max,
			maxTokens: rl.max,
			refillRate: rl.refill,
			lastRefill: time.Now(),
		}
		rl.buckets[ip] = bucket
	}
	return bucket
}

// Allow is the main rate limiting logic, it allows/disallows a request
// based on number of tokens left and caps a bucket at maxTokens. 
func (b *TokenBucket) Allow() bool {
	now := time.Now()
	elapsed := now.Sub(b.lastRefill).Seconds()

	// bucket refill logic. 
	b.tokens += b.refillRate * elapsed

	// cap the bucket at its maximum allowed tokens capacity.
	if b.tokens > b.maxTokens {
		b.tokens = b.maxTokens
	}
	b.lastRefill = now

	// consume one token for one request and allow the request.
	if b.tokens >= 1 {
		b.tokens--
		return true
	}

	// otherwise block the request (if token < 1)
	return false
}
