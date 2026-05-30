package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// newAdminCommentRouter wires up the AdminPostComment route against the
// AdminHandler, mirroring routes/admin.go. The auth middleware is injectable so
// tests can drive both the authenticated and anonymous paths.
func newAdminCommentRouter(db *gorm.DB, auth gin.HandlerFunc) *gin.Engine {
	e := gin.New()
	h := &handlers.AdminHandler{DB: db}
	e.POST("/api/admin/comment/:type/:id", auth, h.AdminPostComment)
	return e
}

// --- AdminPostComment -------------------------------------------------------

func TestAdminPostComment_Success(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.comment@iit.ac.in", models.TypeXENCivil)
	f := seedFaculty(t, db, "fac.comment@iit.ac.in")
	post := models.FacultyPost{FacultyID: f.ID, Place: models.PlaceDepartmental, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newAdminCommentRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/admin/comment/faculty_posts/1", handlers.CommentType{Content: "looks good"})

	assertStatus(t, rec, 201)

	// The comment should have actually been persisted against the right post.
	var doc models.Comment
	if err := db.Where("commentable_type = ? AND commentable_id = ?", "faculty_posts", post.ID).Take(&doc).Error; err != nil {
		t.Fatalf("expected comment to be persisted: %v", err)
	}
	if doc.Content != "looks good" {
		t.Fatalf("expected content %q, got %q", "looks good", doc.Content)
	}
	if doc.AuthorID != admin.ID {
		t.Fatalf("expected author %d, got %d", admin.ID, doc.AuthorID)
	}
}

func TestAdminPostComment_Warden(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.commentw@iit.ac.in", models.TypeXENCivil)
	w := seedWarden(t, db, "war.comment@iit.ac.in")
	post := models.WardenPost{WardenID: w.ID, RoomNumber: "A-1", TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newAdminCommentRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/admin/comment/warden_posts/1", handlers.CommentType{Content: "noted"})
	assertStatus(t, rec, 201)
}

func TestAdminPostComment_Centrehead(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.commentc@iit.ac.in", models.TypeXENCivil)
	ch := seedCentrehead(t, db, "ch.comment@iit.ac.in")
	post := models.CentreheadPost{CentreheadID: ch.ID, TypeOfPost: models.TypeCivil, Title: "t", Description: "d"}
	db.Create(&post)

	e := newAdminCommentRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/admin/comment/centrehead_posts/1", handlers.CommentType{Content: "noted"})
	assertStatus(t, rec, 201)
}

func TestAdminPostComment_Unauthenticated(t *testing.T) {
	db := newTestDB(t)
	e := newAdminCommentRouter(db, noAuth())
	rec := doRequest(t, e, http.MethodPost, "/api/admin/comment/faculty_posts/1", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 401)
}

func TestAdminPostComment_NotAnAdmin(t *testing.T) {
	db := newTestDB(t)
	// Authenticated email with no matching admin row -> 404 access denied.
	e := newAdminCommentRouter(db, authAs(1, "nobody.comment@iit.ac.in"))
	rec := doRequest(t, e, http.MethodPost, "/api/admin/comment/faculty_posts/1", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 404)
}

func TestAdminPostComment_InvalidBody(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.badbody@iit.ac.in", models.TypeXENCivil)
	e := newAdminCommentRouter(db, authAs(admin.ID, admin.Email))

	// Hand-roll a request with a malformed JSON body so ShouldBindJSON fails.
	rec := doRequestRaw(t, e, http.MethodPost, "/api/admin/comment/faculty_posts/1", "{not json")
	assertStatus(t, rec, 400)
}

func TestAdminPostComment_InvalidPostType(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.badtype@iit.ac.in", models.TypeXENCivil)
	e := newAdminCommentRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/admin/comment/student_posts/1", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 400)
}

func TestAdminPostComment_BadPostID(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.badpid@iit.ac.in", models.TypeXENCivil)
	e := newAdminCommentRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/admin/comment/faculty_posts/not-a-number", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 500)
}

func TestAdminPostComment_PostNotFound(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "admin.pnf@iit.ac.in", models.TypeXENCivil)
	e := newAdminCommentRouter(db, authAs(admin.ID, admin.Email))
	rec := doRequest(t, e, http.MethodPost, "/api/admin/comment/faculty_posts/9999", handlers.CommentType{Content: "x"})
	assertStatus(t, rec, 404)
}
