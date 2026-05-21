package models

import (
	"time"
)

type BuildingName string

const (
	AdminBlock           BuildingName = "Administrative Block"
	DeansBlock           BuildingName = "Deans' Block"
	LHC                  BuildingName = "Lecture Hall Complex (LHC)"
	CentralLibrary       BuildingName = "Central Library"
	ComputerCentre       BuildingName = "Computer Centre"
	CentralWorkshop      BuildingName = "Central Workshop"
	Auditorium           BuildingName = "Auditorium"
	SAC                  BuildingName = "Student Activity Centre (SAC)"
	OAT                  BuildingName = "Open Air Theatre (OAT)"
	HealthCentre         BuildingName = "Health Centre / Dispensary"
	EstateOffice         BuildingName = "Estate Office Building (housing SBI Bank and Post Office)"
	GuestHouse           BuildingName = "Guest House"
	MeditationCentre     BuildingName = "Meditation Centre"
	CommunityCentre      BuildingName = "Community Centre"
	ConvocationHall      BuildingName = "Convocation Hall"
	SportsComplex        BuildingName = "Sports Complex (Indoor and Outdoor)"
	ConstructionBuilding BuildingName = "Construction Section Building"
	ShoppingComplex      BuildingName = "Shopping Complex (near residential area)"
)

type CentreHead struct {
	ID          uint         `gorm:"primaryKey;autoIncrement" json:"id"`
	Email       string       `gorm:"uniqueIndex;not null" json:"email"`
	Password    string       `gorm:"not null" json:"password"`
	Building    BuildingName `gorm:"type:varchar(100);not null" json:"building"`
	PhoneNumber string       `gorm:"type:char(10);not null" json:"phone_number"`
	IsVerified  bool         `gorm:"default:false" json:"is_verified"`	
	CreatedAt   time.Time	 `json:"created_at"`
}

type CentreHeadSignup struct {
	Email       string       `json:"email" binding:"required"`
	Password    string       `json:"password" binding:"required"`
	Building    BuildingName `json:"building" binding:"required"`
	PhoneNumber string       `json:"phone_number" binding:"required"`
}

type CentreHeadLogin struct {
	Email       string       `json:"email" binding:"required"`
	Password    string       `json:"password" binding:"required"`
}
