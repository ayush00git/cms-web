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
	StatusPendingXEN PostStatus = "Pending_XEN"
	StatusPendingAE  PostStatus = "Pending_AE"
	StatusPendingJE  PostStatus = "Pending_JE"
	StatusResolved   PostStatus = "Resolved"
	StatusRejected   PostStatus = "Rejected"
)

type PostStage string

const (
	StageXEN PostStage = "XEN"
	StageAE  PostStage = "AE"
	StageJE  PostStage = "JE"
)

type FacultyPost struct {
	ID              uint            `gorm:"primaryKey;autoIncrement"`
	FacultyID       *uint           // Link to Faculty
	Place           PostPlace  `gorm:"type:varchar(20)"`
	TypeOfPost PostType   `gorm:"type:varchar(20);not null"`
	Title           string          `gorm:"not null"`
	Description     string          `gorm:"type:text;not null"`
	Status          PostStatus `gorm:"type:varchar(20);not null;default:'Pending_XEN'"`
	Stage           PostStage  `gorm:"type:varchar(20);not null;default:'XEN'"`
	AssignedJE_ID   *uint           // Populated when AE delegates to JE
	CreatedAt       time.Time
	UpdatedAt       time.Time

	Comments []Comment `gorm:"polymorphic:Commentable;"`
}

type WardenPost struct {
	ID              uint            `gorm:"primaryKey;autoIncrement"`
	WardenID        *uint           // Link to Warden
	RoomNumber      string          `gorm:"type:varchar(50)"`
	TypeOfPost PostType   `gorm:"type:varchar(20);not null"`
	Title           string          `gorm:"not null"`
	Description     string          `gorm:"type:text;not null"`
	Status          PostStatus `gorm:"type:varchar(20);not null;default:'Pending_XEN'"`
	Stage           PostStage  `gorm:"type:varchar(20);not null;default:'XEN'"`
	AssignedJE_ID   *uint           // Populated when AE delegates to JE
	CreatedAt       time.Time
	UpdatedAt       time.Time

	Comments []Comment `gorm:"polymorphic:Commentable;"`
}

type CentreHeadPost struct {
	ID              uint            `gorm:"primaryKey;autoIncrement"`
	CentreHeadID    *uint           // Link to CentreHead
	TypeOfPost PostType   `gorm:"type:varchar(20);not null"`
	Title           string          `gorm:"not null"`
	Description     string          `gorm:"type:text;not null"`
	Status          PostStatus `gorm:"type:varchar(20);not null;default:'Pending_XEN'"`
	Stage           PostStage  `gorm:"type:varchar(20);not null;default:'XEN'"`
	AssignedJE_ID   *uint           // Populated when AE delegates to JE
	CreatedAt       time.Time
	UpdatedAt       time.Time

	Comments []Comment `gorm:"polymorphic:Commentable;"`
}

type Comment struct {
	ID              uint      `gorm:"primaryKey;autoIncrement"`
	CommentableID   uint      `gorm:"not null"`
	CommentableType string    `gorm:"type:varchar(50);not null"`
	AdminID         uint      `gorm:"not null"`
	CommentText     string    `gorm:"type:text;not null"`
	CreatedAt       time.Time
}
