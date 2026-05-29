package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"
)

// --- FacultyPost (create) ---------------------------------------------------

func TestFacultyPost_Create_Success(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.create@iit.ac.in")
	e := newPostRouter(db, authAs(f.ID, f.Email))

	body := map[string]any{
		"place":        "Departmental",
		"type_of_post": "Civil",
		"title":        "Leaking roof",
		"description":  "Roof leaks in lab 3",
	}
	rec := doRequest(t, e, http.MethodPost, "/api/post/faculty", body)

	assertStatus(t, rec, 201)

	var count int64
	db.Model(&models.FacultyPost{}).Where("faculty_id = ?", f.ID).Count(&count)
	if count != 1 {
		t.Fatalf("expected 1 persisted post, got %d", count)
	}
}

func TestFacultyPost_Create_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())

	body := map[string]any{"place": "Departmental", "type_of_post": "Civil", "title": "x", "description": "y"}
	rec := doRequest(t, e, http.MethodPost, "/api/post/faculty", body)

	assertStatus(t, rec, 401)
}

func TestFacultyPost_Create_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.badbody@iit.ac.in")
	e := newPostRouter(db, authAs(f.ID, f.Email))

	// Send a JSON array where an object is expected.
	rec := doRequest(t, e, http.MethodPost, "/api/post/faculty", []string{"not", "an", "object"})

	assertStatus(t, rec, 400)
}

func TestFacultyPost_Create_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	// Authenticated as someone who does not exist in the DB.
	e := newPostRouter(db, authAs(999, "ghost@iit.ac.in"))

	body := map[string]any{"place": "Departmental", "type_of_post": "Civil", "title": "x", "description": "y"}
	rec := doRequest(t, e, http.MethodPost, "/api/post/faculty", body)

	assertStatus(t, rec, 401)
}

// --- FacultyPostEdit --------------------------------------------------------

func TestFacultyPostEdit_Success(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.edit@iit.ac.in")
	post := models.FacultyPost{FacultyID: f.ID, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "old", Description: "old desc"}
	db.Create(&post)

	e := newPostRouter(db, authAs(f.ID, f.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/post/faculty/edit/1", map[string]any{
		"title":       "new title",
		"description": "new desc",
	})

	assertStatus(t, rec, 200)

	var updated models.FacultyPost
	db.First(&updated, post.ID)
	if updated.Title != "new title" {
		t.Fatalf("expected title to be updated, got %q", updated.Title)
	}
}

func TestFacultyPostEdit_NotFound(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.editnf@iit.ac.in")
	e := newPostRouter(db, authAs(f.ID, f.Email))

	rec := doRequest(t, e, http.MethodPatch, "/api/post/faculty/edit/424242", map[string]any{"title": "x"})

	assertStatus(t, rec, 404)
}

func TestFacultyPostEdit_WrongAuthor(t *testing.T) {
	db := newTestDB(t)
	owner := seedFaculty(t, db, "fac.owner@iit.ac.in")
	other := seedFaculty(t, db, "fac.other@iit.ac.in")
	post := models.FacultyPost{FacultyID: owner.ID, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(other.ID, other.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/post/faculty/edit/1", map[string]any{"title": "hijack"})

	assertStatus(t, rec, 403)
}

func TestFacultyPostEdit_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/post/faculty/edit/1", map[string]any{"title": "x"})
	assertStatus(t, rec, 401)
}

// --- FacultyPostDelete ------------------------------------------------------

func TestFacultyPostDelete_Success(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.del@iit.ac.in")
	post := models.FacultyPost{FacultyID: f.ID, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(f.ID, f.Email))
	rec := doRequest(t, e, http.MethodDelete, "/api/post/faculty/delete/1", nil)

	assertStatus(t, rec, 200)

	var count int64
	db.Model(&models.FacultyPost{}).Count(&count)
	if count != 0 {
		t.Fatalf("expected post to be deleted, %d remain", count)
	}
}

func TestFacultyPostDelete_NotFound(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.delnf@iit.ac.in")
	e := newPostRouter(db, authAs(f.ID, f.Email))
	rec := doRequest(t, e, http.MethodDelete, "/api/post/faculty/delete/123", nil)
	assertStatus(t, rec, 404)
}

func TestFacultyPostDelete_WrongAuthor(t *testing.T) {
	db := newTestDB(t)
	owner := seedFaculty(t, db, "fac.delowner@iit.ac.in")
	other := seedFaculty(t, db, "fac.delother@iit.ac.in")
	post := models.FacultyPost{FacultyID: owner.ID, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(other.ID, other.Email))
	rec := doRequest(t, e, http.MethodDelete, "/api/post/faculty/delete/1", nil)

	assertStatus(t, rec, 403)
}

func TestFacultyPostDelete_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodDelete, "/api/post/faculty/delete/1", nil)
	assertStatus(t, rec, 401)
}

// --- GetFacultyPosts --------------------------------------------------------

func TestGetFacultyPosts_Success(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.get@iit.ac.in")
	db.Create(&models.FacultyPost{FacultyID: f.ID, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "a", Description: "d"})
	db.Create(&models.FacultyPost{FacultyID: f.ID, Place: models.PlaceResidential, TypeOfPost: models.TypeElectrical, Title: "b", Description: "d"})

	e := newPostRouter(db, authAs(f.ID, f.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/post/faculty", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	posts, ok := out["posts"].([]any)
	if !ok || len(posts) != 2 {
		t.Fatalf("expected 2 posts in response, got %v", out["posts"])
	}
}

func TestGetFacultyPosts_OnlyOwn(t *testing.T) {
	db := newTestDB(t)
	mine := seedFaculty(t, db, "fac.mine@iit.ac.in")
	theirs := seedFaculty(t, db, "fac.theirs@iit.ac.in")
	db.Create(&models.FacultyPost{FacultyID: mine.ID, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "mine", Description: "d"})
	db.Create(&models.FacultyPost{FacultyID: theirs.ID, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "theirs", Description: "d"})

	e := newPostRouter(db, authAs(mine.ID, mine.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/post/faculty", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	posts := out["posts"].([]any)
	if len(posts) != 1 {
		t.Fatalf("expected only the caller's 1 post, got %d", len(posts))
	}
}

func TestGetFacultyPosts_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/post/faculty", nil)
	assertStatus(t, rec, 401)
}
