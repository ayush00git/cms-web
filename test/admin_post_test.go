package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"
)

// --- GetXENPosts ------------------------------------------------------------

func TestGetXENPosts_Success(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "xen.civil@iit.ac.in", models.TypeXENCivil)

	// In-scope: Civil + a status the XEN view cares about.
	db.Create(&models.FacultyPost{FacultyID: 1, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "fac", Description: "d", Status: models.StatusPendingXEN})
	db.Create(&models.WardenPost{WardenID: 1, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "war", Description: "d", Status: models.StatusResolved})
	db.Create(&models.CentreheadPost{CentreheadID: 1, TypeOfPost: models.TypeCivil, Title: "ch", Description: "d", Status: models.StatusRejected})
	// Out-of-scope: Electrical type should be filtered out for a Civil XEN.
	db.Create(&models.FacultyPost{FacultyID: 1, Place: models.PlaceDepartmental, TypeOfPost: models.TypeElectrical, Title: "elec", Description: "d", Status: models.StatusPendingXEN})

	e := newAdminRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/xen", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if fp := out["faculty_posts"].([]any); len(fp) != 1 {
		t.Fatalf("expected 1 civil faculty post, got %d", len(fp))
	}
	if wp := out["warden_posts"].([]any); len(wp) != 1 {
		t.Fatalf("expected 1 civil warden post, got %d", len(wp))
	}
	if cp := out["centrehead_posts"].([]any); len(cp) != 1 {
		t.Fatalf("expected 1 civil centre head post, got %d", len(cp))
	}
}

func TestGetXENPosts_WrongPosition(t *testing.T) {
	db := newTestDB(t)
	// A JE trying to hit the XEN-only endpoint.
	admin := seedAdmin(t, db, "je.civil@iit.ac.in", models.TypeJECivil)
	e := newAdminRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/xen", nil)
	assertStatus(t, rec, 403)
}

func TestGetXENPosts_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newAdminRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/admin/xen", nil)
	assertStatus(t, rec, 401)
}

func TestGetXENPosts_NotAnAdmin(t *testing.T) {
	db := newTestDB(t)
	// Authenticated email that has no matching admin row -> Take errors -> 500.
	e := newAdminRouter(db, authAs(1, "nobody@iit.ac.in"))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/xen", nil)
	assertStatus(t, rec, 500)
}

// --- GetAEPosts -------------------------------------------------------------

func TestGetAEPosts_Success(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "ae.civil@iit.ac.in", models.TypeAECivil)

	db.Create(&models.FacultyPost{FacultyID: 1, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "fac", Description: "d", Status: models.StatusPendingAE})
	db.Create(&models.WardenPost{WardenID: 1, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "war", Description: "d", Status: models.StatusPendingJE})
	// Out-of-scope status for the AE view.
	db.Create(&models.FacultyPost{FacultyID: 1, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "closed", Description: "d", Status: models.StatusResolved})

	e := newAdminRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/ae", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if fp := out["faculty_posts"].([]any); len(fp) != 1 {
		t.Fatalf("expected 1 in-scope faculty post, got %d", len(fp))
	}
	if wp := out["warden_posts"].([]any); len(wp) != 1 {
		t.Fatalf("expected 1 in-scope warden post, got %d", len(wp))
	}
}

func TestGetAEPosts_WrongPosition(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "xen.forae@iit.ac.in", models.TypeXENCivil)
	e := newAdminRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/ae", nil)
	assertStatus(t, rec, 403)
}

func TestGetAEPosts_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newAdminRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/admin/ae", nil)
	assertStatus(t, rec, 401)
}

// --- GetJEPosts -------------------------------------------------------------

func TestGetJEPosts_Success(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "je.civil2@iit.ac.in", models.TypeJECivil)

	db.Create(&models.FacultyPost{FacultyID: 1, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "fac", Description: "d", Status: models.StatusPendingJE})
	db.Create(&models.CentreheadPost{CentreheadID: 1, TypeOfPost: models.TypeCivil, Title: "ch", Description: "d", Status: models.StatusResolvedJE})
	// Out-of-scope status for the JE view.
	db.Create(&models.FacultyPost{FacultyID: 1, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "x", Description: "d", Status: models.StatusPendingXEN})

	e := newAdminRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/je", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if fp := out["faculty_posts"].([]any); len(fp) != 1 {
		t.Fatalf("expected 1 in-scope faculty post, got %d", len(fp))
	}
	if cp := out["centrehead_posts"].([]any); len(cp) != 1 {
		t.Fatalf("expected 1 in-scope centre head post, got %d", len(cp))
	}
}

func TestGetJEPosts_WrongPosition(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "ae.forje@iit.ac.in", models.TypeAECivil)
	e := newAdminRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/je", nil)
	assertStatus(t, rec, 403)
}

func TestGetJEPosts_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newAdminRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/admin/je", nil)
	assertStatus(t, rec, 401)
}

// --- AdminGetPost -----------------------------------------------------------

func TestAdminGetPost_Faculty(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.get@iit.ac.in", models.TypeXENCivil)
	f := seedFaculty(t, db, "fac.adminget@iit.ac.in")
	post := models.FacultyPost{FacultyID: f.ID, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newAdminRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/post/faculty/1", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if out["post"] == nil {
		t.Fatalf("expected a post in the response, got %v", out)
	}
}

func TestAdminGetPost_Warden(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.getw@iit.ac.in", models.TypeXENCivil)
	w := seedWarden(t, db, "war.adminget@iit.ac.in")
	post := models.WardenPost{WardenID: w.ID, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newAdminRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/post/warden/1", nil)
	assertStatus(t, rec, 200)
}

func TestAdminGetPost_Centrehead(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.getc@iit.ac.in", models.TypeXENCivil)
	ch := seedCentrehead(t, db, "ch.adminget@iit.ac.in")
	post := models.CentreheadPost{CentreheadID: ch.ID, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newAdminRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/post/centrehead/1", nil)
	assertStatus(t, rec, 200)
}

func TestAdminGetPost_UndefinedRole(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.role@iit.ac.in", models.TypeXENCivil)
	e := newAdminRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/post/student/1", nil)
	assertStatus(t, rec, 403)
}

func TestAdminGetPost_PostNotFound(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.nf@iit.ac.in", models.TypeXENCivil)
	e := newAdminRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/post/faculty/9999", nil)
	assertStatus(t, rec, 404)
}

func TestAdminGetPost_BadPostID(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.badid@iit.ac.in", models.TypeXENCivil)
	e := newAdminRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/post/faculty/not-a-number", nil)
	assertStatus(t, rec, 500)
}

func TestAdminGetPost_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newAdminRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/admin/post/faculty/1", nil)
	assertStatus(t, rec, 401)
}

func TestAdminGetPost_NotAnAdmin(t *testing.T) {
	db := newTestDB(t)
	// Authenticated email with no admin row -> 403 access denied.
	e := newAdminRouter(db, authAs(1, "nobody.admin@iit.ac.in"))
	rec := doRequest(t, e, http.MethodGet, "/api/admin/post/faculty/1", nil)
	assertStatus(t, rec, 403)
}
