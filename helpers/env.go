package helpers

import (
	"log"
	"os"
)

func GetEnv(target string) string {
	value := os.Getenv(target)
	if value == "" {
		log.Fatalf("No value for %s exists in environment variables", target)
	}
	return value
}

func GetEnvWithDefault(target, defaultValue string) string {
	value := os.Getenv(target)
	if value == "" {
		return defaultValue
	}
	return value
}
