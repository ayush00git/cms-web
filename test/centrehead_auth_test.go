package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"

	"golang.org/x/crypto/bcrypt"
)

// --- CentreHeadSignup -------------------------------------------------------

func TestCentreHeadSignup_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centre_head/signup", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestCentreHeadSignup_AlreadyRegistered(t *testing.T) {
	db := newTestDB(t)
	seedCentreHead(t, db, "ch.dup@iit.ac.in")

	e := newAuthRouter(db, noAuth())
	body := map[string]any{
		"email":        "ch.dup@iit.ac.in",
		"password":     "whatever",
		"building":     string(models.LHC),
		"phone_number": "7777777777",
	}
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centre_head/signup", body)
	assertStatus(t, rec, 409)
}

// --- CentreHeadLogin --------------------------------------------------------

func TestCentreHeadLogin_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentreHead(t, db, "ch.login@iit.ac.in")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centre_head/login", map[string]any{
		"email":    ch.Email,
		"password": testPassword,
	})

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if out["role"] != "centrehead" {
		t.Fatalf("expected role centrehead, got %v", out)
	}
}

func TestCentreHeadLogin_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centre_head/login", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestCentreHeadLogin_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centre_head/login", map[string]any{
		"email":    "ghost@iit.ac.in",
		"password": testPassword,
	})
	assertStatus(t, rec, 404)
}

func TestCentreHeadLogin_Unverified(t *testing.T) {
	db := newTestDB(t)
	ch := models.CentreHead{Email: "ch.unv@iit.ac.in", Password: testPasswordHash, Building: models.LHC, PhoneNumber: "7777777777", IsVerified: false}
	db.Create(&ch)

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centre_head/login", map[string]any{
		"email":    ch.Email,
		"password": testPassword,
	})
	assertStatus(t, rec, 403)
}

// CentreHeadLogin returns 403 (not 401) on a bad password — locking in the
// handler's current behaviour.
func TestCentreHeadLogin_WrongPassword(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentreHead(t, db, "ch.wrongpw@iit.ac.in")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centre_head/login", map[string]any{
		"email":    ch.Email,
		"password": "nope",
	})
	assertStatus(t, rec, 401)
}

// --- CentreHeadForgetPassword -----------------------------------------------

func TestCentreHeadForgetPassword_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centre_head/forget-password", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestCentreHeadForgetPassword_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centre_head/forget-password", map[string]any{"email": "ghost@iit.ac.in"})
	assertStatus(t, rec, 404)
}

func TestCentreHeadForgetPassword_Unverified(t *testing.T) {
	db := newTestDB(t)
	ch := models.CentreHead{Email: "ch.fpunv@iit.ac.in", Password: testPasswordHash, Building: models.LHC, PhoneNumber: "7777777777", IsVerified: false}
	db.Create(&ch)

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/centre_head/forget-password", map[string]any{"email": ch.Email})
	assertStatus(t, rec, 403)
}

// --- CentreHeadResetPassword ------------------------------------------------

func TestCentreHeadResetPassword_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentreHead(t, db, "ch.reset@iit.ac.in")
	token := genToken(t, ch.ID, ch.Email, "centrehead")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/centre_head/reset-password?user="+token, map[string]any{
		"password": "BrandNewPass1",
	})

	assertStatus(t, rec, 200)

	var updated models.CentreHead
	db.First(&updated, ch.ID)
	if err := bcrypt.CompareHashAndPassword([]byte(updated.Password), []byte("BrandNewPass1")); err != nil {
		t.Fatalf("password was not updated: %v", err)
	}
}

func TestCentreHeadResetPassword_InvalidToken(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/centre_head/reset-password?user=garbage", map[string]any{"password": "x"})
	assertStatus(t, rec, 500)
}

func TestCentreHeadResetPassword_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	token := genToken(t, 1, "ghost@iit.ac.in", "centrehead")
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/centre_head/reset-password?user="+token, map[string]any{"password": "x"})
	assertStatus(t, rec, 403)
}

func TestCentreHeadResetPassword_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentreHead(t, db, "ch.resetbad@iit.ac.in")
	token := genToken(t, ch.ID, ch.Email, "centrehead")
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/centre_head/reset-password?user="+token, []string{"bad"})
	assertStatus(t, rec, 400)
}
