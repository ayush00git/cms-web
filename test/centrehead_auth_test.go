package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"

	"golang.org/x/crypto/bcrypt"
)

// --- CentreheadSignup -------------------------------------------------------

func TestCentreheadSignup_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centrehead/signup", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestCentreheadSignup_AlreadyRegistered(t *testing.T) {
	db := newTestDB(t)
	seedCentrehead(t, db, "ch.dup@iit.ac.in")

	e := newAuthRouter(db, noAuth())
	body := map[string]any{
		"name":         "Duplicate Head",
		"email":        "ch.dup@iit.ac.in",
		"password":     "whatever",
		"building":     string(models.LHC),
		"phone_number": "7777777777",
	}
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centrehead/signup", body)
	assertStatus(t, rec, 409)
}

// --- CentreheadLogin --------------------------------------------------------

func TestCentreheadLogin_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.login@iit.ac.in")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centrehead/login", map[string]any{
		"email":    ch.Email,
		"password": testPassword,
	})

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if out["role"] != "centrehead" {
		t.Fatalf("expected role centrehead, got %v", out)
	}
}

func TestCentreheadLogin_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centrehead/login", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestCentreheadLogin_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centrehead/login", map[string]any{
		"email":    "ghost@iit.ac.in",
		"password": testPassword,
	})
	assertStatus(t, rec, 404)
}

func TestCentreheadLogin_Unverified(t *testing.T) {
	db := newTestDB(t)
	ch := models.Centrehead{Email: "ch.unv@iit.ac.in", Password: testPasswordHash, Building: models.LHC, PhoneNumber: "7777777777", IsVerified: false}
	db.Create(&ch)

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centrehead/login", map[string]any{
		"email":    ch.Email,
		"password": testPassword,
	})
	assertStatus(t, rec, 403)
}

// CentreheadLogin returns 403 (not 401) on a bad password — locking in the
// handler's current behaviour.
func TestCentreheadLogin_WrongPassword(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.wrongpw@iit.ac.in")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centrehead/login", map[string]any{
		"email":    ch.Email,
		"password": "nope",
	})
	assertStatus(t, rec, 401)
}

// --- CentreheadForgetPassword -----------------------------------------------

func TestCentreheadForgetPassword_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centrehead/forget-password", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestCentreheadForgetPassword_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centrehead/forget-password", map[string]any{"email": "ghost@iit.ac.in"})
	assertStatus(t, rec, 404)
}

func TestCentreheadForgetPassword_Unverified(t *testing.T) {
	db := newTestDB(t)
	ch := models.Centrehead{Email: "ch.fpunv@iit.ac.in", Password: testPasswordHash, Building: models.LHC, PhoneNumber: "7777777777", IsVerified: false}
	db.Create(&ch)

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centrehead/forget-password", map[string]any{"email": ch.Email})
	assertStatus(t, rec, 403)
}

// --- CentreheadResetPassword ------------------------------------------------

func TestCentreheadResetPassword_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.reset@iit.ac.in")
	token := genToken(t, ch.ID, ch.Email, "centrehead")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/centrehead/reset-password?user="+token, map[string]any{
		"password": "BrandNewPass1",
	})

	assertStatus(t, rec, 200)

	var updated models.Centrehead
	db.First(&updated, ch.ID)
	if err := bcrypt.CompareHashAndPassword([]byte(updated.Password), []byte("BrandNewPass1")); err != nil {
		t.Fatalf("password was not updated: %v", err)
	}
}

func TestCentreheadResetPassword_InvalidToken(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/centrehead/reset-password?user=garbage", map[string]any{"password": "x"})
	assertStatus(t, rec, 500)
}

func TestCentreheadResetPassword_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	token := genToken(t, 1, "ghost@iit.ac.in", "centrehead")
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/centrehead/reset-password?user="+token, map[string]any{"password": "x"})
	assertStatus(t, rec, 403)
}

func TestCentreheadResetPassword_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.resetbad@iit.ac.in")
	token := genToken(t, ch.ID, ch.Email, "centrehead")
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/centrehead/reset-password?user="+token, []string{"bad"})
	assertStatus(t, rec, 400)
}
