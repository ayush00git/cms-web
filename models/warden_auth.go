package models

import (
	"time"
)

type HostelName string
const (
	// mention all hostel names
)

type Warden struct {
	ID					uint			`gorm:"primaryKey;autoIncrement"`
	Name				string			`gorm:"not null"`
	Email				string			`gorm:"uniqueIndex; not null"`
	Hostel				HostelName		`gorm:"type:text; not null"`
	PhoneNumber			string			`gorm:"uniqueIndex; not null"`
	IsVerified			bool			`gorm:"default:false"`
	CreatedAt			time.Time
}
