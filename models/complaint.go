package models

import (
	"time"
)

type ComplaintSource string

const (
	SourceFaculty    ComplaintSource = "Faculty"
	SourceWarden     ComplaintSource = "Warden"
	SourceCentreHead ComplaintSource = "CentreHead"
)

type ComplaintPlace string

const (
	PlaceResidential  ComplaintPlace = "Residential"
	PlaceDepartmental ComplaintPlace = "Departmental"
)

type ComplaintType string

const (
	TypeCivil      ComplaintType = "Civil"
	TypeElectrical ComplaintType = "Electrical"
)

type ComplaintStatus string

const (
	StatusPendingXEN ComplaintStatus = "Pending_XEN"
	StatusPendingAE  ComplaintStatus = "Pending_AE"
	StatusPendingJE  ComplaintStatus = "Pending_JE"
	StatusResolved   ComplaintStatus = "Resolved"
	StatusRejected   ComplaintStatus = "Rejected"
)

type ComplaintStage string

const (
	StageXEN ComplaintStage = "XEN"
	StageAE  ComplaintStage = "AE"
	StageJE  ComplaintStage = "JE"
)

type FacultyComplaint struct {
	ID              uint            `gorm:"primaryKey;autoIncrement"`
	FacultyID       *uint           // Link to Faculty
	Place           ComplaintPlace  `gorm:"type:varchar(20)"`
	TypeOfComplaint ComplaintType   `gorm:"type:varchar(20);not null"`
	Title           string          `gorm:"not null"`
	Description     string          `gorm:"type:text;not null"`
	Status          ComplaintStatus `gorm:"type:varchar(20);not null;default:'Pending_XEN'"`
	Stage           ComplaintStage  `gorm:"type:varchar(20);not null;default:'XEN'"`
	AssignedJE_ID   *uint           // Populated when AE delegates to JE
	CreatedAt       time.Time
	UpdatedAt       time.Time

	Comments []Comment `gorm:"polymorphic:Commentable;"`
}

type WardenComplaint struct {
	ID              uint            `gorm:"primaryKey;autoIncrement"`
	WardenID        *uint           // Link to Warden
	RoomNumber      string          `gorm:"type:varchar(50)"`
	TypeOfComplaint ComplaintType   `gorm:"type:varchar(20);not null"`
	Title           string          `gorm:"not null"`
	Description     string          `gorm:"type:text;not null"`
	Status          ComplaintStatus `gorm:"type:varchar(20);not null;default:'Pending_XEN'"`
	Stage           ComplaintStage  `gorm:"type:varchar(20);not null;default:'XEN'"`
	AssignedJE_ID   *uint           // Populated when AE delegates to JE
	CreatedAt       time.Time
	UpdatedAt       time.Time

	Comments []Comment `gorm:"polymorphic:Commentable;"`
}

type CentreHeadComplaint struct {
	ID              uint            `gorm:"primaryKey;autoIncrement"`
	CentreHeadID    *uint           // Link to CentreHead
	TypeOfComplaint ComplaintType   `gorm:"type:varchar(20);not null"`
	Title           string          `gorm:"not null"`
	Description     string          `gorm:"type:text;not null"`
	Status          ComplaintStatus `gorm:"type:varchar(20);not null;default:'Pending_XEN'"`
	Stage           ComplaintStage  `gorm:"type:varchar(20);not null;default:'XEN'"`
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
