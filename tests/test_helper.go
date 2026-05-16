package tests

import (
	"github.com/ayush00git/cms-web/handlers"
	"github.com/ayush00git/cms-web/models"
	"github.com/ayush00git/cms-web/routes"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func SetupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(
		&models.Admin{},
		&models.Faculty{},
		&models.Warden{},
		&models.CentreHead{},
		&models.FacultyPost{},
		&models.WardenPost{},
		&models.CentreHeadPost{},
		&models.Comment{},
	)

	return db
}

func SetupTestRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	authHandler := &handlers.AuthHandler{DB: db}
	postHandler := &handlers.PostHandler{DB: db}

	routes.AuthRoute(r, authHandler)
	routes.PostRoute(r, postHandler)

	return r
}
