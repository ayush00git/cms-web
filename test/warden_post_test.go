package test

import (
	"net/http"
	"testing"
	"time"

	"github.com/ayush00git/cms-web/models"
)

// --- WardenPost (create) ----------------------------------------------------

func TestWardenPost_Create_Success(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.create@iit.ac.in")
	e := newPostRouter(db, authAs(w.ID, w.Email))

	body := map[string]any{
		"type_of_post": "Electrical",
		"room_number":  "B-204",
		"title":        "Fan not working",
		"description":  "Ceiling fan dead in B-204",
	}
	rec := doRequest(t, e, http.MethodPost, "/api/post/warden", body)

	assertStatus(t, rec, 201)

	var count int64
	db.Model(&models.WardenPost{}).Where("warden_id = ?", w.ID).Count(&count)
	if count != 1 {
		t.Fatalf("expected 1 persisted post, got %d", count)
	}
}

func TestWardenPost_Create_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	body := map[string]any{"type_of_post": "Civil", "room_number": "1", "title": "x", "description": "y"}
	rec := doRequest(t, e, http.MethodPost, "/api/post/warden", body)
	assertStatus(t, rec, 401)
}

func TestWardenPost_Create_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.badbody@iit.ac.in")
	e := newPostRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/warden", []string{"bad"})
	assertStatus(t, rec, 400)
}

func TestWardenPost_Create_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, authAs(999, "ghost.warden@iit.ac.in"))
	body := map[string]any{"type_of_post": "Civil", "room_number": "1", "title": "x", "description": "y"}
	rec := doRequest(t, e, http.MethodPost, "/api/post/warden", body)
	assertStatus(t, rec, 401)
}

// --- WardenPostEdit ---------------------------------------------------------

func TestWardenPostEdit_Success(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.edit@iit.ac.in")
	post := models.WardenPost{WardenID: w.ID, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "old", Description: "old"}
	db.Create(&post)

	e := newPostRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/post/warden/edit/1", map[string]any{
		"room_number": "A-2",
		"title":       "new title",
	})

	assertStatus(t, rec, 200)

	var updated models.WardenPost
	db.First(&updated, post.ID)
	if updated.Title != "new title" || updated.RoomNumber != "A-2" {
		t.Fatalf("expected post fields updated, got title=%q room=%q", updated.Title, updated.RoomNumber)
	}
}

func TestWardenPostEdit_NotFound(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.editnf@iit.ac.in")
	e := newPostRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/post/warden/edit/999", map[string]any{"title": "x"})
	assertStatus(t, rec, 404)
}

func TestWardenPostEdit_WrongAuthor(t *testing.T) {
	db := newTestDB(t)
	owner := seedWarden(t, db, "war.owner@iit.ac.in")
	other := seedWarden(t, db, "war.other@iit.ac.in")
	post := models.WardenPost{WardenID: owner.ID, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(other.ID, other.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/post/warden/edit/1", map[string]any{"title": "hijack"})
	assertStatus(t, rec, 403)
}

func TestWardenPostEdit_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPatch, "/api/post/warden/edit/1", map[string]any{"title": "x"})
	assertStatus(t, rec, 401)
}

func TestWardenPostEdit_ExpiredWindow(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.expired@iit.ac.in")
	post := models.WardenPost{WardenID: w.ID, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "old", Description: "old"}
	db.Create(&post)
	db.Model(&post).Update("created_at", time.Now().Add(-31*time.Minute))

	e := newPostRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodPatch, "/api/post/warden/edit/1", map[string]any{"title": "new"})
	assertStatus(t, rec, 403)
}

// --- WardenPostDelete -------------------------------------------------------

func TestWardenPostDelete_Success(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.del@iit.ac.in")
	post := models.WardenPost{WardenID: w.ID, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodDelete, "/api/post/warden/delete/1", nil)

	assertStatus(t, rec, 200)

	var count int64
	db.Model(&models.WardenPost{}).Count(&count)
	if count != 0 {
		t.Fatalf("expected post deleted, %d remain", count)
	}
}

func TestWardenPostDelete_NotFound(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.delnf@iit.ac.in")
	e := newPostRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodDelete, "/api/post/warden/delete/55", nil)
	assertStatus(t, rec, 404)
}

func TestWardenPostDelete_WrongAuthor(t *testing.T) {
	db := newTestDB(t)
	owner := seedWarden(t, db, "war.delowner@iit.ac.in")
	other := seedWarden(t, db, "war.delother@iit.ac.in")
	post := models.WardenPost{WardenID: owner.ID, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(other.ID, other.Email))
	rec := doRequest(t, e, http.MethodDelete, "/api/post/warden/delete/1", nil)
	assertStatus(t, rec, 403)
}

func TestWardenPostDelete_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodDelete, "/api/post/warden/delete/1", nil)
	assertStatus(t, rec, 401)
}

// --- GetWardenPosts ---------------------------------------------------------

func TestGetWardenPosts_Success(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.get@iit.ac.in")
	db.Create(&models.WardenPost{WardenID: w.ID, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "a", Description: "d"})
	db.Create(&models.WardenPost{WardenID: w.ID, RoomNumber: "A-2", TypeOfPost: models.TypeElectrical, Title: "b", Description: "d"})

	e := newPostRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/post/warden", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	posts, ok := out["posts"].([]any)
	if !ok || len(posts) != 2 {
		t.Fatalf("expected 2 posts, got %v", out["posts"])
	}
}

func TestGetWardenPosts_OnlyOwn(t *testing.T) {
	db := newTestDB(t)
	mine := seedWarden(t, db, "war.mine@iit.ac.in")
	theirs := seedWarden(t, db, "war.theirs@iit.ac.in")
	db.Create(&models.WardenPost{WardenID: mine.ID, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "mine", Description: "d"})
	db.Create(&models.WardenPost{WardenID: theirs.ID, RoomNumber: "A-2", TypeOfPost: models.TypeCivil, Title: "theirs", Description: "d"})

	e := newPostRouter(db, authAs(mine.ID, mine.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/post/warden", nil)

	assertStatus(t, rec, 200)
	out := decodeBody(t, rec)
	if posts := out["posts"].([]any); len(posts) != 1 {
		t.Fatalf("expected only the caller's 1 post, got %d", len(posts))
	}
}

func TestGetWardenPosts_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodGet, "/api/post/warden", nil)
	assertStatus(t, rec, 401)
}
