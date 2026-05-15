package helpers

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserId		uint		`json:"user_id"`
	Email		string		`json:"email"`
	jwt.RegisteredClaims
}

func GenerateToken(id uint, email string) (string, error) {
	secretKey := []byte(GetEnv("JWT_SECRET"))

	claims := Claims{
		UserId: id,
		Email: email,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * 24 * time.Hour)),
            IssuedAt: jwt.NewNumericDate(time.Now()), 
        },
	}

	// define the algorithm to sign the header and payload with
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	
	// signing the header and payload to get token
	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return "", err
	}
	
	return tokenString, nil
}

func VerifyToken(tokenString string) (*Claims, error) {
	secretKey := []byte(GetEnv("JWT_SECRET"))

	// parsing the jwt string
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, 
		func(token *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})

	if err != nil {
		return nil, err
	}

	// Valid method is populated while we parse a type *jwt.Token
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("Invalid token")
}
