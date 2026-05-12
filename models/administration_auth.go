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
	ID          uint         `gorm:"primaryKey;autoIncrement"`
	Password    string       `gorm:"not null"`
	Email       string       `gorm:"uniqueIndex;not null"`
	Building    BuildingName `gorm:"type:varchar(100);not null"`
	PhoneNumber string       `gorm:"type:char(10);uniqueIndex;not null"`
	IsVerified  bool         `gorm:"default:false"`
	CreatedAt   time.Time
}
