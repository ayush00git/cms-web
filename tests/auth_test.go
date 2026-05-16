package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/ayush00git/cms-web/models"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

func TestAuthFlows(t *testing.T) {
	db := SetupTestDB()
	router := SetupTestRouter(db)

	t.Run("Faculty Signup and Login", func(t *testing.T) {
		// Signup
		signupData := map[string]string{
			"name":         "Dr. Smith",
			"email":        "smith@nit.edu",
			"password":     "password123",
			"department":   "CSE",
			"house_number": "101",
			"block":        "A",
			"type":         "Type-1",
			"phone_number": "1234567890",
		}
		body, _ := json.Marshal(signupData)
		req, _ := http.NewRequest("POST", "/api/auth/faculty/signup", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusCreated, w.Code)

		// Login
		loginData := map[string]string{
			"email":    "smith@nit.edu",
			"password": "password123",
		}
		body, _ = json.Marshal(loginData)
		req, _ = http.NewRequest("POST", "/api/auth/faculty/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w = httptest.NewRecorder()
		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Header().Get("Set-Cookie"), "token=")
	})

	t.Run("Warden Signup and Login", func(t *testing.T) {
		signupData := map[string]string{
			"email":        "warden@nit.edu",
			"password":     "warden123",
			"hostel":       "Kailash",
			"phone_number": "0987654321",
		}
		body, _ := json.Marshal(signupData)
		req, _ := http.NewRequest("POST", "/api/auth/warden/signup", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusCreated, w.Code)

		loginData := map[string]string{
			"email":    "warden@nit.edu",
			"password": "warden123",
		}
		body, _ = json.Marshal(loginData)
		req, _ = http.NewRequest("POST", "/api/auth/warden/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w = httptest.NewRecorder()
		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Admin Login", func(t *testing.T) {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password"), 10)
		admin := models.Admin{
			Email:      "admin@nit.edu",
			Password:   string(hashedPassword),
			Post:       "XEN_Civil",
			IsVerified: true,
		}
		db.Create(&admin)

		loginData := map[string]string{
			"email":    "admin@nit.edu",
			"password": "password",
		}
		body, _ := json.Marshal(loginData)
		req, _ := http.NewRequest("POST", "/api/auth/admin/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Header().Get("Set-Cookie"), "token=")
	})
}
