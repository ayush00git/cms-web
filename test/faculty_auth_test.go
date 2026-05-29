package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"

	"golang.org/x/crypto/bcrypt"
)

// --- FacultySignup ----------------------------------------------------------
//
// The happy path (new user / unverified resend) fans out to an SMTP dial, so it
// is intentionally not exercised here. We cover the deterministic branches that
// resolve before any mail is sent.

func TestFacultySignup_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/faculty/signup", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestFacultySignup_AlreadyRegistered(t *testing.T) {
	db := newTestDB(t)
	seedFaculty(t, db, "fac.dup@iit.ac.in") // seeded users are verified

	e := newAuthRouter(db, noAuth())
	body := map[string]any{
		"name":         "Dup",
		"email":        "fac.dup@iit.ac.in",
		"password":     "whatever",
		"department":   string(models.CSE),
		"house_number": "1",
		"block":        "A",
		"type":         "1",
		"phone_number": "9999999999",
	}
	rec := doRequest(t, e, http.MethodPost, "/api/auth/faculty/signup", body)
	assertStatus(t, rec, 409)
}

// --- FacultyLogin -----------------------------------------------------------

func TestFacultyLogin_Success(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.login@iit.ac.in")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/faculty/login", map[string]any{
		"email":    f.Email,
		"password": testPassword,
	})

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if out["role"] != "faculty" {
		t.Fatalf("expected role faculty in response, got %v", out)
	}
	// a session cookie should have been planted
	if len(rec.Result().Cookies()) == 0 {
		t.Fatalf("expected a token cookie to be set")
	}
}

func TestFacultyLogin_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/faculty/login", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestFacultyLogin_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/faculty/login", map[string]any{
		"email":    "ghost@iit.ac.in",
		"password": testPassword,
	})
	assertStatus(t, rec, 404)
}

func TestFacultyLogin_Unverified(t *testing.T) {
	db := newTestDB(t)
	f := models.Faculty{Name: "Unv", Email: "fac.unv@iit.ac.in", Password: testPasswordHash, Department: models.CSE, HouseNumber: "1", Block: models.BlockA, Type: models.Type1, PhoneNumber: "9999999999", IsVerified: false}
	db.Create(&f)

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/faculty/login", map[string]any{
		"email":    f.Email,
		"password": testPassword,
	})
	assertStatus(t, rec, 403)
}

func TestFacultyLogin_WrongPassword(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.wrongpw@iit.ac.in")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/faculty/login", map[string]any{
		"email":    f.Email,
		"password": "not-the-password",
	})
	assertStatus(t, rec, 401)
}

// --- FacultyForgetPassword --------------------------------------------------
//
// The verified happy path triggers an SMTP dial, so only the pre-mail branches
// are covered.

func TestFacultyForgetPassword_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/faculty/forget-password", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestFacultyForgetPassword_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/faculty/forget-password", map[string]any{"email": "ghost@iit.ac.in"})
	assertStatus(t, rec, 404)
}

func TestFacultyForgetPassword_Unverified(t *testing.T) {
	db := newTestDB(t)
	f := models.Faculty{Name: "Unv", Email: "fac.fpunv@iit.ac.in", Password: testPasswordHash, Department: models.CSE, HouseNumber: "1", Block: models.BlockA, Type: models.Type1, PhoneNumber: "9999999999", IsVerified: false}
	db.Create(&f)

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/faculty/forget-password", map[string]any{"email": f.Email})
	assertStatus(t, rec, 403)
}

// --- FacultyResetPassword ---------------------------------------------------

func TestFacultyResetPassword_Success(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.reset@iit.ac.in")
	token := genToken(t, f.ID, f.Email, "faculty")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/faculty/reset-password?user="+token, map[string]any{
		"password": "BrandNewPass1",
	})

	assertStatus(t, rec, 200)

	var updated models.Faculty
	db.First(&updated, f.ID)
	if err := bcrypt.CompareHashAndPassword([]byte(updated.Password), []byte("BrandNewPass1")); err != nil {
		t.Fatalf("password was not updated to the new value: %v", err)
	}
}

func TestFacultyResetPassword_InvalidToken(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/faculty/reset-password?user=garbage", map[string]any{"password": "x"})
	assertStatus(t, rec, 500)
}

func TestFacultyResetPassword_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	// valid token, but no faculty row with that email
	token := genToken(t, 1, "ghost@iit.ac.in", "faculty")
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/faculty/reset-password?user="+token, map[string]any{"password": "x"})
	assertStatus(t, rec, 403)
}

func TestFacultyResetPassword_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.resetbad@iit.ac.in")
	token := genToken(t, f.ID, f.Email, "faculty")
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/auth/faculty/reset-password?user="+token, []string{"bad"})
	assertStatus(t, rec, 400)
}
