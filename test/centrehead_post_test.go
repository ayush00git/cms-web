package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"
)

// --- CentreHeadPost (create) ------------------------------------------------

func TestCentreHeadPost_Create_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentreHead(t, db, "ch.create@iit.ac.in")
	e := newPostRouter(db, authAs(ch.ID, ch.Email))

	body := map[string]any{
		"type_of_post": "Civil",
		"title":        "Broken door",
		"description":  "Main entrance door of LHC is jammed",
	}
	rec := doRequest(t, e, http.MethodPost, "/api/post/centre_head", body)

	assertStatus(t, rec, 201)

	var count int64
	db.Model(&models.CentreHeadPost{}).Where("centre_head_id = ?", ch.ID).Count(&count)
	if count != 1 {
		t.Fatalf("expected 1 persisted post, got %d", count)
	}
}

func TestCentreHeadPost_Create_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	body := map[string]any{"type_of_post": "Civil", "title": "x", "description": "y"}
	rec := doRequest(t, e, http.MethodPost, "/api/post/centre_head", body)
	assertStatus(t, rec, 401)
}

func TestCentreHeadPost_Create_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentreHead(t, db, "ch.badbody@iit.ac.in")
	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/centre_head", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestCentreHeadPost_Create_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, authAs(999, "ghost.ch@iit.ac.in"))
	body := map[string]any{"type_of_post": "Civil", "title": "x", "description": "y"}
	rec := doRequest(t, e, http.MethodPost, "/api/post/centre_head", body)
	assertStatus(t, rec, 401)
}

// --- CentreHeadPostEdit -----------------------------------------------------

func TestCentreHeadPostEdit_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentreHead(t, db, "ch.edit@iit.ac.in")
	post := models.CentreHeadPost{CentreHeadID: ch.ID, TypeOfPost: models.TypeCivil, Title: "old", Description: "old"}
	db.Create(&post)

	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/post/centre_head/edit/1", map[string]any{
		"title":       "new title",
		"description": "new desc",
	})

	assertStatus(t, rec, 200)

	var updated models.CentreHeadPost
	db.First(&updated, post.ID)
	if updated.Title != "new title" {
		t.Fatalf("expected title updated, got %q", updated.Title)
	}
}

func TestCentreHeadPostEdit_NotFound(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentreHead(t, db, "ch.editnf@iit.ac.in")
	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/post/centre_head/edit/999", map[string]any{"title": "x"})
	assertStatus(t, rec, 404)
}

func TestCentreHeadPostEdit_WrongAuthor(t *testing.T) {
	db := newTestDB(t)
	owner := seedCentreHead(t, db, "ch.owner@iit.ac.in")
	other := seedCentreHead(t, db, "ch.other@iit.ac.in")
	post := models.CentreHeadPost{CentreHeadID: owner.ID, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(other.ID, other.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/post/centre_head/edit/1", map[string]any{"title": "hijack"})
	assertStatus(t, rec, 403)
}

func TestCentreHeadPostEdit_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/post/centre_head/edit/1", map[string]any{"title": "x"})
	assertStatus(t, rec, 401)
}

// --- CentreHeadPostDelete ---------------------------------------------------

func TestCentreHeadPostDelete_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentreHead(t, db, "ch.del@iit.ac.in")
	post := models.CentreHeadPost{CentreHeadID: ch.ID, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodDelete, "/api/post/centre_head/delete/1", nil)

	assertStatus(t, rec, 200)

	var count int64
	db.Model(&models.CentreHeadPost{}).Count(&count)
	if count != 0 {
		t.Fatalf("expected post deleted, %d remain", count)
	}
}

func TestCentreHeadPostDelete_NotFound(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentreHead(t, db, "ch.delnf@iit.ac.in")
	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodDelete, "/api/post/centre_head/delete/77", nil)
	assertStatus(t, rec, 404)
}

func TestCentreHeadPostDelete_WrongAuthor(t *testing.T) {
	db := newTestDB(t)
	owner := seedCentreHead(t, db, "ch.delowner@iit.ac.in")
	other := seedCentreHead(t, db, "ch.delother@iit.ac.in")
	post := models.CentreHeadPost{CentreHeadID: owner.ID, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(other.ID, other.Email))
	rec := doRequest(t, e, http.MethodDelete, "/api/post/centre_head/delete/1", nil)
	assertStatus(t, rec, 403)
}

func TestCentreHeadPostDelete_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodDelete, "/api/post/centre_head/delete/1", nil)
	assertStatus(t, rec, 401)
}

// --- GetCentreHeadPosts -----------------------------------------------------

func TestGetCentreHeadPosts_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentreHead(t, db, "ch.get@iit.ac.in")
	db.Create(&models.CentreHeadPost{CentreHeadID: ch.ID, TypeOfPost: models.TypeCivil, Title: "a", Description: "d"})
	db.Create(&models.CentreHeadPost{CentreHeadID: ch.ID, TypeOfPost: models.TypeElectrical, Title: "b", Description: "d"})

	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/post/centre_head", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	posts, ok := out["posts"].([]any)
	if !ok || len(posts) != 2 {
		t.Fatalf("expected 2 posts, got %v", out["posts"])
	}
}

func TestGetCentreHeadPosts_OnlyOwn(t *testing.T) {
	db := newTestDB(t)
	mine := seedCentreHead(t, db, "ch.mine@iit.ac.in")
	theirs := seedCentreHead(t, db, "ch.theirs@iit.ac.in")
	db.Create(&models.CentreHeadPost{CentreHeadID: mine.ID, TypeOfPost: models.TypeCivil, Title: "mine", Description: "d"})
	db.Create(&models.CentreHeadPost{CentreHeadID: theirs.ID, TypeOfPost: models.TypeCivil, Title: "theirs", Description: "d"})

	e := newPostRouter(db, authAs(mine.ID, mine.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/post/centre_head", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if posts := out["posts"].([]any); len(posts) != 1 {
		t.Fatalf("expected only the caller's 1 post, got %d", len(posts))
	}
}

func TestGetCentreHeadPosts_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/post/centre_head", nil)
	assertStatus(t, rec, 401)
}
