// Package test holds regression tests for the post-related HTTP APIs.
//
// The handlers normally talk to Postgres and rely on the IsAuthenticated
// middleware to inject the caller's identity into the gin context. For tests
// we swap Postgres for an in-memory SQLite database (pure-Go driver, no CGO)
// and replace the JWT middleware with a tiny injector so we can exercise both
// the authenticated and unauthenticated branches deterministically.
package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/helpers"
	"github.com/ayush00git/cms-web/middleware"
	"github.com/ayush00git/cms-web/models"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// testPassword is the cleartext password every seeded user is created with, so
// login/reset tests can authenticate against a known value.
const testPassword = "Password123"

// testPasswordHash is the bcrypt hash of testPassword, computed once at startup
// (MinCost keeps the test suite fast).
var testPasswordHash string

func init() {
	gin.SetMode(gin.TestMode)

	// Several handlers reach into the environment through helpers.GetEnv, which
	// calls log.Fatalf on a missing key and would otherwise kill the test
	// binary. Dummy values let token signing succeed and keep the mailer from
	// aborting the process (the SMTP dial itself still fails harmlessly).
	os.Setenv("JWT_SECRET", "test-secret-key")
	os.Setenv("SENDER_EMAIL", "test@example.com")
	os.Setenv("APP_PASSWORD", "test-app-password")

	hash, err := bcrypt.GenerateFromPassword([]byte(testPassword), bcrypt.MinCost)
	if err != nil {
		panic("failed to hash test password: " + err.Error())
	}
	testPasswordHash = string(hash)
}

// genToken signs a real JWT the way the production handlers expect, for routes
// that read a token from the query string (verify / reset-password).
func genToken(t *testing.T, id uint, email, role string) string {
	t.Helper()
	tok, err := helpers.GenerateToken(id, email, role)
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}
	return tok
}

// newTestDB spins up a fresh in-memory SQLite database with the full schema
// migrated. Each test gets its own isolated database so they can run in any
// order without bleeding state into one another.
func newTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	// Each test gets a uniquely named in-memory database with a shared cache.
	// The unique name keeps tests isolated from one another, while the shared
	// cache keeps the schema alive across gorm's connection pool.
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open in-memory sqlite: %v", err)
	}

	if err := db.AutoMigrate(
		&models.Admin{},
		&models.Faculty{},
		&models.Warden{},
		&models.Centrehead{},
		&models.FacultyPost{},
		&models.WardenPost{},
		&models.CentreheadPost{},
		&models.Comment{},
	); err != nil {
		t.Fatalf("failed to migrate schema: %v", err)
	}

	return db
}

// authAs returns a middleware that injects the given identity into the gin
// context, mimicking what IsAuthenticated does after a valid JWT. Passing an
// empty email yields an "unauthenticated" middleware that injects nothing, so
// handlers hit their access-denied branches.
func authAs(userID uint, email string) gin.HandlerFunc {
	return authAsRole(userID, email, "test")
}

// authAsRole is like authAs but lets the caller pick the role injected into the
// context, which matters for handlers (e.g. UserProfile) that branch on it.
func authAsRole(userID uint, email, role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if email != "" {
			c.Set(middleware.UserIDKey, userID)
			c.Set(middleware.EmailKey, email)
			c.Set(middleware.RoleKey, role)
		}
		c.Next()
	}
}

// noAuth is the convenience middleware for the unauthenticated case.
func noAuth() gin.HandlerFunc {
	return authAs(0, "")
}

// newPostRouter wires up every post route against the PostHandler with the
// supplied auth middleware. It mirrors routes/post.go but lets the test decide
// who (if anyone) is calling.
func newPostRouter(db *gorm.DB, auth gin.HandlerFunc) *gin.Engine {
	e := gin.New()
	h := &handlers.PostHandler{DB: db}

	e.POST("/api/post/faculty", auth, h.FacultyPost)
	e.POST("/api/post/warden", auth, h.WardenPost)
	e.POST("/api/post/centrehead", auth, h.CentreheadPost)

	e.PATCH("/api/post/faculty/edit/:post_id", auth, h.FacultyPostEdit)
	e.PATCH("/api/post/warden/edit/:post_id", auth, h.WardenPostEdit)
	e.PATCH("/api/post/centrehead/edit/:post_id", auth, h.CentreheadPostEdit)

	e.DELETE("/api/post/faculty/delete/:post_id", auth, h.FacultyPostDelete)
	e.DELETE("/api/post/warden/delete/:post_id", auth, h.WardenPostDelete)
	e.DELETE("/api/post/centrehead/delete/:post_id", auth, h.CentreheadPostDelete)

	e.GET("/api/post/faculty", auth, h.GetFacultyPosts)
	e.GET("/api/post/warden", auth, h.GetWardenPosts)
	e.GET("/api/post/centrehead", auth, h.GetCentreheadPosts)

	return e
}

// newAdminRouter wires up the admin read routes against the AdminHandler.
func newAdminRouter(db *gorm.DB, auth gin.HandlerFunc) *gin.Engine {
	e := gin.New()
	h := &handlers.AdminHandler{DB: db}

	e.GET("/api/admin/xen", auth, h.GetXENPosts)
	e.GET("/api/admin/ae", auth, h.GetAEPosts)
	e.GET("/api/admin/je", auth, h.GetJEPosts)
	e.GET("/api/admin/post/:role/:post_id", auth, h.AdminGetPost)

	return e
}

