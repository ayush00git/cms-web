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

type Complaint struct {
	ID              uint            `gorm:"primaryKey;autoIncrement"`
	Source          ComplaintSource `gorm:"type:varchar(20);not null"`
	FacultyID       *uint           // Link to Faculty
	WardenID        *uint           // Link to Warden
	CentreHeadID    *uint           // Link to CentreHead
	Place           ComplaintPlace  `gorm:"type:varchar(20)"` // Faculty only
	RoomNumber      string          `gorm:"type:varchar(50)"` // Warden only
	TypeOfComplaint ComplaintType   `gorm:"type:varchar(20);not null"`
	Title           string          `gorm:"not null"`
	Description     string          `gorm:"type:text;not null"`
	Status          ComplaintStatus `gorm:"type:varchar(20);not null;default:'Pending_XEN'"`
	Stage           ComplaintStage  `gorm:"type:varchar(20);not null;default:'XEN'"`
	AssignedJE_ID   *uint           // Populated when AE delegates to JE
	CreatedAt       time.Time
	UpdatedAt       time.Time

	Comments []Comment `gorm:"foreignKey:ComplaintID"`
}

type Comment struct {
	ID          uint      `gorm:"primaryKey;autoIncrement"`
	ComplaintID uint      `gorm:"not null"`
	AdminID     uint      `gorm:"not null"`
	CommentText string    `gorm:"type:text;not null"`
	CreatedAt   time.Time
}
