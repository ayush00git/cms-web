package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/models"
)

// Tests for the post-author comment APIs: FacultyPostComment,
// WardenPostComment and CentreheadPostComment. These let the author of a post
// comment on their own post; non-authors are rejected.

// --- FacultyPostComment -----------------------------------------------------

func TestFacultyPostComment_Success(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.cmt@iit.ac.in")
	post := models.FacultyPost{FacultyID: f.ID, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(f.ID, f.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/faculty/comment/1", handlers.CommentType{Content: "my issue persists"})
	assertStatus(t, rec, 201)

	var doc models.Comment
	if err := db.Where("commentable_type = ? AND commentable_id = ?", "faculty_posts", post.ID).Take(&doc).Error; err != nil {
		t.Fatalf("expected comment to be persisted: %v", err)
	}
	if doc.Content != "my issue persists" {
		t.Fatalf("expected content %q, got %q", "my issue persists", doc.Content)
	}
	if doc.Email != f.Email {
		t.Fatalf("expected email %q, got %q", f.Email, doc.Email)
	}
	if doc.Role != "faculty" {
		t.Fatalf("expected role %q, got %q", "faculty", doc.Role)
	}
}

func TestFacultyPostComment_NotAuthor(t *testing.T) {
	db := newTestDB(t)
	owner := seedFaculty(t, db, "fac.owner@iit.ac.in")
	other := seedFaculty(t, db, "fac.other@iit.ac.in")
	post := models.FacultyPost{FacultyID: owner.ID, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(other.ID, other.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/faculty/comment/1", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 403)
}

func TestFacultyPostComment_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, authAs(999, "ghost@iit.ac.in"))
	rec := doRequest(t, e, http.MethodPost, "/api/post/faculty/comment/1", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 404)
}

func TestFacultyPostComment_PostNotFound(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.pnf@iit.ac.in")
	e := newPostRouter(db, authAs(f.ID, f.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/faculty/comment/9999", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 404)
}

func TestFacultyPostComment_BadPostID(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.badpid@iit.ac.in")
	e := newPostRouter(db, authAs(f.ID, f.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/faculty/comment/not-a-number", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 500)
}

func TestFacultyPostComment_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.badbody@iit.ac.in")
	post := models.FacultyPost{FacultyID: f.ID, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(f.ID, f.Email))
	rec := doRequestRaw(t, e, http.MethodPost, "/api/post/faculty/comment/1", "{not json")
	assertStatus(t, rec, 400)
}

// --- WardenPostComment ------------------------------------------------------

func TestWardenPostComment_Success(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.cmt@iit.ac.in")
	post := models.WardenPost{WardenID: w.ID, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/warden/comment/1", handlers.CommentType{Content: "still broken"})
	assertStatus(t, rec, 201)

	var doc models.Comment
	if err := db.Where("commentable_type = ? AND commentable_id = ?", "warden_posts", post.ID).Take(&doc).Error; err != nil {
		t.Fatalf("expected comment to be persisted: %v", err)
	}
	if doc.Content != "still broken" {
		t.Fatalf("expected content %q, got %q", "still broken", doc.Content)
	}
	if doc.Email != w.Email {
		t.Fatalf("expected email %q, got %q", w.Email, doc.Email)
	}
	if doc.Role != "warden" {
		t.Fatalf("expected role %q, got %q", "warden", doc.Role)
	}
}

func TestWardenPostComment_NotAuthor(t *testing.T) {
	db := newTestDB(t)
	owner := seedWarden(t, db, "war.owner@iit.ac.in")
	other := seedWarden(t, db, "war.other@iit.ac.in")
	post := models.WardenPost{WardenID: owner.ID, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(other.ID, other.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/warden/comment/1", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 403)
}

func TestWardenPostComment_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, authAs(999, "ghost@iit.ac.in"))
	rec := doRequest(t, e, http.MethodPost, "/api/post/warden/comment/1", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 404)
}

func TestWardenPostComment_PostNotFound(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.pnf@iit.ac.in")
	e := newPostRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/warden/comment/9999", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 404)
}

func TestWardenPostComment_BadPostID(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.badpid@iit.ac.in")
	e := newPostRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/warden/comment/not-a-number", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 500)
}

func TestWardenPostComment_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.badbody@iit.ac.in")
	post := models.WardenPost{WardenID: w.ID, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(w.ID, w.Email))
	rec := doRequestRaw(t, e, http.MethodPost, "/api/post/warden/comment/1", "{not json")
	assertStatus(t, rec, 400)
}

// --- CentreheadPostComment --------------------------------------------------

func TestCentreheadPostComment_Success(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.cmt@iit.ac.in")
	post := models.CentreheadPost{CentreheadID: ch.ID, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/centrehead/comment/1", handlers.CommentType{Content: "needs urgent fix"})
	assertStatus(t, rec, 201)

	var doc models.Comment
	if err := db.Where("commentable_type = ? AND commentable_id = ?", "centrehead_posts", post.ID).Take(&doc).Error; err != nil {
		t.Fatalf("expected comment to be persisted: %v", err)
	}
	if doc.Content != "needs urgent fix" {
		t.Fatalf("expected content %q, got %q", "needs urgent fix", doc.Content)
	}
	if doc.Email != ch.Email {
		t.Fatalf("expected email %q, got %q", ch.Email, doc.Email)
	}
	if doc.Role != "centrehead" {
		t.Fatalf("expected role %q, got %q", "centrehead", doc.Role)
	}
}

func TestCentreheadPostComment_NotAuthor(t *testing.T) {
	db := newTestDB(t)
	owner := seedCentrehead(t, db, "ch.owner@iit.ac.in")
	other := seedCentrehead(t, db, "ch.other@iit.ac.in")
	post := models.CentreheadPost{CentreheadID: owner.ID, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(other.ID, other.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/centrehead/comment/1", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 403)
}

func TestCentreheadPostComment_UserNotFound(t *testing.T) {
	db := newTestDB(t)
	e := newPostRouter(db, authAs(999, "ghost@iit.ac.in"))
	rec := doRequest(t, e, http.MethodPost, "/api/post/centrehead/comment/1", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 404)
}

func TestCentreheadPostComment_PostNotFound(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.pnf@iit.ac.in")
	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/centrehead/comment/9999", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 404)
}

func TestCentreheadPostComment_BadPostID(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.badpid@iit.ac.in")
	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/post/centrehead/comment/not-a-number", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 500)
}

func TestCentreheadPostComment_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	ch := seedCentrehead(t, db, "ch.badbody@iit.ac.in")
	post := models.CentreheadPost{CentreheadID: ch.ID, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newPostRouter(db, authAs(ch.ID, ch.Email))
	rec := doRequestRaw(t, e, http.MethodPost, "/api/post/centrehead/comment/1", "{not json")
	assertStatus(t, rec, 400)
}
