package helpers

import (
	"log"
	"os"
	"github.com/joho/godotenv"
)

func GetEnv(target string) (string) {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error while loading the environment variables")
	}

	value := os.Getenv(target)
	if value == "" {
		log.Fatal("No value for %s exists in environment variables", value)
	}
	return value
}
