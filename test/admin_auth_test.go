package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"
)

// --- AdminLogin -------------------------------------------------------------

func TestAdminLogin_Success(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.login@iit.ac.in", models.TypeXENCivil)

	e := newAdminAuthRouter(db)
	rec := doRequest(t, e, http.MethodPost, "/api/auth/admin/login", map[string]any{
		"email":    admin.Email,
		"password": testPassword,
	})

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if out["position"] != string(models.TypeXENCivil) {
		t.Fatalf("expected position %s in response, got %v", models.TypeXENCivil, out)
	}
	if len(rec.Result().Cookies()) == 0 {
		t.Fatalf("expected a token cookie to be set")
	}
}

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
		"email":    "ghost.admin@iit.ac.in",
		"password": testPassword,
	})
	assertStatus(t, rec, 404)
}

func TestAdminLogin_WrongPassword(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.wrongpw@iit.ac.in", models.TypeAECivil)

	e := newAdminAuthRouter(db)
	rec := doRequest(t, e, http.MethodPost, "/api/auth/admin/login", map[string]any{
		"email":    admin.Email,
		"password": "nope",
	})
	assertStatus(t, rec, 401)
}
