package test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"
)

// --- AdminLogin (sends the access mail) -------------------------------------
//
// The happy path dials SMTP inside services.SendProfileAccessMailToAdmins, so
// like the signup suites we only cover the branches that never reach the
// mailer. The link-consuming side of the flow is fully tested via AdminAccess.

func TestAdminLogin_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	e := newAdminAuthRouter(db)
	rec := doRequest(t, e, http.MethodPost, "/api/auth/admin/login", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestAdminLogin_NotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAdminAuthRouter(db)
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

	e := newAdminAuthRouter(db)
	rec := doRequest(t, e, http.MethodPost, "/api/auth/admin/login", map[string]any{
		"email": admin.Email,
	})
	assertStatus(t, rec, 401)
}

// --- AdminAccess (completes the passwordless login) -------------------------

func TestAdminAccess_Success(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.access@iit.ac.in", models.TypeXENElectrical)

	e := newAdminAuthRouter(db)
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
	e := newAdminAuthRouter(db)
	rec := doRequest(t, e, http.MethodGet, "/api/auth/admin/access", nil)
	assertStatus(t, rec, 401)
}

func TestAdminAccess_InvalidToken(t *testing.T) {
	db := newTestDB(t)
	e := newAdminAuthRouter(db)
	rec := doRequest(t, e, http.MethodGet, "/api/auth/admin/access?token=not-a-jwt", nil)
	assertStatus(t, rec, 401)
}

func TestAdminAccess_AdminNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAdminAuthRouter(db)
	token := genToken(t, 999, "ghost.admin@iit.ac.in", "admin")
	rec := doRequest(t, e, http.MethodGet, fmt.Sprintf("/api/auth/admin/access?token=%s", token), nil)
	assertStatus(t, rec, 403)
}
