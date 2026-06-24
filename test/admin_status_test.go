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

func TestAdminWardenPostStatus_TransitionAudits(t *testing.T) {
	db := newTestDB(t)
	jeAdmin := seedAdmin(t, db, "je.civil@iit.ac.in", models.TypeJECivil)
	aeAdmin := seedAdmin(t, db, "ae.civil@iit.ac.in", models.TypeAECivil)
	xenAdmin := seedAdmin(t, db, "xen.civil@iit.ac.in", models.TypeXENCivil)
	w := seedWarden(t, db, "war.status2@iit.ac.in")

	post := models.WardenPost{
		WardenID:   w.ID,
		RoomNumber: "A-2",
		TypeOfPost: models.TypeCivil,
		Title:      "Broken tap",
		Description: "Tap is broken",
		Status:     string(handlers.PendingJE),
		StatusAuditLogs: []models.StatusAudit{
			{Event: string(handlers.PendingJE)},
		},
	}
	db.Create(&post)

	// 1. PendingJE -> ResolvedJE (by JE)
	e := newAdminStatusRouter(db, authAs(jeAdmin.ID, jeAdmin.Email))
	body := handlers.AdminReview{
		Review: string(handlers.ResolvedJE),
	}
	rec := doRequest(t, e, http.MethodPatch, "/api/admin/warden_posts/status/1", body)
	assertStatus(t, rec, 200)

	var updated models.WardenPost
	if err := db.First(&updated, post.ID).Error; err != nil {
		t.Fatalf("failed to find updated post: %v", err)
	}
	if updated.Status != string(handlers.ResolvedJE) {
		t.Fatalf("expected status %q, got %q", string(handlers.ResolvedJE), updated.Status)
	}
	if updated.StatusAuditLogs[1].Event != string(handlers.ResolvedJE) {
		t.Fatalf("expected audit event %q, got %q", string(handlers.ResolvedJE), updated.StatusAuditLogs[1].Event)
	}

	// 2. ResolvedJE -> ResolvedAE (by AE)
	e = newAdminStatusRouter(db, authAs(aeAdmin.ID, aeAdmin.Email))
	body = handlers.AdminReview{
		Review: string(handlers.ResolvedAE),
	}
	// We'll recreate the request properly
	rec = doRequest(t, e, http.MethodPatch, "/api/admin/warden_posts/status/1", body)
	assertStatus(t, rec, 200)

	if err := db.First(&updated, post.ID).Error; err != nil {
		t.Fatalf("failed to find updated post: %v", err)
	}
	if updated.Status != string(handlers.ResolvedAE) {
		t.Fatalf("expected status %q, got %q", string(handlers.ResolvedAE), updated.Status)
	}
	if updated.StatusAuditLogs[2].Event != string(handlers.ResolvedAE) {
		t.Fatalf("expected audit event %q, got %q", string(handlers.ResolvedAE), updated.StatusAuditLogs[2].Event)
	}

	// 3. Set to ResolvedAll (by XEN)
	e = newAdminStatusRouter(db, authAs(xenAdmin.ID, xenAdmin.Email))
	body = handlers.AdminReview{
		Review: string(handlers.ResolvedAll),
	}
	rec = doRequest(t, e, http.MethodPatch, "/api/admin/warden_posts/status/1", body)
	assertStatus(t, rec, 200)

	if err := db.First(&updated, post.ID).Error; err != nil {
		t.Fatalf("failed to find updated post: %v", err)
	}
	if updated.Status != string(handlers.ResolvedAll) {
		t.Fatalf("expected status %q, got %q", string(handlers.ResolvedAll), updated.Status)
	}
	if updated.StatusAuditLogs[3].Event != string(handlers.ResolvedAll) {
		t.Fatalf("expected audit event %q, got %q", string(handlers.ResolvedAll), updated.StatusAuditLogs[3].Event)
	}

	// 4. ResolvedAll -> PendingXEN (reopen by XEN)
	body = handlers.AdminReview{
		Review: string(handlers.PendingXEN),
	}
	rec = doRequest(t, e, http.MethodPatch, "/api/admin/warden_posts/status/1", body)
	assertStatus(t, rec, 200)

	if err := db.First(&updated, post.ID).Error; err != nil {
		t.Fatalf("failed to find updated post: %v", err)
	}
	if updated.Status != string(handlers.PendingXEN) {
		t.Fatalf("expected status %q, got %q", string(handlers.PendingXEN), updated.Status)
	}
	if updated.StatusAuditLogs[4].Event != string(handlers.PendingXEN) {
		t.Fatalf("expected audit event %q, got %q", string(handlers.PendingXEN), updated.StatusAuditLogs[4].Event)
	}
}

