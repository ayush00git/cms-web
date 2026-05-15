package helpers

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(id uint, email string) (string, error) {
	secretKey := []byte(GetEnv("JWT_SECRET"))

	// define the algorithm to sign the header and payload with
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"email": email,
			"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
		})
	
	// signing the header and payload to get token
	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return "", err
	}
	
	return tokenString, nil
}

func VerifyToken(tokenString string) (error) {
	secretKey := []byte(GetEnv("JWT_SECRET"))

	// parsing the jwt string
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error){
		return secretKey, nil
	})

	if err != nil {
		return err
	}

	// Valid method is populated while we parse a type *jwt.Token
	if !token.Valid {
		return fmt.Errorf("Invalid token")
	}
	return nil
}