// newAuthRouter wires up the auth/account routes against the AuthHandler,
// mirroring routes/auth.go. The auth middleware is injectable so tests can
// drive the authenticated (UserProfile) and anonymous paths.
func newAuthRouter(db *gorm.DB, auth gin.HandlerFunc) *gin.Engine {
	e := gin.New()
	h := &handlers.AuthHandler{DB: db}

	for _, role := range []string{"faculty", "warden", "centrehead"} {
		g := e.Group("/api/auth/" + role)
		switch role {
		case "faculty":
			g.POST("/signup", h.FacultySignup)
			g.POST("/login", h.FacultyLogin)
			g.POST("/forget-password", h.FacultyForgetPassword)
			g.PATCH("/reset-password", h.FacultyResetPassword)
		case "warden":
			g.POST("/signup", h.WardenSignup)
			g.POST("/login", h.WardenLogin)
			g.POST("/forget-password", h.WardenForgetPassword)
			g.PATCH("/reset-password", h.WardenResetPassword)
		case "centrehead":
			g.POST("/signup", h.CentreheadSignup)
			g.POST("/login", h.CentreheadLogin)
			g.POST("/forget-password", h.CentreheadForgetPassword)
			g.PATCH("/reset-password", h.CentreheadResetPassword)
		}
	}

	e.POST("/api/auth/logout", h.Logout)
	e.GET("/api/auth/verify", h.VerifyAccount)
	e.GET("/api/profile", auth, h.UserProfile)

	return e
}

// newAdminAuthRouter exposes the admin login route against the AdminHandler.
func newAdminAuthRouter(db *gorm.DB) *gin.Engine {
	e := gin.New()
	h := &handlers.AdminHandler{DB: db}
	e.POST("/api/auth/admin/login", h.AdminLogin)
	return e
}

// doRequest performs an HTTP request against the router and returns the
// recorder. body may be nil for requests without a payload.
func doRequest(t *testing.T, e *gin.Engine, method, path string, body any) *httptest.ResponseRecorder {
	t.Helper()

	var reader *bytes.Reader
	if body != nil {
		raw, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("failed to marshal request body: %v", err)
		}
		reader = bytes.NewReader(raw)
	} else {
		reader = bytes.NewReader(nil)
	}

	req := httptest.NewRequest(method, path, reader)
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	return rec
}

// doRequestRaw is like doRequest but sends the body verbatim, letting tests
// drive malformed-JSON branches that ShouldBindJSON should reject.
func doRequestRaw(t *testing.T, e *gin.Engine, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()

	req := httptest.NewRequest(method, path, bytes.NewReader([]byte(body)))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	return rec
}

// decodeBody unmarshals a JSON response body into a generic map for assertions.
func decodeBody(t *testing.T, rec *httptest.ResponseRecorder) map[string]any {
	t.Helper()

	var out map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("failed to decode response body %q: %v", rec.Body.String(), err)
	}
	return out
}

// --- seed helpers -----------------------------------------------------------

func seedFaculty(t *testing.T, db *gorm.DB, email string) models.Faculty {
	t.Helper()
	f := models.Faculty{
		Name:        "Test Faculty",
		Email:       email,
		Password:    testPasswordHash,
		Department:  models.CSE,
		HouseNumber: "12",
		Block:       models.BlockA,
		Type:        models.Type1,
		PhoneNumber: "9999999999",
		IsVerified:  true,
	}
	if err := db.Create(&f).Error; err != nil {
		t.Fatalf("failed to seed faculty: %v", err)
	}
	return f
}

func seedWarden(t *testing.T, db *gorm.DB, email string) models.Warden {
	t.Helper()
	w := models.Warden{
		Email:       email,
		Password:    testPasswordHash,
		Hostel:      models.KBH,
		PhoneNumber: "8888888888",
		IsVerified:  true,
	}
	if err := db.Create(&w).Error; err != nil {
		t.Fatalf("failed to seed warden: %v", err)
	}
	return w
}

func seedCentrehead(t *testing.T, db *gorm.DB, email string) models.Centrehead {
	t.Helper()
	ch := models.Centrehead{
		Email:       email,
		Password:    testPasswordHash,
		Building:    models.LHC,
		PhoneNumber: "7777777777",
		IsVerified:  true,
	}
	if err := db.Create(&ch).Error; err != nil {
		t.Fatalf("failed to seed centre head: %v", err)
	}
	return ch
}

func seedAdmin(t *testing.T, db *gorm.DB, email string, position models.PositionType) models.Admin {
	t.Helper()
	a := models.Admin{
		Email:      email,
		Password:   testPasswordHash,
		Position:   position,
		IsVerified: true,
	}
	if err := db.Create(&a).Error; err != nil {
		t.Fatalf("failed to seed admin: %v", err)
	}
	return a
}

// assertStatus fails the test if the recorder's status code is unexpected.
func assertStatus(t *testing.T, rec *httptest.ResponseRecorder, want int) {
	t.Helper()
	if rec.Code != want {
		t.Fatalf("expected status %d, got %d (body: %s)", want, rec.Code, rec.Body.String())
	}
}

// guard against an unused-import warning for http in files that only import the
// helpers package indirectly.
var _ = http.StatusOK
