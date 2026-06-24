package test

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/models"
)

func TestFacultyPost_GetByID_Success(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.getid@iit.ac.in")
	post := models.FacultyPost{
		FacultyID:   f.ID,
		Place:       models.PlaceDepartmental,
		TypeOfPost:  models.TypeCivil,
		Title:       "Title 1",
		Description: "Desc 1",
	}
	db.Create(&post)

	// Add a comment
	comment := models.Comment{
		CommentableID:   post.ID,
		CommentableType: "faculty_posts",
		Content:         "Hello comment",
		Email:           "staff@iit.ac.in",
		Role:            "admin",
	}
	db.Create(&comment)

	e := newPostRouter(db, authAs(f.ID, f.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/post/faculty/1", nil)

	assertStatus(t, rec, 200)

	var res struct {
		Post models.FacultyPost `json:"post"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if res.Post.ID != post.ID {
		t.Fatalf("expected post ID %d, got %d", post.ID, res.Post.ID)
	}
	if len(res.Post.Comments) != 1 {
		t.Fatalf("expected 1 preloaded comment, got %d", len(res.Post.Comments))
	}
}

func TestWardenPost_GetByID_Success(t *testing.T) {
	db := newTestDB(t)
	w := seedWarden(t, db, "war.getid@iit.ac.in")
	post := models.WardenPost{
		WardenID:    w.ID,
		RoomNumber:  "B-2",
		TypeOfPost:  models.TypeCivil,
		Title:       "Title 2",
		Description: "Desc 2",
	}
	db.Create(&post)

	e := newPostRouter(db, authAs(w.ID, w.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/post/warden/1", nil)

	assertStatus(t, rec, 200)

	var res struct {
		Post models.WardenPost `json:"post"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if res.Post.ID != post.ID {
		t.Fatalf("expected post ID %d, got %d", post.ID, res.Post.ID)
	}
}

func TestFacultyPost_GetByID_NotFound(t *testing.T) {
	db := newTestDB(t)
	f := seedFaculty(t, db, "fac.getidnf@iit.ac.in")

	e := newPostRouter(db, authAs(f.ID, f.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/post/faculty/999", nil)

	assertStatus(t, rec, 404)
}

func TestFacultyPost_GetByID_WrongUser(t *testing.T) {
	db := newTestDB(t)
	f1 := seedFaculty(t, db, "fac1@iit.ac.in")
	f2 := seedFaculty(t, db, "fac2@iit.ac.in")

	post := models.FacultyPost{
		FacultyID:   f1.ID,
		Place:       models.PlaceDepartmental,
		TypeOfPost:  models.TypeCivil,
		Title:       "Title 1",
		Description: "Desc 1",
	}
	db.Create(&post)

	// User 2 tries to access User 1's post
	e := newPostRouter(db, authAs(f2.ID, f2.Email))
	rec := doRequest(t, e, http.MethodGet, "/api/post/faculty/1", nil)

	// Should not find the post as it filters by user ID
	assertStatus(t, rec, 404)
}
