package models

import (
	"time"
)

type PostSource string
const (
	SourceFaculty    PostSource = "Faculty"
	SourceWarden     PostSource = "Warden"
	SourceCentreHead PostSource = "CentreHead"
)

type PostPlace string
const (
	PlaceResidential  PostPlace = "Residential"
	PlaceDepartmental PostPlace = "Departmental"
)

type PostType string
const (
	TypeCivil      PostType = "Civil"
	TypeElectrical PostType = "Electrical"
)

type PostStatus string
const (
	StatusPendingXEN PostStatus = "Pending_XEN" // default to open post
	StatusPendingAE  PostStatus = "Pending_AE"
	StatusPendingJE  PostStatus = "Pending_JE"
	StatusResolvedJE  PostStatus = "Resolved_JE"
	StatusResolved   PostStatus = "Resolved"
	StatusRejected   PostStatus = "Closed"
)

type PostStage string
const (
	StageXEN PostStage = "XEN"
	StageAE  PostStage = "AE"
	StageJE  PostStage = "JE"
)

type FacultyPost struct {
	ID              uint            `gorm:"primaryKey;autoIncrement" json:"id"`
	FacultyID       uint        	`gorm:"not null" json:"faculty_id"`
	Author			Faculty			`gorm:"foreignKey:FacultyID"`
	Place           PostPlace  	    `gorm:"type:varchar(20);not null" json:"place" binding:"required"`
	TypeOfPost 	    PostType   	    `gorm:"type:varchar(20);not null" json:"type_of_post" binding:"required"`
	Title           string          `gorm:"type:varchar(50);not null" json:"title" binding:"required"`
	Description     string          `gorm:"type:text;not null" json:"description" binding:"required"`
	Status          PostStatus 	    `gorm:"type:varchar(20);not null;default:'Pending_XEN'" json:"status"`
	Stage           PostStage  	    `gorm:"type:varchar(20);not null;default:'XEN'" json:"stage"`
	AssignedJE_ID   *uint           `json:"assigned_je_id"`
	CreatedAt       time.Time		`json:"created_at"`
	UpdatedAt       time.Time		`json:"updated_at"`

	Comments 		[]Comment 		`gorm:"polymorphic:Commentable;" json:"comments"`
}

type WardenPost struct {
	ID              uint            `gorm:"primaryKey;autoIncrement" json:"id"`
	WardenID        uint         	`gorm:"not null" json:"warden_id"`
	Author			Warden			`gorm:"foreignKey:WardenID"`
	RoomNumber      string          `gorm:"type:varchar(50)" json:"room_number" binding:"required"`
	TypeOfPost 	    PostType   	    `gorm:"type:varchar(20);not null" json:"type_of_post" binding:"required"`
	Title           string          `gorm:"not null" json:"title" binding:"required"`
	Description     string          `gorm:"type:text;not null" json:"description" binding:"required"`
	Status          PostStatus 	    `gorm:"type:varchar(20);not null;default:'Pending_XEN'" json:"status"`
	Stage           PostStage  	    `gorm:"type:varchar(20);not null;default:'XEN'" json:"stage"`
	AssignedJE_ID   *uint           `json:"assigned_je_id"`
	CreatedAt       time.Time		`json:"created_at"`
	UpdatedAt       time.Time		`json:"updated_at"`

	Comments 		[]Comment 		`gorm:"polymorphic:Commentable;" json:"comments"`
}

type CentreHeadPost struct {
	ID              uint            `gorm:"primaryKey;autoIncrement" json:"id"`
	CentreHeadID    uint        	`gorm:"not null" json:"centre_head_id"`
	Author			CentreHead		`gorm:"foreignKey:CentreHeadID"`
	TypeOfPost 	    PostType   	    `gorm:"type:varchar(20);not null" json:"type_of_post" binding:"required"`
	Title           string          `gorm:"not null" json:"title" binding:"required"`
	Description     string          `gorm:"type:text;not null" json:"description" binding:"required"`
	Status          PostStatus 	    `gorm:"type:varchar(20);not null;default:'Pending_XEN'" json:"status"`
	Stage           PostStage  	    `gorm:"type:varchar(20);not null;default:'XEN'" json:"stage"`
	AssignedJE_ID   *uint           `json:"assigned_je_id"`
	CreatedAt       time.Time		`json:"created_at"`
	UpdatedAt       time.Time		`json:"updated_at"`

	Comments 		[]Comment 		`gorm:"polymorphic:Commentable;" json:"comments"`
}

type Comment struct {
	ID              uint      		`gorm:"primaryKey;autoIncrement" json:"id"`
	CommentableID	uint			`gorm:"not null"`
	CommentableType string      	`gorm:"not null"`
	Content     	string    		`gorm:"type:text;not null" json:"comment_text"`
	AuthorID		uint			`gorm:"not null" json:"author_id"`
	Author			Admin			`gorm:"foreignKey:AuthorID"`
	CreatedAt       time.Time		`json:"created_at"`
	UpdatedAt		time.Time		`json:"updated_at"`
}
