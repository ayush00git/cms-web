package models

import (
	"time"
)

type CentreName string

const (
	AdminBlock     CentreName = "Admin Block"
	MechWorkshop   CentreName = "Mechanical Workshop"
	ComputerCentre CentreName = "Computer Centre"
)

type CentreHead struct {
	ID          uint         `gorm:"primaryKey;autoIncrement"`
	Name        string       `gorm:"not null"`
	Email       string       `gorm:"uniqueIndex;not null"`
	Centre      CentreName   `gorm:"type:varchar(50);not null"`
	PhoneNumber string       `gorm:"type:char(10);uniqueIndex;not null"`
	IsVerified  bool         `gorm:"default:false"`
	CreatedAt   time.Time
}