func TestAdminCentreheadPostStatus_TransitionAudits(t *testing.T) {
	db := newTestDB(t)
	jeAdmin := seedAdmin(t, db, "je.civil@iit.ac.in", models.TypeJECivil)
	aeAdmin := seedAdmin(t, db, "ae.civil@iit.ac.in", models.TypeAECivil)
	xenAdmin := seedAdmin(t, db, "xen.civil@iit.ac.in", models.TypeXENCivil)
	ch := seedCentrehead(t, db, "ch.status2@iit.ac.in")

	post := models.CentreheadPost{
		CentreheadID: ch.ID,
		TypeOfPost:   models.TypeCivil,
		Title:        "Broken door",
		Description:  "Door is broken",
		Status:       string(handlers.PendingJE),
		StatusAuditLogs: []models.StatusAudit{
			{Event: string(handlers.PendingJE)},
		},
	}
	db.Create(&post)

	// 1. PendingJE -> ResolvedJE (by JE)
	e := newAdminStatusRouter(db, authAs(jeAdmin.ID, jeAdmin.Email))
	body := handlers.AdminReview{
		Review: string(handlers.ResolvedJE),
	}
	rec := doRequest(t, e, http.MethodPatch, "/api/admin/centrehead_posts/status/1", body)
	assertStatus(t, rec, 200)

	var updated models.CentreheadPost
	if err := db.First(&updated, post.ID).Error; err != nil {
		t.Fatalf("failed to find updated post: %v", err)
	}
	if updated.Status != string(handlers.ResolvedJE) {
		t.Fatalf("expected status %q, got %q", string(handlers.ResolvedJE), updated.Status)
	}
	if updated.StatusAuditLogs[1].Event != string(handlers.ResolvedJE) {
		t.Fatalf("expected audit event %q, got %q", string(handlers.ResolvedJE), updated.StatusAuditLogs[1].Event)
	}

	// 2. ResolvedJE -> ResolvedAE (by AE)
	e = newAdminStatusRouter(db, authAs(aeAdmin.ID, aeAdmin.Email))
	body = handlers.AdminReview{
		Review: string(handlers.ResolvedAE),
	}
	rec = doRequest(t, e, http.MethodPatch, "/api/admin/centrehead_posts/status/1", body)
	assertStatus(t, rec, 200)

	if err := db.First(&updated, post.ID).Error; err != nil {
		t.Fatalf("failed to find updated post: %v", err)
	}
	if updated.Status != string(handlers.ResolvedAE) {
		t.Fatalf("expected status %q, got %q", string(handlers.ResolvedAE), updated.Status)
	}
	if updated.StatusAuditLogs[2].Event != string(handlers.ResolvedAE) {
		t.Fatalf("expected audit event %q, got %q", string(handlers.ResolvedAE), updated.StatusAuditLogs[2].Event)
	}

	// 3. Set to ResolvedAll (by XEN)
	e = newAdminStatusRouter(db, authAs(xenAdmin.ID, xenAdmin.Email))
	body = handlers.AdminReview{
		Review: string(handlers.ResolvedAll),
	}
	rec = doRequest(t, e, http.MethodPatch, "/api/admin/centrehead_posts/status/1", body)
	assertStatus(t, rec, 200)

	if err := db.First(&updated, post.ID).Error; err != nil {
		t.Fatalf("failed to find updated post: %v", err)
	}
	if updated.Status != string(handlers.ResolvedAll) {
		t.Fatalf("expected status %q, got %q", string(handlers.ResolvedAll), updated.Status)
	}
	if updated.StatusAuditLogs[3].Event != string(handlers.ResolvedAll) {
		t.Fatalf("expected audit event %q, got %q", string(handlers.ResolvedAll), updated.StatusAuditLogs[3].Event)
	}

	// 4. ResolvedAll -> PendingXEN (reopen by XEN)
	body = handlers.AdminReview{
		Review: string(handlers.PendingXEN),
	}
	rec = doRequest(t, e, http.MethodPatch, "/api/admin/centrehead_posts/status/1", body)
	assertStatus(t, rec, 200)

	if err := db.First(&updated, post.ID).Error; err != nil {
		t.Fatalf("failed to find updated post: %v", err)
	}
	if updated.Status != string(handlers.PendingXEN) {
		t.Fatalf("expected status %q, got %q", string(handlers.PendingXEN), updated.Status)
	}
	if updated.StatusAuditLogs[4].Event != string(handlers.PendingXEN) {
		t.Fatalf("expected audit event %q, got %q", string(handlers.PendingXEN), updated.StatusAuditLogs[4].Event)
	}
}

