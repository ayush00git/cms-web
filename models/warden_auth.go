package models

import (
	"time"
)

type HostelName string
const (
	KBH 		HostelName = "Kailash Boys Hostel"
	HBH 	 	HostelName = "Himadri Boys Hostel"
	Himgiri		HostelName = "Himgiri Boys Hostel"
	UBH 		HostelName = "Udaygiri Boys Hostel"
	NBH 		HostelName = "Neelkanth Boys Hostel"
	DBH 		HostelName = "Dhauladhar Boys Hostel"
	VBH 		HostelName = "Vindhyachal Boys Hostel"
	SBH 		HostelName = "Shivalik Boys Hostel"
	SAT 		HostelName = "Satpura Hostel"
	AGH 		HostelName = "Ambika Girls Hostel"
	PGH 		HostelName = "Parvati Girls Hostel"
	MGH 		HostelName = "Mani-Mahesh Girls Hostel"
	ARG 		HostelName = "Aravali Girls Hostel"
)

type Warden struct {
	ID					uint			`gorm:"primaryKey;autoIncrement" json:"id"`
	Name				string			`gorm:"not null" json:"name"`
	Email				string			`gorm:"uniqueIndex;not null" json:"email"`
	Password			string			`gorm:"not null" json:"password"`
	Hostel				HostelName		`gorm:"type:varchar(30);not null" json:"hostel"`
	PhoneNumber			string			`gorm:"type:char(10);not null" json:"phone_number"`
	Role				string			`gorm:"default:warden" json:"role"`
	IsVerified			bool			`gorm:"default:false" json:"is_verified"`
	CreatedAt			time.Time		`json:"created_at"`
}

type WardenSignup struct {
	Name				string			`json:"name" binding:"required"`
	Email				string			`json:"email" binding:"required"`
	Password			string			`json:"password" binding:"required"`
	Hostel				HostelName		`json:"hostel" binding:"required"`
	PhoneNumber			string			`json:"phone_number" binding:"required"`	
}

type WardenLogin struct {
	Email				string			`json:"email" binding:"required"`
	Password			string			`json:"password" binding:"required"`
}
