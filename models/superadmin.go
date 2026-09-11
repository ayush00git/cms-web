package models

import (
	"time"
)

type SuperAdmin struct {
	ID              uint            `gorm:"primaryKey;autoIncrement" json:"id"`
	Name			string			`gorm:"not null" json:"name" binding:"required,max=50"`
	Email			string			`gorm:"not null" json:"email" binding:"required,max=255"`
	VisitedAt		time.Time		`json:"visited_at"`
	CreatedAt		time.Time		`json:"created_at"`
}
