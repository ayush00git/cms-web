package test

import (
	"errors"
	"fmt"
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"
)

// --- AdminLogin (sends the access mail) -------------------------------------

func TestAdminLogin_SendsAccessMail(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.login@iit.ac.in", models.TypeXENCivil)

	var gotID uint
	var gotEmail string
	e := newAdminAuthRouter(db, func(adminID uint, email string) error {
		gotID = adminID
		gotEmail = email
		return nil
	})

	rec := doRequest(t, e, http.MethodPost, "/api/auth/admin/login", map[string]any{
		"email": admin.Email,
	})

	assertStatus(t, rec, 200)
	if gotID != admin.ID || gotEmail != admin.Email {
		t.Fatalf("expected access mail for (%d, %s), got (%d, %s)", admin.ID, admin.Email, gotID, gotEmail)
	}
	// the session must not start until the emailed link is clicked
	if len(rec.Result().Cookies()) != 0 {
		t.Fatalf("expected no cookie on login, got %v", rec.Result().Cookies())
	}
}

func TestAdminLogin_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAdminAuthRouter(db, nil)
	rec := doRequest(t, e, http.MethodPost, "/api/auth/admin/login", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestAdminLogin_NotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAdminAuthRouter(db, nil)
	rec := doRequest(t, e, http.MethodPost, "/api/auth/admin/login", map[string]any{
		"email": "ghost.admin@iit.ac.in",
	})
	assertStatus(t, rec, 403)
}

func TestAdminLogin_Unverified(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.unverified@iit.ac.in", models.TypeAECivil)
	if err := db.Model(&admin).Update("is_verified", false).Error; err != nil {
		t.Fatalf("failed to unverify admin: %v", err)
	}

	e := newAdminAuthRouter(db, nil)
	rec := doRequest(t, e, http.MethodPost, "/api/auth/admin/login", map[string]any{
		"email": admin.Email,
	})
	assertStatus(t, rec, 401)
}

func TestAdminLogin_MailFailure(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.mailfail@iit.ac.in", models.TypeJECivil)

	e := newAdminAuthRouter(db, func(uint, string) error {
		return errors.New("smtp is down")
	})
	rec := doRequest(t, e, http.MethodPost, "/api/auth/admin/login", map[string]any{
		"email": admin.Email,
	})
	assertStatus(t, rec, 500)
}

// --- AdminAccess (completes the passwordless login) -------------------------

func TestAdminAccess_Success(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.access@iit.ac.in", models.TypeXENElectrical)

	e := newAdminAuthRouter(db, nil)
	token := genToken(t, admin.ID, admin.Email, "admin")
	rec := doRequest(t, e, http.MethodGet, fmt.Sprintf("/api/auth/admin/access?token=%s", token), nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if out["position"] != string(models.TypeXENElectrical) {
		t.Fatalf("expected position %s in response, got %v", models.TypeXENElectrical, out)
	}
	if len(rec.Result().Cookies()) == 0 {
		t.Fatalf("expected a token cookie to be set")
	}
}

func TestAdminAccess_MissingToken(t *testing.T) {
	db := newTestDB(t)
	e := newAdminAuthRouter(db, nil)
	rec := doRequest(t, e, http.MethodGet, "/api/auth/admin/access", nil)
	assertStatus(t, rec, 401)
}

func TestAdminAccess_InvalidToken(t *testing.T) {
	db := newTestDB(t)
	e := newAdminAuthRouter(db, nil)
	rec := doRequest(t, e, http.MethodGet, "/api/auth/admin/access?token=not-a-jwt", nil)
	assertStatus(t, rec, 401)
}

func TestAdminAccess_AdminNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAdminAuthRouter(db, nil)
	token := genToken(t, 999, "ghost.admin@iit.ac.in", "admin")
	rec := doRequest(t, e, http.MethodGet, fmt.Sprintf("/api/auth/admin/access?token=%s", token), nil)
	assertStatus(t, rec, 403)
}
