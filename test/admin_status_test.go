package test

import (
	"net/http"
	"testing"

	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func newAdminStatusRouter(db *gorm.DB, auth gin.HandlerFunc) *gin.Engine {
	e := gin.New()
	h := &handlers.AdminHandler{DB: db}
	e.PATCH("/api/admin/faculty_posts/status/:post_id", auth, h.AdminFacultyPostStatus)
	e.PATCH("/api/admin/warden_posts/status/:post_id", auth, h.AdminWardenPostStatus)
	e.PATCH("/api/admin/centrehead_posts/status/:post_id", auth, h.AdminCentreheadPostStatus)
	return e
}

func TestAdminFacultyPostStatus_AuditLogs(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "xen.civil@iit.ac.in", models.TypeXENCivil)
	f := seedFaculty(t, db, "fac.status@iit.ac.in")

	post := models.FacultyPost{
		FacultyID:  f.ID,
		Place:      models.PlaceDepartmental,
		TypeOfPost: models.TypeCivil,
		Title:      "Leaking roof",
		Description: "Leaks a lot",
		Status:     string(handlers.PendingXEN),
		StatusAuditLogs: []models.StatusAudit{
			{Event: string(handlers.PendingXEN)},
		},
	}
	db.Create(&post)

	e := newAdminStatusRouter(db, authAs(admin.ID, admin.Email))
	body := handlers.AdminReview{
		Review: string(handlers.PendingAE),
	}
	rec := doRequest(t, e, http.MethodPatch, "/api/admin/faculty_posts/status/1", body)
	assertStatus(t, rec, 200)

	var updated models.FacultyPost
	if err := db.Preload("Comments").First(&updated, post.ID).Error; err != nil {
		t.Fatalf("failed to find updated post: %v", err)
	}

	if updated.Status != string(handlers.PendingAE) {
		t.Fatalf("expected status %q, got %q", string(handlers.PendingAE), updated.Status)
	}

	if len(updated.StatusAuditLogs) != 2 {
		t.Fatalf("expected 2 audit logs, got %d", len(updated.StatusAuditLogs))
	}

	if updated.StatusAuditLogs[1].Event != string(handlers.PendingAE) {
		t.Fatalf("expected event %q, got %q", string(handlers.PendingAE), updated.StatusAuditLogs[1].Event)
	}

	if updated.StatusAuditLogs[1].TimeStamp.IsZero() {
		t.Fatal("expected non-zero timestamp for the second audit log")
	}
}

func TestAdminWardenPostStatus_AuditLogs(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "xen.civil@iit.ac.in", models.TypeXENCivil)
	w := seedWarden(t, db, "war.status@iit.ac.in")

	post := models.WardenPost{
		WardenID:   w.ID,
		RoomNumber: "A-1",
		TypeOfPost: models.TypeCivil,
		Title:      "Broken lock",
		Description: "Lock is broken",
		Status:     string(handlers.PendingXEN),
		StatusAuditLogs: []models.StatusAudit{
			{Event: string(handlers.PendingXEN)},
		},
	}
	db.Create(&post)

	e := newAdminStatusRouter(db, authAs(admin.ID, admin.Email))
	body := handlers.AdminReview{
		Review: string(handlers.PendingAE),
	}
	rec := doRequest(t, e, http.MethodPatch, "/api/admin/warden_posts/status/1", body)
	assertStatus(t, rec, 200)

	var updated models.WardenPost
	if err := db.First(&updated, post.ID).Error; err != nil {
		t.Fatalf("failed to find updated post: %v", err)
	}

	if updated.Status != string(handlers.PendingAE) {
		t.Fatalf("expected status %q, got %q", string(handlers.PendingAE), updated.Status)
	}

	if len(updated.StatusAuditLogs) != 2 {
		t.Fatalf("expected 2 audit logs, got %d", len(updated.StatusAuditLogs))
	}

	if updated.StatusAuditLogs[1].Event != string(handlers.PendingAE) {
		t.Fatalf("expected event %q, got %q", string(handlers.PendingAE), updated.StatusAuditLogs[1].Event)
	}

	if updated.StatusAuditLogs[1].TimeStamp.IsZero() {
		t.Fatal("expected non-zero timestamp for the second audit log")
	}
}

func TestAdminCentreheadPostStatus_AuditLogs(t *testing.T) {
	db := newTestDB(t)
	admin := seedAdmin(t, db, "xen.civil@iit.ac.in", models.TypeXENCivil)
	ch := seedCentrehead(t, db, "ch.status@iit.ac.in")

	post := models.CentreheadPost{
		CentreheadID: ch.ID,
		TypeOfPost:   models.TypeCivil,
		Title:        "AC not working",
		Description:  "AC is down",
		Status:       string(handlers.PendingXEN),
		StatusAuditLogs: []models.StatusAudit{
			{Event: string(handlers.PendingXEN)},
		},
	}
	db.Create(&post)

	e := newAdminStatusRouter(db, authAs(admin.ID, admin.Email))
	body := handlers.AdminReview{
		Review: string(handlers.PendingAE),
	}
	rec := doRequest(t, e, http.MethodPatch, "/api/admin/centrehead_posts/status/1", body)
	assertStatus(t, rec, 200)

	var updated models.CentreheadPost
	if err := db.First(&updated, post.ID).Error; err != nil {
		t.Fatalf("failed to find updated post: %v", err)
	}

	if updated.Status != string(handlers.PendingAE) {
		t.Fatalf("expected status %q, got %q", string(handlers.PendingAE), updated.Status)
	}

	if len(updated.StatusAuditLogs) != 2 {
		t.Fatalf("expected 2 audit logs, got %d", len(updated.StatusAuditLogs))
	}

	if updated.StatusAuditLogs[1].Event != string(handlers.PendingAE) {
		t.Fatalf("expected event %q, got %q", string(handlers.PendingAE), updated.StatusAuditLogs[1].Event)
	}

	if updated.StatusAuditLogs[1].TimeStamp.IsZero() {
		t.Fatal("expected non-zero timestamp for the second audit log")
	}
}
