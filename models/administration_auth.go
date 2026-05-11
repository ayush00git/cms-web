package models

import (
	"time"
)

type BuildingName string

const (
	AdminBlock     BuildingName = "Admin Block"
	MechWorkshop   BuildingName = "Mechanical Workshop"
	ComputerCentre BuildingName = "Computer Centre"
)

type CentreHead struct {
	ID          uint         `gorm:"primaryKey;autoIncrement"`
	Name        string       `gorm:"not null"`
	Email       string       `gorm:"uniqueIndex;not null"`
	Building    BuildingName `gorm:"type:varchar(50);not null"`
	PhoneNumber string       `gorm:"type:char(10);uniqueIndex;not null"`
	IsVerified  bool         `gorm:"default:false"`
	CreatedAt   time.Time
}
