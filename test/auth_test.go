package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"
)

// --- Logout -----------------------------------------------------------------

func TestLogout_Success(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/auth/logout", nil)

	assertStatus(t, rec, 200)
	// the handler should expire the token cookie
	if len(rec.Result().Cookies()) == 0 {
		t.Fatalf("expected logout to set an (expiring) cookie")
	}
}

// --- VerifyAccount ----------------------------------------------------------

func TestVerifyAccount_Faculty(t *testing.T) {
	db := newTestDB(t)
	f := models.Faculty{Name: "V", Email: "fac.verify@iit.ac.in", Password: testPasswordHash, Department: models.CSE, HouseNumber: "1", Block: models.BlockA, Type: models.Type1, PhoneNumber: "9999999999", IsVerified: false}
	db.Create(&f)
	token := genToken(t, f.ID, f.Email, "faculty")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/auth/verify?token="+token, nil)

	assertStatus(t, rec, 200)

	var updated models.Faculty
	db.First(&updated, f.ID)
	if !updated.IsVerified {
		t.Fatalf("expected faculty to be marked verified")
	}
}

func TestVerifyAccount_Warden(t *testing.T) {
	db := newTestDB(t)
	w := models.Warden{Email: "war.verify@iit.ac.in", Password: testPasswordHash, Hostel: models.KBH, PhoneNumber: "8888888888", IsVerified: false}
	db.Create(&w)
	token := genToken(t, w.ID, w.Email, "warden")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/auth/verify?token="+token, nil)

	assertStatus(t, rec, 200)
	var updated models.Warden
	db.First(&updated, w.ID)
	if !updated.IsVerified {
		t.Fatalf("expected warden to be marked verified")
	}
}

func TestVerifyAccount_Centrehead(t *testing.T) {
	db := newTestDB(t)
	ch := models.Centrehead{Email: "ch.verify@iit.ac.in", Password: testPasswordHash, Building: models.LHC, PhoneNumber: "7777777777", IsVerified: false}
	db.Create(&ch)
	token := genToken(t, ch.ID, ch.Email, "centrehead")

	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/auth/verify?token="+token, nil)

	assertStatus(t, rec, 200)
	var updated models.Centrehead
	db.First(&updated, ch.ID)
	if !updated.IsVerified {
		t.Fatalf("expected centre head to be marked verified")
	}
}

func TestVerifyAccount_InvalidToken(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/auth/verify?token=garbage", nil)
	assertStatus(t, rec, 403)
}

func TestVerifyAccount_UndefinedRole(t *testing.T) {
	db := newTestDB(t)
	token := genToken(t, 1, "alien@iit.ac.in", "alien")
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/auth/verify?token="+token, nil)
	assertStatus(t, rec, 400)
}

// --- UserProfile ------------------------------------------------------------

func TestUserProfile_Faculty(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.profile@iit.ac.in")

	e := newAuthRouter(db, authAsRole(f.ID, f.Email, "faculty"))
	rec := doRequest(t, e, http.MethodGet, "/api/profile", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if out["email"] != f.Email {
		t.Fatalf("expected profile for %s, got %v", f.Email, out["email"])
	}
}

func TestUserProfile_Warden(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.profile@iit.ac.in")

	e := newAuthRouter(db, authAsRole(w.ID, w.Email, "warden"))
	rec := doRequest(t, e, http.MethodGet, "/api/profile", nil)
	assertStatus(t, rec, 200)
}

func TestUserProfile_Centrehead(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.profile@iit.ac.in")

	e := newAuthRouter(db, authAsRole(ch.ID, ch.Email, "centrehead"))
	rec := doRequest(t, e, http.MethodGet, "/api/profile", nil)
	assertStatus(t, rec, 200)
}

func TestUserProfile_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/profile", nil)
	assertStatus(t, rec, 401)
}

func TestUserProfile_UndefinedRole(t *testing.T) {
	db := newTestDB(t)
	// authenticated, but with a role the handler does not recognise
	e := newAuthRouter(db, authAsRole(1, "someone@iit.ac.in", "admin"))
	rec := doRequest(t, e, http.MethodGet, "/api/profile", nil)
	assertStatus(t, rec, 404)
}
