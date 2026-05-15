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
	ID              	uint            	`gorm:"primaryKey;autoIncrement" json:"id"`
	FacultyID       	uint           		`gorm:"not null" json:"faculty_id"`
	Place           	ComplaintPlace  	`gorm:"type:varchar(20);not null" json:"place" binding:"required"`
	TypeOfComplaint 	ComplaintType   	`gorm:"type:varchar(20);not null" json:"type_of_complaint" binding:"required"`
	Title           	string          	`gorm:"type:varchar(50);not null" json:"title" binding:"required"`
	Description     	string          	`gorm:"type:text;not null" json:"description" binding:"required"`
	Status          	ComplaintStatus 	`gorm:"type:varchar(20);not null;default:'Pending_XEN'" json:"status"`
	Stage           	ComplaintStage  	`gorm:"type:varchar(20);not null;default:'XEN'" json:"stage"`
	AssignedJE_ID   	*uint           	`json:"assigned_je_id"`
	CreatedAt       	time.Time			`json:"created_at"`
	UpdatedAt       	time.Time			`json:"updated_at"`

	Comments 			[]Comment 			`gorm:"polymorphic:Commentable;" json:"comments"`
}

type WardenComplaint struct {
	ID              	uint            	`gorm:"primaryKey;autoIncrement" json:"id"`
	WardenID        	uint         	  	`gorm:"not null" json:"warden_id"`
	RoomNumber      	string          	`gorm:"type:varchar(50)" json:"room_number" binding:"required"`
	TypeOfComplaint 	ComplaintType   	`gorm:"type:varchar(20);not null" json:"type_of_complaint" binding:"required"`
	Title           	string          	`gorm:"not null" json:"title" binding:"required"`
	Description     	string          	`gorm:"type:text;not null" json:"description" binding:"required"`
	Status          	ComplaintStatus 	`gorm:"type:varchar(20);not null;default:'Pending_XEN'" json:"status"`
	Stage           	ComplaintStage  	`gorm:"type:varchar(20);not null;default:'XEN'" json:"stage"`
	AssignedJE_ID   	*uint           	`json:"assigned_je_id"`
	CreatedAt       	time.Time			`json:"created_at"`
	UpdatedAt       	time.Time			`json:"updated_at"`

	Comments 			[]Comment 			`gorm:"polymorphic:Commentable;" json:"comments"`
}

type CentreHeadComplaint struct {
	ID              	uint            	`gorm:"primaryKey;autoIncrement" json:"id"`
	CentreHeadID    	uint        	   	`gotm:"" json:"centre_head_id"`
	TypeOfComplaint 	ComplaintType   	`gorm:"type:varchar(20);not null" json:"type_of_complaint" binding:"required"`
	Title           	string          	`gorm:"not null" json:"title" binding:"required"`
	Description     	string          	`gorm:"type:text;not null" json:"description" binding:"required"`
	Status          	ComplaintStatus 	`gorm:"type:varchar(20);not null;default:'Pending_XEN'" json:"status"`
	Stage           	ComplaintStage  	`gorm:"type:varchar(20);not null;default:'XEN'" json:"stage"`
	AssignedJE_ID   	*uint           	`json:"assigned_je_id"`
	CreatedAt       	time.Time			`json:"created_at"`
	UpdatedAt       	time.Time			`json:"updated_at"`

	Comments 			[]Comment 			`gorm:"polymorphic:Commentable;" json:"comments"`
}

type Comment struct {
	ID              	uint      			`gorm:"primaryKey;autoIncrement" json:"id"`
	CommentableID   	uint      			`gorm:"not null" json:"commentable_id"`
	CommentableType 	string    			`gorm:"type:varchar(50);not null" json:"commentable_type"`
	AdminID         	uint      			`gorm:"not null" json:"admin_id"`
	CommentText     	string    			`gorm:"type:text;not null" json:"comment_text"`
	CreatedAt       	time.Time			`json:"created_at"`
}
