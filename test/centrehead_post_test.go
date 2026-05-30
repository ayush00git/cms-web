package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"
)

// --- CentreheadPost (create) ------------------------------------------------

func TestCentreheadPost_Create_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.create@iit.ac.in")
	e := newPostRouter(db, authAs(ch.ID, ch.Email))

	body := map[string]any{
		"type_of_post": "Civil",
		"title":        "Broken door",
		"description":  "Main entrance door of LHC is jammed",
	}
	rec := doRequest(t, e, http.MethodPost, "/api/post/centrehead", body)

	assertStatus(t, rec, 201)

	var count int64
	db.Model(&models.CentreheadPost{}).Where("centrehead_id = ?", ch.ID).Count(&count)
	if count != 1 {
		t.Fatalf("expected 1 persisted post, got %d", count)
	}
}

func TestCentreheadPost_Create_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	body := map[string]any{"type_of_post": "Civil", "title": "x", "description": "y"}
	rec := doRequest(t, e, http.MethodPost, "/api/post/centrehead", body)
	assertStatus(t, rec, 401)
}

func TestCentreheadPost_Create_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.badbody@iit.ac.in")
	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/centrehead", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestCentreheadPost_Create_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, authAs(999, "ghost.ch@iit.ac.in"))
	body := map[string]any{"type_of_post": "Civil", "title": "x", "description": "y"}
	rec := doRequest(t, e, http.MethodPost, "/api/post/centrehead", body)
	assertStatus(t, rec, 401)
}

// --- CentreheadPostEdit -----------------------------------------------------

func TestCentreheadPostEdit_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.edit@iit.ac.in")
	post := models.CentreheadPost{CentreheadID: ch.ID, TypeOfPost: models.TypeCivil, Title: "old", Description: "old"}
	db.Create(&post)

	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/post/centrehead/edit/1", map[string]any{
		"title":       "new title",
		"description": "new desc",
	})

	assertStatus(t, rec, 200)

	var updated models.CentreheadPost
	db.First(&updated, post.ID)
	if updated.Title != "new title" {
		t.Fatalf("expected title updated, got %q", updated.Title)
	}
}

func TestCentreheadPostEdit_NotFound(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.editnf@iit.ac.in")
	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/post/centrehead/edit/999", map[string]any{"title": "x"})
	assertStatus(t, rec, 404)
}

func TestCentreheadPostEdit_WrongAuthor(t *testing.T) {
	db := newTestDB(t)
	owner := seedCentrehead(t, db, "ch.owner@iit.ac.in")
	other := seedCentrehead(t, db, "ch.other@iit.ac.in")
	post := models.CentreheadPost{CentreheadID: owner.ID, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(other.ID, other.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/post/centrehead/edit/1", map[string]any{"title": "hijack"})
	assertStatus(t, rec, 403)
}

func TestCentreheadPostEdit_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/post/centrehead/edit/1", map[string]any{"title": "x"})
	assertStatus(t, rec, 401)
}

// --- CentreheadPostDelete ---------------------------------------------------

func TestCentreheadPostDelete_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.del@iit.ac.in")
	post := models.CentreheadPost{CentreheadID: ch.ID, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodDelete, "/api/post/centrehead/delete/1", nil)

	assertStatus(t, rec, 200)

	var count int64
	db.Model(&models.CentreheadPost{}).Count(&count)
	if count != 0 {
		t.Fatalf("expected post deleted, %d remain", count)
	}
}

func TestCentreheadPostDelete_NotFound(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.delnf@iit.ac.in")
	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodDelete, "/api/post/centrehead/delete/77", nil)
	assertStatus(t, rec, 404)
}

func TestCentreheadPostDelete_WrongAuthor(t *testing.T) {
	db := newTestDB(t)
	owner := seedCentrehead(t, db, "ch.delowner@iit.ac.in")
	other := seedCentrehead(t, db, "ch.delother@iit.ac.in")
	post := models.CentreheadPost{CentreheadID: owner.ID, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(other.ID, other.Email))
	rec := doRequest(t, e, http.MethodDelete, "/api/post/centrehead/delete/1", nil)
	assertStatus(t, rec, 403)
}

func TestCentreheadPostDelete_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodDelete, "/api/post/centrehead/delete/1", nil)
	assertStatus(t, rec, 401)
}

// --- GetCentreheadPosts -----------------------------------------------------

func TestGetCentreheadPosts_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.get@iit.ac.in")
	db.Create(&models.CentreheadPost{CentreheadID: ch.ID, TypeOfPost: models.TypeCivil, Title: "a", Description: "d"})
	db.Create(&models.CentreheadPost{CentreheadID: ch.ID, TypeOfPost: models.TypeElectrical, Title: "b", Description: "d"})

	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/post/centrehead", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	posts, ok := out["posts"].([]any)
	if !ok || len(posts) != 2 {
		t.Fatalf("expected 2 posts, got %v", out["posts"])
	}
}

func TestGetCentreheadPosts_OnlyOwn(t *testing.T) {
	db := newTestDB(t)
	mine := seedCentrehead(t, db, "ch.mine@iit.ac.in")
	theirs := seedCentrehead(t, db, "ch.theirs@iit.ac.in")
	db.Create(&models.CentreheadPost{CentreheadID: mine.ID, TypeOfPost: models.TypeCivil, Title: "mine", Description: "d"})
	db.Create(&models.CentreheadPost{CentreheadID: theirs.ID, TypeOfPost: models.TypeCivil, Title: "theirs", Description: "d"})

	e := newPostRouter(db, authAs(mine.ID, mine.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/post/centrehead", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if posts := out["posts"].([]any); len(posts) != 1 {
		t.Fatalf("expected only the caller's 1 post, got %d", len(posts))
	}
}

func TestGetCentreheadPosts_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/post/centrehead", nil)
	assertStatus(t, rec, 401)
}
