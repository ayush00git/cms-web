package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/ayush00git/cms-web/models"
	"github.com/stretchr/testify/assert"
)

func TestPostWorkflow(t *testing.T) {
	db := SetupTestDB()
	router := SetupTestRouter(db)

	var facultyPostID uint

	t.Run("Faculty Report Post", func(t *testing.T) {
		postData := map[string]interface{}{
			"faculty_id":   1,
			"place":        "Departmental",
			"type_of_post": "Civil",
			"title":        "Leaking Pipe",
			"description":  "The pipe in CSE lab is leaking.",
		}
		body, _ := json.Marshal(postData)
		req, _ := http.NewRequest("POST", "/faculty/post/report", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		
		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		post := resp["post"].(map[string]interface{})
		facultyPostID = uint(post["ID"].(float64))
	})

	t.Run("XEN Pass Post to AE", func(t *testing.T) {
		updateData := map[string]interface{}{
			"source":   "Faculty",
			"post_id":  facultyPostID,
			"action":   "pass",
			"comment":  "Forwarding to AE for technical review",
			"admin_id": 1,
		}
		body, _ := json.Marshal(updateData)
		req, _ := http.NewRequest("POST", "/admin/xen/post/status", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var post models.FacultyPost
		db.First(&post, facultyPostID)
		assert.Equal(t, models.StatusPendingAE, post.Status)
		assert.Equal(t, models.StageAE, post.Stage)
	})

	t.Run("AE Pass Post to JE", func(t *testing.T) {
		updateData := map[string]interface{}{
			"source":        "Faculty",
			"post_id":       facultyPostID,
			"action":        "pass",
			"comment":       "Assigning to JE Sharma",
			"select_je_id":  10,
			"admin_id":      2,
		}
		body, _ := json.Marshal(updateData)
		req, _ := http.NewRequest("POST", "/admin/ae/post/status", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var post models.FacultyPost
		db.First(&post, facultyPostID)
		assert.Equal(t, models.StatusPendingJE, post.Status)
		assert.Equal(t, models.StageJE, post.Stage)
		assert.Equal(t, uint(10), *post.AssignedJE_ID)
	})

	t.Run("JE Resolve Post", func(t *testing.T) {
		updateData := map[string]interface{}{
			"source":   "Faculty",
			"post_id":  facultyPostID,
			"action":   "resolve",
			"comment":  "Fixed the leak.",
			"admin_id": 10,
		}
		body, _ := json.Marshal(updateData)
		req, _ := http.NewRequest("POST", "/admin/je/post/status", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var post models.FacultyPost
		db.First(&post, facultyPostID)
		assert.Equal(t, models.StatusResolved, post.Status)
	})

	t.Run("Public Dashboard", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/posts/public", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		
		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NotNil(t, resp["faculty_posts"])
	})
}
