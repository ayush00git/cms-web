package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"

	"golang.org/x/crypto/bcrypt"
)

// --- WardenSignup -----------------------------------------------------------

func TestWardenSignup_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/warden/signup", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestWardenSignup_AlreadyRegistered(t *testing.T) {
	db := newTestDB(t)
	seedWarden(t, db, "war.dup@iit.ac.in")

	e := newAuthRouter(db, noAuth())
	body := map[string]any{
		"name":         "Duplicate Warden",
		"email":        "war.dup@iit.ac.in",
		"password":     "whatever",
		"hostel":       string(models.KBH),
		"phone_number": "8888888888",
	}
	rec := doRequest(t, e, http.MethodPost, "/api/auth/warden/signup", body)
	assertStatus(t, rec, 409)
}

// --- WardenLogin ------------------------------------------------------------

func TestWardenLogin_Success(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.login@iit.ac.in")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/warden/login", map[string]any{
		"email":    w.Email,
		"password": testPassword,
	})

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if out["role"] != "warden" {
		t.Fatalf("expected role warden, got %v", out)
	}
}

func TestWardenLogin_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/warden/login", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestWardenLogin_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/warden/login", map[string]any{
		"email":    "ghost@iit.ac.in",
		"password": testPassword,
	})
	assertStatus(t, rec, 404)
}

func TestWardenLogin_Unverified(t *testing.T) {
	db := newTestDB(t)
	w := models.Warden{Email: "war.unv@iit.ac.in", Password: testPasswordHash, Hostel: models.KBH, PhoneNumber: "8888888888", IsVerified: false}
	db.Create(&w)

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/warden/login", map[string]any{
		"email":    w.Email,
		"password": testPassword,
	})
	assertStatus(t, rec, 403)
}

func TestWardenLogin_WrongPassword(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.wrongpw@iit.ac.in")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/warden/login", map[string]any{
		"email":    w.Email,
		"password": "nope",
	})
	assertStatus(t, rec, 401)
}

// --- WardenForgetPassword ---------------------------------------------------

func TestWardenForgetPassword_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/warden/forget-password", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestWardenForgetPassword_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/warden/forget-password", map[string]any{"email": "ghost@iit.ac.in"})
	assertStatus(t, rec, 404)
}

func TestWardenForgetPassword_Unverified(t *testing.T) {
	db := newTestDB(t)
	w := models.Warden{Email: "war.fpunv@iit.ac.in", Password: testPasswordHash, Hostel: models.KBH, PhoneNumber: "8888888888", IsVerified: false}
	db.Create(&w)

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/warden/forget-password", map[string]any{"email": w.Email})
	assertStatus(t, rec, 403)
}

// --- WardenResetPassword ----------------------------------------------------

func TestWardenResetPassword_Success(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.reset@iit.ac.in")
	token := genToken(t, w.ID, w.Email, "warden")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/warden/reset-password?user="+token, map[string]any{
		"password": "BrandNewPass1",
	})

	assertStatus(t, rec, 200)

	var updated models.Warden
	db.First(&updated, w.ID)
	if err := bcrypt.CompareHashAndPassword([]byte(updated.Password), []byte("BrandNewPass1")); err != nil {
		t.Fatalf("password was not updated: %v", err)
	}
}

func TestWardenResetPassword_InvalidToken(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/warden/reset-password?user=garbage", map[string]any{"password": "x"})
	assertStatus(t, rec, 500)
}

func TestWardenResetPassword_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	token := genToken(t, 1, "ghost@iit.ac.in", "warden")
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/warden/reset-password?user="+token, map[string]any{"password": "x"})
	assertStatus(t, rec, 403)
}

func TestWardenResetPassword_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.resetbad@iit.ac.in")
	token := genToken(t, w.ID, w.Email, "warden")
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/warden/reset-password?user="+token, []string{"bad"})
	assertStatus(t, rec, 400)
}
