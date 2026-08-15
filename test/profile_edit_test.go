package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"
)

// --- FacultyProfileEdit ------------------------------------------------------

func TestFacultyProfileEdit_Success(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "f.edit@iit.ac.in")

	e := newAuthRouter(db, authAs(f.ID, f.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/faculty/profile/edit", map[string]any{
		"name":         "Updated Name",
		"department":   string(models.ECE),
		"house_number": "42",
		"block":        string(models.BlockB),
		"type":         string(models.Type2),
		"phone_number": "6666666666",
	})

	assertStatus(t, rec, 200)

	var updated models.Faculty
	db.First(&updated, f.ID)
	if updated.Name != "Updated Name" || updated.Department != models.ECE ||
		updated.HouseNumber != "42" || updated.Block != models.BlockB ||
		updated.Type != models.Type2 || updated.PhoneNumber != "6666666666" {
		t.Fatalf("profile fields not updated as expected: %+v", updated)
	}
}

func TestFacultyProfileEdit_PartialUpdate(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "f.partial@iit.ac.in")

	e := newAuthRouter(db, authAs(f.ID, f.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/faculty/profile/edit", map[string]any{
		"phone_number": "5555555555",
	})

	assertStatus(t, rec, 200)

	var updated models.Faculty
	db.First(&updated, f.ID)
	if updated.PhoneNumber != "5555555555" {
		t.Fatalf("expected phone number updated, got %q", updated.PhoneNumber)
	}
	if updated.Department != f.Department || updated.Name != f.Name {
		t.Fatalf("expected untouched fields to survive a partial update, got %+v", updated)
	}
}

func TestFacultyProfileEdit_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/faculty/profile/edit", map[string]any{"name": "x"})
	assertStatus(t, rec, 403)
}

func TestFacultyProfileEdit_ProfileNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, authAs(1, "ghost@iit.ac.in"))
	rec := doRequest(t, e, http.MethodPatch, "/api/faculty/profile/edit", map[string]any{"name": "x"})
	assertStatus(t, rec, 404)
}

func TestFacultyProfileEdit_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "f.badbody@iit.ac.in")
	e := newAuthRouter(db, authAs(f.ID, f.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/faculty/profile/edit", []string{"bad"})
	assertStatus(t, rec, 400)
}

// --- WardenProfileEdit -------------------------------------------------------

func TestWardenProfileEdit_Success(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "w.edit@iit.ac.in")

	e := newAuthRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/warden/profile/edit", map[string]any{
		"name":         "Updated Warden",
		"hostel":       string(models.HBH),
		"phone_number": "4444444444",
	})

	assertStatus(t, rec, 200)

	var updated models.Warden
	db.First(&updated, w.ID)
	if updated.Name != "Updated Warden" || updated.Hostel != models.HBH || updated.PhoneNumber != "4444444444" {
		t.Fatalf("profile fields not updated as expected: %+v", updated)
	}
}

func TestWardenProfileEdit_PartialUpdate(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "w.partial@iit.ac.in")

	e := newAuthRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/warden/profile/edit", map[string]any{
		"hostel": string(models.NBH),
	})

	assertStatus(t, rec, 200)

	var updated models.Warden
	db.First(&updated, w.ID)
	if updated.Hostel != models.NBH {
		t.Fatalf("expected hostel updated, got %q", updated.Hostel)
	}
	if updated.PhoneNumber != w.PhoneNumber {
		t.Fatalf("expected untouched fields to survive a partial update, got %+v", updated)
	}
}

func TestWardenProfileEdit_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/warden/profile/edit", map[string]any{"name": "x"})
	assertStatus(t, rec, 403)
}

func TestWardenProfileEdit_ProfileNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, authAs(1, "ghost@iit.ac.in"))
	rec := doRequest(t, e, http.MethodPatch, "/api/warden/profile/edit", map[string]any{"name": "x"})
	assertStatus(t, rec, 404)
}

func TestWardenProfileEdit_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "w.badbody@iit.ac.in")
	e := newAuthRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/warden/profile/edit", []string{"bad"})
	assertStatus(t, rec, 400)
}

// --- CentreheadProfileEdit ---------------------------------------------------

func TestCentreheadProfileEdit_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.edit@iit.ac.in")

	e := newAuthRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/centrehead/profile/edit", map[string]any{
		"building":     string(models.CentralLibrary),
		"phone_number": "3333333333",
	})

	assertStatus(t, rec, 200)

	var updated models.Centrehead
	db.First(&updated, ch.ID)
	if updated.Building != models.CentralLibrary || updated.PhoneNumber != "3333333333" {
		t.Fatalf("profile fields not updated as expected: %+v", updated)
	}
}

func TestCentreheadProfileEdit_PartialUpdate(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.partial@iit.ac.in")

	e := newAuthRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/centrehead/profile/edit", map[string]any{
		"phone_number": "2222222222",
	})

	assertStatus(t, rec, 200)

	var updated models.Centrehead
	db.First(&updated, ch.ID)
	if updated.PhoneNumber != "2222222222" {
		t.Fatalf("expected phone number updated, got %q", updated.PhoneNumber)
	}
	if updated.Building != ch.Building {
		t.Fatalf("expected untouched fields to survive a partial update, got %+v", updated)
	}
}

func TestCentreheadProfileEdit_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/centrehead/profile/edit", map[string]any{"building": "x"})
	assertStatus(t, rec, 403)
}

// CentreheadProfileEdit's not-found branch is missing a `return` after writing
// the 404, so it falls through and writes a second (500) response on top of
// it. net/http.ResponseRecorder locks in the status of the first WriteHeader
// call, so the recorded status is still 404 — but the body ends up as two
// concatenated JSON objects, which is why this test checks the status only
// and does not attempt to decode the body like its Faculty/Warden siblings do.
func TestCentreheadProfileEdit_ProfileNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newAuthRouter(db, authAs(1, "ghost@iit.ac.in"))
	rec := doRequest(t, e, http.MethodPatch, "/api/centrehead/profile/edit", map[string]any{"building": "x"})
	assertStatus(t, rec, 404)
}

func TestCentreheadProfileEdit_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.badbody@iit.ac.in")
	e := newAuthRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/centrehead/profile/edit", []string{"bad"})
	assertStatus(t, rec, 400)
}
